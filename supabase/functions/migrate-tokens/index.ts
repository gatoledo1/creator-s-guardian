import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeHex, decodeHex } from "https://deno.land/std@0.208.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY')!;

// AES-256-GCM encryption function
async function encryptToken(plaintext: string): Promise<string> {
  const keyBytes = decodeHex(ENCRYPTION_KEY);
  const key = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(keyBytes).buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encodedText = new TextEncoder().encode(plaintext);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedText
  );
  
  // Combine IV + ciphertext and encode as hex
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return encodeHex(combined);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests with service role key for security
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find all profiles with unencrypted tokens
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, user_id, instagram_access_token, instagram_token_encrypted')
      .not('instagram_access_token', 'is', null)
      .or('instagram_token_encrypted.is.null,instagram_token_encrypted.eq.false');

    if (fetchError) {
      console.error('Error fetching profiles:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch profiles' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${profiles?.length || 0} profiles with unencrypted tokens`);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No unencrypted tokens found',
        migrated: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let migratedCount = 0;
    const errors: string[] = [];

    for (const profile of profiles) {
      try {
        // Skip if token is already encrypted (double check)
        if (profile.instagram_token_encrypted === true) {
          console.log(`Skipping profile ${profile.id}: already encrypted`);
          continue;
        }

        // Encrypt the token
        const encryptedToken = await encryptToken(profile.instagram_access_token);

        // Update the profile with encrypted token
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            instagram_access_token: encryptedToken,
            instagram_token_encrypted: true,
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`Error updating profile ${profile.id}:`, updateError);
          errors.push(`Profile ${profile.id}: ${updateError.message}`);
        } else {
          console.log(`Successfully migrated token for profile ${profile.id}`);
          migratedCount++;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error processing profile ${profile.id}:`, errorMsg);
        errors.push(`Profile ${profile.id}: ${errorMsg}`);
      }
    }

    console.log(`Migration complete: ${migratedCount} tokens migrated, ${errors.length} errors`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Migration complete`,
      migrated: migratedCount,
      total: profiles.length,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Migration error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
