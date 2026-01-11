import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, MessageIntent, MessagePriority } from '@/types/message';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export type ClassificationStatus = 'pending' | 'processing' | 'classified' | 'skipped';

export function useMessages() {
  const { workspace } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingReply, setSendingReply] = useState(false);

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
          sender_instagram_id,
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
          senderInstagramId: msg.sender_instagram_id,
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

  const sendReply = useCallback(async (recipientId: string, message: string, messageId?: string) => {
    if (!message.trim()) {
      toast.error('Digite uma mensagem para enviar');
      return false;
    }

    setSendingReply(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado');
        return false;
      }

      const response = await supabase.functions.invoke('send-instagram-message', {
        body: { recipientId, message, messageId },
      });

      if (response.error) {
        console.error('Send reply error:', response.error);
        toast.error(response.error.message || 'Falha ao enviar mensagem');
        return false;
      }

      if (response.data?.error) {
        console.error('API error:', response.data.error);
        toast.error(response.data.error);
        return false;
      }

      toast.success('Mensagem enviada com sucesso!');
      
      // Mark as read locally
      if (messageId) {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, isRead: true } : m
        ));
      }
      
      return true;
    } catch (err) {
      console.error('Send reply error:', err);
      toast.error('Erro ao enviar mensagem');
      return false;
    } finally {
      setSendingReply(false);
    }
  }, []);

  return { messages, loading, error, counts, stats, markAsRead, sendReply, sendingReply };
}
