-- Tool Usage Tracking Foundation
-- Minimum foundation for recording and aggregating tool operations across Rootixa

create table if not exists public.tool_usage (
  id uuid primary key default gen_random_uuid(),
  tool_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'success' check (status in ('success', 'failure')),
  duration_ms integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists tool_usage_tool_id_idx on public.tool_usage (tool_id);
create index if not exists tool_usage_created_at_idx on public.tool_usage (created_at);
