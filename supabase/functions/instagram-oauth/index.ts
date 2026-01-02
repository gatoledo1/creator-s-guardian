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

      // Instagram Messaging API uses Facebook Login (Graph API permissions)
      const scopes = [
        'instagram_basic',
        'instagram_manage_messages',
        'instagram_manage_comments',
        'pages_show_list',
        'pages_read_engagement',
      ].join(',');

      // Use Facebook OAuth dialog (not instagram.com) to avoid redirect_uri mismatch
      const authUrl = `https://www.facebook.com/dialog/oauth?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}`;

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

      console.log('Exchanging code for token (Facebook OAuth)...');

      // 1) Exchange code for a short-lived user access token
      const tokenUrl = new URL('https://graph.facebook.com/oauth/access_token');
      tokenUrl.search = new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        redirect_uri,
        code,
      }).toString();

      const tokenResponse = await fetch(tokenUrl.toString());
      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData?.error) {
        console.error('Token exchange error:', tokenData?.error || tokenData);
        return new Response(
          JSON.stringify({ error: tokenData?.error?.message || 'Falha ao trocar o código por token' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const shortUserToken: string = tokenData.access_token;

      // 2) Exchange for a long-lived user access token
      const longTokenUrl = new URL('https://graph.facebook.com/oauth/access_token');
      longTokenUrl.search = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        fb_exchange_token: shortUserToken,
      }).toString();

      const longTokenResponse = await fetch(longTokenUrl.toString());
      const longTokenData = await longTokenResponse.json();

      const userAccessToken: string = (longTokenResponse.ok && longTokenData?.access_token)
        ? longTokenData.access_token
        : shortUserToken;

      // 3) Find a connected Facebook Page that has an Instagram Business account
      const pagesResponse = await fetch(
        `https://graph.facebook.com/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(userAccessToken)}`
      );
      const pagesData = await pagesResponse.json();

      if (!pagesResponse.ok || pagesData?.error) {
        console.error('Pages fetch error:', pagesData?.error || pagesData);
        return new Response(
          JSON.stringify({ error: pagesData?.error?.message || 'Não foi possível listar suas páginas do Facebook' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const pageWithIg = (pagesData.data || []).find((p: any) => p?.instagram_business_account?.id);
      if (!pageWithIg) {
        return new Response(
          JSON.stringify({
            error:
              'Nenhuma Página do Facebook com Instagram profissional vinculado foi encontrada. Vincule sua conta profissional a uma Página e tente novamente.',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const pageId: string = pageWithIg.id;
      const pageAccessToken: string = pageWithIg.access_token;
      const igBusinessId: string = pageWithIg.instagram_business_account.id;
      const igUsername: string = pageWithIg.instagram_business_account.username;

      console.log('Instagram business connected:', { pageId, igBusinessId, igUsername });

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Update profile with Instagram data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          instagram_id: igBusinessId,
          instagram_username: igUsername,
          // Store Page access token (required for messaging + Graph API calls)
          instagram_access_token: pageAccessToken,
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
          // Webhook entry.id is the Facebook Page ID
          .update({ instagram_page_id: pageId, name: `@${igUsername}` })
          .eq('id', existingWorkspace.id);
      } else {
        await supabase
          .from('workspaces')
          .insert({
            owner_id: user_id,
            name: `@${igUsername}`,
            instagram_page_id: pageId,
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
