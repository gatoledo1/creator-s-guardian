import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const INSTAGRAM_VERIFY_TOKEN = Deno.env.get('IG_VERIFY_TOKEN')!;

serve(async (req) => {
  // Handle webhook verification (GET request from Meta)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log('Webhook verification:', { mode, token, challenge });

    if (mode === 'subscribe' && token === INSTAGRAM_VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return new Response(challenge, { status: 200 });
    } else {
      console.error('Webhook verification failed');
      return new Response('Forbidden', { status: 403 });
    }
  }

  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle incoming webhook events (POST)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('Webhook received:', JSON.stringify(body, null, 2));

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Process Instagram messaging events
      if (body.object === 'instagram') {
        for (const entry of body.entry || []) {
          const pageId = entry.id;
          console.log('Processing entry for page:', pageId);

          // Find workspace by Instagram page ID
          const { data: workspace } = await supabase
            .from('workspaces')
            .select('id')
            .eq('instagram_page_id', pageId)
            .maybeSingle();

          if (!workspace) {
            console.log('No workspace found for page:', pageId);
            continue;
          }

          console.log('Found workspace:', workspace.id);

          // Collect events from both messaging (standard) and changes (some event types)
          const messagingEvents = entry.messaging || [];
          const changesEvents = entry.changes?.flatMap((c: any) => c.value?.messages || []) || [];
          const allEvents = [...messagingEvents, ...changesEvents];

          console.log('Events to process:', allEvents.length, 'messaging:', messagingEvents.length, 'changes:', changesEvents.length);

          for (const event of allEvents) {
            const senderId = event.sender?.id;
            const messageData = event.message;

            console.log('Event details:', { senderId, hasMessage: !!messageData, pageId });

            if (!messageData || !senderId) {
              console.log('Skipping: no message data or sender');
              continue;
            }

            // Skip messages from the page itself (outgoing messages)
            // sender.id === pageId means the PAGE sent this message, so we ignore
            if (senderId === pageId) {
              console.log('Skipping: outgoing message from page');
              continue;
            }

            console.log('Processing incoming message from:', senderId, 'content:', messageData.text?.substring(0, 50));

            // Insert the message
            const { data: insertedMsg, error: insertError } = await supabase
              .from('messages')
              .insert({
                workspace_id: workspace.id,
                instagram_message_id: messageData.mid,
                sender_instagram_id: senderId,
                content: messageData.text || '[Mídia]',
                received_at: new Date(event.timestamp).toISOString(),
              })
              .select()
              .single();

            if (insertError) {
              console.error('Message insert error:', insertError);
              continue;
            }

            console.log('Message inserted:', insertedMsg.id);

            // Trigger classification asynchronously
            const classifyUrl = `${SUPABASE_URL}/functions/v1/classify-message`;
            fetch(classifyUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({ messageId: insertedMsg.id }),
            }).catch(err => console.error('Classification trigger error:', err));
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Webhook processing error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({ error: message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response('Method not allowed', { status: 405 });
});
