-- Fix security issues from linter

-- 1. Drop the SECURITY DEFINER view and recreate as SECURITY INVOKER (default)
DROP VIEW IF EXISTS public.user_data_export;

CREATE VIEW public.user_data_export AS
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

GRANT SELECT ON public.user_data_export TO authenticated;

-- 2. Fix overly permissive RLS policy for data_access_logs insert
-- Drop the permissive policy and create a more restrictive one
DROP POLICY IF EXISTS "Service can insert access logs" ON public.data_access_logs;

-- Create proper insert policy - users can only insert their own logs
CREATE POLICY "Users can insert own access logs"
ON public.data_access_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Drop the placeholder function (not needed with app-level encryption)
DROP FUNCTION IF EXISTS public.get_encryption_key();