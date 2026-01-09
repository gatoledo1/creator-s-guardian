-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule batch-classify every 4 minutes
SELECT cron.schedule(
  'batch-classify-every-4-min',
  '*/4 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://rwjaslzuxsalsspjqaig.supabase.co/functions/v1/batch-classify',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3amFzbHp1eHNhbHNzcGpxYWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NzMyNTcsImV4cCI6MjA4MjU0OTI1N30.HeQjrln-vQVmg4Msapw2LqVw4tjP1esOKhQMkDQUNP0"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule cleanup-messages daily at 3 AM UTC
SELECT cron.schedule(
  'cleanup-messages-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rwjaslzuxsalsspjqaig.supabase.co/functions/v1/cleanup-messages',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3amFzbHp1eHNhbHNzcGpxYWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NzMyNTcsImV4cCI6MjA4MjU0OTI1N30.HeQjrln-vQVmg4Msapw2LqVw4tjP1esOKhQMkDQUNP0"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule manage-subscriptions daily at 4 AM UTC
SELECT cron.schedule(
  'manage-subscriptions-daily',
  '0 4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rwjaslzuxsalsspjqaig.supabase.co/functions/v1/manage-subscriptions',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3amFzbHp1eHNhbHNzcGpxYWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NzMyNTcsImV4cCI6MjA4MjU0OTI1N30.HeQjrln-vQVmg4Msapw2LqVw4tjP1esOKhQMkDQUNP0"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);