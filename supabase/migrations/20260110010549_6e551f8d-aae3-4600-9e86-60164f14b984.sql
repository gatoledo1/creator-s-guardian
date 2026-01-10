-- Fix Security Definer View issue by using explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.user_data_export;

-- Create view with explicit SECURITY INVOKER
CREATE VIEW public.user_data_export 
WITH (security_invoker = on)
AS
SELECT 
  p.user_id,
  p.display_name,
  p.instagram_username,
  p.created_at as profile_created_at,
  p.lgpd_consent_at,
  p.data_retention_days,
  w.name as workspace_name,
  w.created_at as workspace_created_at
FROM profiles p
LEFT JOIN workspaces w ON w.owner_id = p.user_id
WHERE p.user_id = auth.uid();

GRANT SELECT ON public.user_data_export TO authenticated;