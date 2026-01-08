import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const GRACE_PERIOD_DAYS = 7;
const DELETION_AFTER_DAYS = 30;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    
    console.log('Managing subscriptions at', now.toISOString());
    
    let updatedToGrace = 0;
    let updatedToBlocked = 0;
    let markedForDeletion = 0;
    let deletedAccounts = 0;
    
    // 1. Active subscriptions that expired -> move to grace_period
    const { data: expiredActive, error: err1 } = await supabase
      .from('subscriptions')
      .select('id, user_id, expires_at')
      .eq('status', 'active')
      .lt('expires_at', now.toISOString());
    
    if (err1) console.error('Error fetching expired active:', err1);
    
    for (const sub of expiredActive || []) {
      const gracePeriodUntil = new Date(sub.expires_at);
      gracePeriodUntil.setDate(gracePeriodUntil.getDate() + GRACE_PERIOD_DAYS);
      
      await supabase
        .from('subscriptions')
        .update({
          status: 'grace_period',
          grace_period_until: gracePeriodUntil.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', sub.id);
      
      console.log(`Subscription ${sub.id} moved to grace period until ${gracePeriodUntil.toISOString()}`);
      updatedToGrace++;
    }
    
    // 2. Grace period subscriptions that expired -> move to blocked
    const { data: expiredGrace, error: err2 } = await supabase
      .from('subscriptions')
      .select('id, user_id, grace_period_until')
      .eq('status', 'grace_period')
      .lt('grace_period_until', now.toISOString());
    
    if (err2) console.error('Error fetching expired grace:', err2);
    
    for (const sub of expiredGrace || []) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'blocked',
          blocked_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', sub.id);
      
      console.log(`Subscription ${sub.id} moved to blocked`);
      updatedToBlocked++;
    }
    
    // 3. Blocked accounts for 30+ days -> mark for deletion
    const blockedCutoff = new Date(now);
    blockedCutoff.setDate(blockedCutoff.getDate() - DELETION_AFTER_DAYS);
    
    const { data: oldBlocked, error: err3 } = await supabase
      .from('subscriptions')
      .select('id, user_id, blocked_at')
      .eq('status', 'blocked')
      .lt('blocked_at', blockedCutoff.toISOString())
      .is('marked_for_deletion_at', null);
    
    if (err3) console.error('Error fetching old blocked:', err3);
    
    for (const sub of oldBlocked || []) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'pending_deletion',
          marked_for_deletion_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', sub.id);
      
      console.log(`Subscription ${sub.id} marked for deletion`);
      markedForDeletion++;
    }
    
    // 4. Delete accounts marked for deletion (immediate - the 30 days already passed)
    const { data: pendingDeletion, error: err4 } = await supabase
      .from('subscriptions')
      .select('id, user_id')
      .eq('status', 'pending_deletion');
    
    if (err4) console.error('Error fetching pending deletion:', err4);
    
    for (const sub of pendingDeletion || []) {
      console.log(`Deleting account data for user ${sub.user_id}`);
      
      // Delete user's workspaces (messages will cascade)
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', sub.user_id);
      
      for (const ws of workspaces || []) {
        // Delete classifications for workspace messages
        const { data: msgs } = await supabase
          .from('messages')
          .select('id')
          .eq('workspace_id', ws.id);
        
        if (msgs && msgs.length > 0) {
          await supabase
            .from('classifications')
            .delete()
            .in('message_id', msgs.map(m => m.id));
          
          await supabase
            .from('messages')
            .delete()
            .eq('workspace_id', ws.id);
        }
        
        await supabase
          .from('workspaces')
          .delete()
          .eq('id', ws.id);
      }
      
      // Delete profile
      await supabase
        .from('profiles')
        .delete()
        .eq('user_id', sub.user_id);
      
      // Delete subscription
      await supabase
        .from('subscriptions')
        .delete()
        .eq('id', sub.id);
      
      // Note: We don't delete from auth.users here as it requires admin API
      // The user record will remain but with no data
      
      deletedAccounts++;
      console.log(`Account data deleted for user ${sub.user_id}`);
    }
    
    const summary = {
      updatedToGrace,
      updatedToBlocked,
      markedForDeletion,
      deletedAccounts,
      timestamp: now.toISOString()
    };
    
    console.log('Subscription management complete:', summary);
    
    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in manage-subscriptions:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
