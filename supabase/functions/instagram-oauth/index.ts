import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const INSTAGRAM_APP_ID = Deno.env.get('INSTAGRAM_APP_ID')!;
const INSTAGRAM_APP_SECRET = Deno.env.get('INSTAGRAM_APP_SECRET')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Action: Get OAuth URL
    if (action === 'get_auth_url') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const redirectUri = url.searchParams.get('redirect_uri');
      if (!redirectUri) {
        return new Response(JSON.stringify({ error: 'redirect_uri is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const scopes = [
        'instagram_business_basic',
        'instagram_business_manage_messages',
        'instagram_business_manage_comments',
      ].join(',');

      const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}`;

      console.log('Generated OAuth URL for redirect:', redirectUri);

      return new Response(JSON.stringify({ auth_url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: Exchange code for token
    if (action === 'exchange_token') {
      const body = await req.json();
      const { code, redirect_uri, user_id } = body;

      if (!code || !redirect_uri || !user_id) {
        return new Response(JSON.stringify({ error: 'code, redirect_uri and user_id are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Exchanging code for token...');

      // Exchange code for short-lived token
      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: INSTAGRAM_APP_ID,
          client_secret: INSTAGRAM_APP_SECRET,
          grant_type: 'authorization_code',
          redirect_uri,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log('Token exchange response:', JSON.stringify(tokenData));

      if (tokenData.error) {
        return new Response(JSON.stringify({ error: tokenData.error_message || tokenData.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { access_token: shortToken, user_id: igUserId } = tokenData;

      // Exchange for long-lived token
      const longTokenResponse = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${shortToken}`
      );
      const longTokenData = await longTokenResponse.json();
      console.log('Long-lived token response:', JSON.stringify(longTokenData));

      const longLivedToken = longTokenData.access_token || shortToken;

      // Get user profile
      const profileResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${longLivedToken}`
      );
      const profileData = await profileResponse.json();
      console.log('Profile data:', JSON.stringify(profileData));

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Update profile with Instagram data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          instagram_id: igUserId,
          instagram_username: profileData.username,
          instagram_access_token: longLivedToken,
        })
        .eq('user_id', user_id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        return new Response(JSON.stringify({ error: 'Failed to save Instagram connection' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create or update workspace
      const { data: existingWorkspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user_id)
        .maybeSingle();

      if (existingWorkspace) {
        await supabase
          .from('workspaces')
          .update({ instagram_page_id: igUserId })
          .eq('id', existingWorkspace.id);
      } else {
        await supabase
          .from('workspaces')
          .insert({
            owner_id: user_id,
            name: `@${profileData.username}`,
            instagram_page_id: igUserId,
          });
      }

      console.log('Instagram connected successfully for user:', user_id);

      return new Response(JSON.stringify({ 
        success: true,
        username: profileData.username,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OAuth error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
