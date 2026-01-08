import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const BATCH_WINDOW_MINUTES = 4;

// Pre-checks to skip AI classification
function shouldSkipClassification(content: string): { skip: boolean; reason?: string } {
  const trimmed = content.trim();
  
  // Only emojis
  const emojiOnlyRegex = /^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}\s]+$/u;
  if (emojiOnlyRegex.test(trimmed)) {
    return { skip: true, reason: 'emoji_only' };
  }
  
  // Very short messages (less than 3 words)
  const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 3 && trimmed.length < 15) {
    return { skip: true, reason: 'too_short' };
  }
  
  // Common short responses
  const commonShort = /^(ok|sim|não|nao|obrigado|obrigada|valeu|vlw|tmj|top|show|boa|blz|kk+|haha+|rs+|kkk+|legal|massa|dahora|brigado|brigada|❤️|👍|🙏|😊|🔥|💯)$/i;
  if (commonShort.test(trimmed)) {
    return { skip: true, reason: 'common_response' };
  }
  
  return { skip: false };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Find conversations with pending messages older than batch window
    const cutoffTime = new Date(Date.now() - BATCH_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    const { data: pendingMessages, error: fetchError } = await supabase
      .from('messages')
      .select('id, content, sender_instagram_id, sender_name, sender_username, sender_followers_count, workspace_id, conversation_id')
      .eq('classification_status', 'pending')
      .lte('received_at', cutoffTime)
      .order('received_at', { ascending: true })
      .limit(50);
    
    if (fetchError) {
      console.error('Error fetching pending messages:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch messages' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!pendingMessages || pendingMessages.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: 'No pending messages' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing ${pendingMessages.length} pending messages`);
    
    // Group by conversation
    const conversations = new Map<string, typeof pendingMessages>();
    for (const msg of pendingMessages) {
      const key = msg.conversation_id || msg.sender_instagram_id;
      if (!conversations.has(key)) {
        conversations.set(key, []);
      }
      conversations.get(key)!.push(msg);
    }
    
    let processedCount = 0;
    let skippedCount = 0;
    const results: any[] = [];
    
    for (const [conversationId, msgs] of conversations) {
      // Mark as processing
      const messageIds = msgs.map(m => m.id);
      await supabase
        .from('messages')
        .update({ classification_status: 'processing' })
        .in('id', messageIds);
      
      // Check for repeated messages in this conversation
      const contentCounts = new Map<string, number>();
      for (const msg of msgs) {
        const normalized = msg.content.toLowerCase().trim();
        contentCounts.set(normalized, (contentCounts.get(normalized) || 0) + 1);
      }
      
      // Process each message
      for (const msg of msgs) {
        const skipCheck = shouldSkipClassification(msg.content);
        const normalized = msg.content.toLowerCase().trim();
        const isRepeated = (contentCounts.get(normalized) || 0) > 1;
        
        if (skipCheck.skip || isRepeated) {
          // Skip - classify as fan with low priority
          await supabase.from('classifications').upsert({
            message_id: msg.id,
            intent: 'fan',
            priority: 'ignore',
            suggested_reply: null,
            confidence: 1.0
          });
          
          await supabase
            .from('messages')
            .update({ classification_status: 'skipped' })
            .eq('id', msg.id);
          
          skippedCount++;
          continue;
        }
        
        // Call OpenAI for this message
        try {
          const systemPrompt = `Você é um assistente que classifica mensagens de DM do Instagram para criadores de conteúdo.

Classifique a mensagem em:
- intent: "partnership" (proposta de parceria/publi), "fan" (fã/elogio), "question" (dúvida sobre conteúdo), "hate" (hate/crítica), "spam" (spam/vendas)
- priority: "respond_now" (responder urgente - parcerias, dúvidas importantes), "can_wait" (pode esperar - fãs), "ignore" (pode ignorar - spam, hate)
- suggested_reply: Uma sugestão curta de resposta em português (ou null se for spam/hate)

Considere:
- Quantidade de seguidores do remetente: ${msg.sender_followers_count || 'desconhecido'}
- Nome: ${msg.sender_name || msg.sender_username || 'desconhecido'}

Responda APENAS em JSON válido.`;

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Mensagem: "${msg.content}"` }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.3,
              max_tokens: 300,
            }),
          });

          if (!response.ok) {
            console.error('OpenAI error for message', msg.id);
            continue;
          }

          const aiData = await response.json();
          const classification = JSON.parse(aiData.choices[0].message.content);

          await supabase.from('classifications').upsert({
            message_id: msg.id,
            intent: classification.intent,
            priority: classification.priority,
            suggested_reply: classification.suggested_reply,
            confidence: 0.85
          });

          await supabase
            .from('messages')
            .update({ classification_status: 'classified' })
            .eq('id', msg.id);

          processedCount++;
          results.push({ id: msg.id, ...classification });
          
        } catch (err) {
          console.error('Error processing message', msg.id, err);
        }
      }
    }
    
    console.log(`Batch complete: ${processedCount} classified, ${skippedCount} skipped`);
    
    return new Response(
      JSON.stringify({ 
        processed: processedCount, 
        skipped: skippedCount,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in batch-classify:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
