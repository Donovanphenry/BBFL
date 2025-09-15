CREATE extension IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'weekly_picks_update',
  '0 8 * * 2',
  'select update_week_results();'
);
CREATE extension IF NOT EXISTS pg_cron;
