import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decodeHex } from "https://deno.land/std@0.208.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY')!;

// AES-256-GCM decryption function
async function decryptToken(encryptedHex: string): Promise<string> {
  const keyBytes = decodeHex(ENCRYPTION_KEY);
  const key = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(keyBytes).buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  const combined = decodeHex(encryptedHex);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  return new TextDecoder().decode(decrypted);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { recipientId, message, messageId } = body;

    if (!recipientId || !message) {
      return new Response(JSON.stringify({ error: 'recipientId and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Sending message to:', recipientId, 'Message:', message.substring(0, 50));

    // Get user's Instagram access token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('instagram_access_token, instagram_token_encrypted, instagram_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.instagram_access_token) {
      console.error('Profile error:', profileError);
      return new Response(JSON.stringify({ error: 'Instagram não conectado' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decrypt token if encrypted
    let accessToken = profile.instagram_access_token;
    if (profile.instagram_token_encrypted) {
      accessToken = await decryptToken(profile.instagram_access_token);
      console.log('Token decrypted successfully');
    }

    // Send message via Instagram API
    // Using the Instagram Graph API Send API
    const instagramUserId = profile.instagram_id;
    const sendUrl = `https://graph.instagram.com/v24.0/${instagramUserId}/messages`;
    
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        recipient: {
          id: recipientId,
        },
        message: {
          text: message,
        },
      }),
    });

    const responseData = await response.json();
    console.log('Instagram API response:', response.status, JSON.stringify(responseData));

    if (!response.ok) {
      console.error('Instagram API error:', responseData);
      return new Response(JSON.stringify({ 
        error: responseData.error?.message || 'Falha ao enviar mensagem',
        details: responseData.error,
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If messageId provided, mark the original message as read
    if (messageId) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    }

    console.log('Message sent successfully:', responseData.message_id);

    return new Response(JSON.stringify({ 
      success: true,
      messageId: responseData.message_id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Send message error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
