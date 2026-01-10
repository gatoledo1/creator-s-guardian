-- =============================================
-- LGPD Security Enhancement Migration
-- =============================================

-- 1. Add consent and retention columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lgpd_consent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS lgpd_consent_version TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_retention_days INTEGER DEFAULT 30 CHECK (data_retention_days >= 7 AND data_retention_days <= 30),
ADD COLUMN IF NOT EXISTS instagram_token_encrypted BOOLEAN DEFAULT false;

-- 2. Create audit log table for sensitive data access
CREATE TABLE IF NOT EXISTS public.data_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;

-- Only the user can see their own access logs
CREATE POLICY "Users can view own access logs" 
ON public.data_access_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Service role can insert (from edge functions)
CREATE POLICY "Service can insert access logs"
ON public.data_access_logs
FOR INSERT
WITH CHECK (true);

-- 3. Create function to get encryption key (stored in vault)
CREATE OR REPLACE FUNCTION public.get_encryption_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This is a placeholder - in production, use Supabase Vault
  -- For now, we'll use a derived key from a secret
  RETURN NULL;
END;
$$;

-- 4. Add index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_messages_cleanup 
ON public.messages (workspace_id, is_read, received_at);

-- 5. Create view for LGPD data export
CREATE OR REPLACE VIEW public.user_data_export AS
SELECT 
  p.user_id,
  p.display_name,
  p.instagram_username,
  p.created_at as profile_created_at,
  p.lgpd_consent_at,
  p.data_retention_days,
  w.name as workspace_name,
  w.created_at as workspace_created_at,
  (SELECT COUNT(*) FROM messages m WHERE m.workspace_id = w.id) as total_messages
FROM profiles p
LEFT JOIN workspaces w ON w.owner_id = p.user_id
WHERE p.user_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON public.user_data_export TO authenticated;