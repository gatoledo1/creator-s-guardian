import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Calculate cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    console.log(`Cleaning up read messages older than ${cutoffDate.toISOString()}`);
    
    // Delete classifications for old messages first (FK constraint)
    const { data: oldMessages, error: fetchError } = await supabase
      .from('messages')
      .select('id')
      .eq('is_read', true)
      .lt('received_at', cutoffDate.toISOString());
    
    if (fetchError) {
      console.error('Error fetching old messages:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch messages' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!oldMessages || oldMessages.length === 0) {
      console.log('No messages to clean up');
      return new Response(
        JSON.stringify({ deleted: 0, message: 'No messages to clean up' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const messageIds = oldMessages.map(m => m.id);
    console.log(`Found ${messageIds.length} messages to delete`);
    
    // Delete classifications first
    const { error: classDeleteError } = await supabase
      .from('classifications')
      .delete()
      .in('message_id', messageIds);
    
    if (classDeleteError) {
      console.error('Error deleting classifications:', classDeleteError);
    }
    
    // Delete messages
    const { error: msgDeleteError, count } = await supabase
      .from('messages')
      .delete()
      .in('id', messageIds);
    
    if (msgDeleteError) {
      console.error('Error deleting messages:', msgDeleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete messages' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Successfully deleted ${messageIds.length} messages`);
    
    return new Response(
      JSON.stringify({ 
        deleted: messageIds.length,
        message: `Cleaned up ${messageIds.length} read messages older than 30 days`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in cleanup-messages:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
