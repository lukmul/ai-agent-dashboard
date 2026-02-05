-- Seed Test Data for AI Agent Dashboard
-- Spusť tento script v Supabase SQL Editor

-- 1. Vytvoř testovací projekt
INSERT INTO projects (
  id,
  name,
  github_repo,
  user_id,
  created_at,
  updated_at,
  last_synced_at
) VALUES (
  gen_random_uuid(),
  'Test Project',
  'lukmul/ai-agent-dashboard',
  'CLERK_USER_ID_PLACEHOLDER', -- ZMĚŇ na své Clerk User ID!
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- 2. Vytvoř ukázkové agent metriky
WITH test_project AS (
  SELECT id FROM projects WHERE name = 'Test Project' LIMIT 1
)
INSERT INTO agent_metrics (
  id,
  project_id,
  agent_name,
  total_runs,
  successful_runs,
  failed_runs,
  success_rate,
  avg_duration_seconds,
  last_run,
  trend,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  test_project.id,
  agent_data.name,
  agent_data.total,
  agent_data.successful,
  agent_data.failed,
  agent_data.success_rate,
  agent_data.avg_duration,
  NOW() - (agent_data.days_ago || ' days')::interval,
  agent_data.trend,
  NOW(),
  NOW()
FROM test_project,
LATERAL (VALUES
  ('code-reviewer', 150, 145, 5, 96.67, 2.5, 1, 'improving'),
  ('security-reviewer', 80, 78, 2, 97.50, 3.2, 2, 'stable'),
  ('tdd-guide', 120, 110, 10, 91.67, 5.1, 0, 'regressing'),
  ('build-error-resolver', 45, 42, 3, 93.33, 1.8, 3, 'improving'),
  ('planner', 30, 28, 2, 93.33, 8.5, 5, 'stable')
) AS agent_data(name, total, successful, failed, success_rate, avg_duration, days_ago, trend)
ON CONFLICT DO NOTHING;

-- 3. Vytvoř ukázkové memory entries
WITH test_project AS (
  SELECT id FROM projects WHERE name = 'Test Project' LIMIT 1
)
INSERT INTO memory_entries (
  id,
  project_id,
  agent_name,
  session_id,
  entry_type,
  content,
  metadata,
  created_at
)
SELECT
  gen_random_uuid(),
  test_project.id,
  'code-reviewer',
  'session-' || generate_series,
  'observation',
  'Found ' || (RANDOM() * 10)::int || ' code issues',
  jsonb_build_object(
    'severity', (ARRAY['low', 'medium', 'high'])[FLOOR(RANDOM() * 3 + 1)],
    'file_count', (RANDOM() * 5 + 1)::int
  ),
  NOW() - (generate_series || ' hours')::interval
FROM test_project,
generate_series(1, 10)
ON CONFLICT DO NOTHING;

-- Ověř výsledek
SELECT
  'Projects' as table_name,
  COUNT(*) as count
FROM projects
UNION ALL
SELECT
  'Agent Metrics' as table_name,
  COUNT(*) as count
FROM agent_metrics
UNION ALL
SELECT
  'Memory Entries' as table_name,
  COUNT(*) as count
FROM memory_entries;
