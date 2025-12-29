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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageId } = await req.json();

    if (!messageId) {
      return new Response(
        JSON.stringify({ error: 'messageId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .maybeSingle();

    if (msgError || !message) {
      console.error('Message fetch error:', msgError);
      return new Response(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip classification for very short messages
    const content = message.content.trim();
    if (content.length < 5 || /^(ok|sim|não|obrigado|👍|❤️|😊|🙏)$/i.test(content)) {
      const { error: insertError } = await supabase
        .from('classifications')
        .upsert({
          message_id: messageId,
          intent: 'fan',
          priority: 'ignore',
          suggested_reply: null,
          confidence: 1.0
        });

      if (insertError) console.error('Classification insert error:', insertError);

      return new Response(
        JSON.stringify({ intent: 'fan', priority: 'ignore', suggested_reply: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenAI for classification
    const systemPrompt = `Você é um assistente que classifica mensagens de DM do Instagram para criadores de conteúdo.

Classifique a mensagem em:
- intent: "partnership" (proposta de parceria/publi), "fan" (fã/elogio), "question" (dúvida sobre conteúdo), "hate" (hate/crítica), "spam" (spam/vendas)
- priority: "respond_now" (responder urgente - parcerias, dúvidas importantes), "can_wait" (pode esperar - fãs), "ignore" (pode ignorar - spam, hate)
- suggested_reply: Uma sugestão curta de resposta em português (ou null se for spam/hate)

Considere:
- Quantidade de seguidores do remetente: ${message.sender_followers_count || 'desconhecido'}
- Nome: ${message.sender_name || message.sender_username || 'desconhecido'}

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
          { role: 'user', content: `Mensagem: "${content}"` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI classification failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const classification = JSON.parse(aiData.choices[0].message.content);

    console.log('Classification result:', classification);

    // Save classification
    const { error: classError } = await supabase
      .from('classifications')
      .upsert({
        message_id: messageId,
        intent: classification.intent,
        priority: classification.priority,
        suggested_reply: classification.suggested_reply,
        confidence: 0.85
      });

    if (classError) {
      console.error('Classification save error:', classError);
    }

    return new Response(
      JSON.stringify(classification),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-message:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
