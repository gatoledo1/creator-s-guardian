import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SubscriptionStatus = 'active' | 'grace_period' | 'blocked' | 'pending_deletion' | 'none';

interface Subscription {
  id: string;
  status: SubscriptionStatus;
  expires_at: string;
  grace_period_until: string | null;
  blocked_at: string | null;
  plan: string;
  mercadopago_subscription_id: string | null;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  status: SubscriptionStatus;
  loading: boolean;
  isLoading: boolean;
  daysRemaining: number | null;
  graceDaysRemaining: number | null;
  isReadOnly: boolean;
  isBlocked: boolean;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user?.id) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
    }

    setSubscription(data as Subscription | null);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  const status: SubscriptionStatus = subscription?.status || 'none';
  
  const daysRemaining = subscription?.expires_at 
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const graceDaysRemaining = subscription?.grace_period_until
    ? Math.max(0, Math.ceil((new Date(subscription.grace_period_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isReadOnly = status === 'grace_period';
  const isBlocked = status === 'blocked' || status === 'pending_deletion';

  return {
    subscription,
    status,
    loading,
    isLoading: loading,
    daysRemaining,
    graceDaysRemaining,
    isReadOnly,
    isBlocked,
    refetch: fetchSubscription
  };
}
