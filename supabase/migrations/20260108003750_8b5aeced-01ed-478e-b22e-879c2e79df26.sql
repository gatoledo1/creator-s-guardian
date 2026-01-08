-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'grace_period', 'blocked', 'pending_deletion');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    status subscription_status NOT NULL DEFAULT 'active',
    plan TEXT NOT NULL DEFAULT 'monthly',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    grace_period_until TIMESTAMP WITH TIME ZONE,
    blocked_at TIMESTAMP WITH TIME ZONE,
    marked_for_deletion_at TIMESTAMP WITH TIME ZONE,
    mercadopago_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Add classification_status to messages
ALTER TABLE public.messages 
ADD COLUMN classification_status TEXT NOT NULL DEFAULT 'pending' 
CHECK (classification_status IN ('pending', 'processing', 'classified', 'skipped'));

-- Add conversation_id to messages for batch grouping
ALTER TABLE public.messages
ADD COLUMN conversation_id TEXT GENERATED ALWAYS AS (sender_instagram_id || '-' || workspace_id) STORED;

-- Create index for batch processing
CREATE INDEX idx_messages_classification_pending ON public.messages (workspace_id, classification_status, received_at) 
WHERE classification_status = 'pending';

-- Create index for cleanup
CREATE INDEX idx_messages_cleanup ON public.messages (is_read, received_at) 
WHERE is_read = true;

-- Trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();