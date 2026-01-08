import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, MessageIntent, MessagePriority } from '@/types/message';
import { useWorkspace } from './useWorkspace';

export type ClassificationStatus = 'pending' | 'processing' | 'classified' | 'skipped';

export function useMessages() {
  const { workspace } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspace?.id) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_name,
          sender_username,
          sender_avatar_url,
          sender_followers_count,
          is_read,
          received_at,
          classification_status,
          classifications (
            intent,
            priority,
            suggested_reply
          )
        `)
        .eq('workspace_id', workspace.id)
        .order('received_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching messages:', fetchError);
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const transformedMessages: Message[] = (data || []).map((msg) => {
        const classification = Array.isArray(msg.classifications) 
          ? msg.classifications[0] 
          : msg.classifications;
        const intent = (classification?.intent as MessageIntent) || 'question';
        const priority = classification?.priority === 'respond_now' ? 'high' 
          : classification?.priority === 'can_wait' ? 'medium' : 'low';
        
        const classificationStatus = (msg.classification_status || 'pending') as ClassificationStatus;

        return {
          id: msg.id,
          author: {
            name: msg.sender_name || 'Usuário Instagram',
            username: msg.sender_username || 'instagram_user',
            avatar: msg.sender_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.id}`,
            followers: msg.sender_followers_count || undefined,
          },
          content: msg.content,
          intent,
          priority,
          channel: 'instagram' as const,
          timestamp: new Date(msg.received_at),
          isRead: msg.is_read ?? false,
          suggestedReply: classification?.suggested_reply || undefined,
          isOpportunity: intent === 'partnership' || priority === 'high',
          classificationStatus,
        };
      });

      setMessages(transformedMessages);
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `workspace_id=eq.${workspace.id}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          // Refetch to get classification data
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `workspace_id=eq.${workspace.id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace?.id]);

  const counts = useMemo(() => ({
    all: messages.length,
    opportunities: messages.filter(m => m.isOpportunity).length,
    partnership: messages.filter(m => m.intent === 'partnership').length,
    question: messages.filter(m => m.intent === 'question').length,
    fan: messages.filter(m => m.intent === 'fan').length,
    hate: messages.filter(m => m.intent === 'hate').length,
    spam: messages.filter(m => m.intent === 'spam').length,
  }), [messages]);

  const stats = useMemo(() => ({
    totalMessages: messages.length,
    unreadCount: messages.filter(m => !m.isRead).length,
    opportunityCount: messages.filter(m => m.isOpportunity).length,
    avgResponseTime: '—',
  }), [messages]);

  const markAsRead = async (messageId: string) => {
    const { error: updateError } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (!updateError) {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isRead: true } : m
      ));
    }
  };

  return { messages, loading, error, counts, stats, markAsRead };
}
