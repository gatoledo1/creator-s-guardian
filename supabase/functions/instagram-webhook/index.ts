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

          for (const messaging of entry.messaging || []) {
            const senderId = messaging.sender?.id;
            const messageData = messaging.message;

            if (!messageData || !senderId) continue;

            // Skip messages from the page itself (outgoing)
            if (senderId === pageId) continue;

            console.log('Processing message from:', senderId);

            // Insert the message
            const { data: insertedMsg, error: insertError } = await supabase
              .from('messages')
              .insert({
                workspace_id: workspace.id,
                instagram_message_id: messageData.mid,
                sender_instagram_id: senderId,
                content: messageData.text || '[Mídia]',
                received_at: new Date(messaging.timestamp).toISOString(),
              })
              .select()
              .single();

            if (insertError) {
              console.error('Message insert error:', insertError);
              continue;
            }

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
