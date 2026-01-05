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

      // Instagram API with Instagram Login - NEW scopes (effective Jan 27, 2025)
      // This flow does NOT require a Facebook Page linked to the Instagram account
      const scopes = [
        'instagram_business_basic',
        'instagram_business_manage_messages',
        'instagram_business_manage_comments',
      ].join(',');

      // Use Instagram OAuth endpoint (api.instagram.com) - NOT facebook.com
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}`;

      console.log('Generated Instagram OAuth URL for redirect:', redirectUri);
      console.log('Auth URL:', authUrl);

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

      console.log('Exchanging code for Instagram token...');
      console.log('Redirect URI:', redirect_uri);

      // 1) Exchange code for short-lived access token using Instagram API
      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: INSTAGRAM_APP_ID,
          client_secret: INSTAGRAM_APP_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: redirect_uri,
          code: code,
        }).toString(),
      });

      const tokenData = await tokenResponse.json();
      console.log('Token response status:', tokenResponse.status);

      if (!tokenResponse.ok || tokenData?.error_type) {
        console.error('Token exchange error:', tokenData);
        return new Response(
          JSON.stringify({ 
            error: tokenData?.error_message || tokenData?.error_type || 'Falha ao trocar o código por token' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const shortLivedToken: string = tokenData.access_token;
      const instagramUserId: string = tokenData.user_id?.toString();

      if (!instagramUserId) {
        console.error('No user_id in token response');
        return new Response(
          JSON.stringify({ error: 'Instagram não retornou o user_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Short-lived token obtained for user:', instagramUserId);

      // 2) Fetch user profile using the specific user ID endpoint (NOT /me)
      // For Instagram API with Instagram Login, /me doesn't work - we must use /{user-id}
      const accessToken = shortLivedToken;

      console.log('Fetching profile with user ID endpoint:', instagramUserId);

      const profileResponse = await fetch(
        `https://graph.instagram.com/v24.0/${instagramUserId}?fields=id,username,name&access_token=${encodeURIComponent(accessToken)}`
      );
      const profileData = await profileResponse.json();

      console.log('Profile response status:', profileResponse.status);
      console.log('Profile data:', JSON.stringify(profileData));

      // If fetching profile fails, we still have the user_id from token - use it directly
      let igUsername: string;
      let igId: string = instagramUserId;

      if (!profileResponse.ok || profileData?.error) {
        console.warn('Profile fetch failed, using user_id from token:', profileData?.error);
        // We can still proceed - we have the user_id, just not the username
        igUsername = `user_${instagramUserId}`;
      } else {
        igUsername = profileData.username || `user_${instagramUserId}`;
        igId = profileData.id || instagramUserId;
      }

      console.log('Instagram profile:', { igId, igUsername });

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Update profile with Instagram data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          instagram_id: igId,
          instagram_username: igUsername,
          instagram_access_token: accessToken,
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
          .update({ instagram_page_id: igId, name: `@${igUsername}` })
          .eq('id', existingWorkspace.id);
      } else {
        await supabase
          .from('workspaces')
          .insert({
            owner_id: user_id,
            name: `@${igUsername}`,
            instagram_page_id: igId,
          });
      }

      console.log('Instagram connected successfully for user:', user_id);

      return new Response(JSON.stringify({ 
        success: true,
        username: igUsername,
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
