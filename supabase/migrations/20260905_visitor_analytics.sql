-- ==============================================================================
-- ROOTIXA COMPLETE ANALYTICS & TOOL USAGE SCHEMA
-- Execute this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/uxvyrqlzhsrizncamjuy/sql/new
-- ==============================================================================

-- 1. Tool Usage Table
create table if not exists public.tool_usage (
  id uuid primary key default gen_random_uuid(),
  tool_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'success' check (status in ('success', 'failure')),
  duration_ms integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists tool_usage_tool_id_idx on public.tool_usage (tool_id);
create index if not exists tool_usage_created_at_idx on public.tool_usage (created_at desc);

-- 2. Raw Page Views Table
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  page_path text not null,
  page_title text,
  referrer text,
  traffic_source text not null default 'Direct',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  device_category text not null default 'Desktop',
  browser text,
  os text,
  country_code text,
  country_name text,
  region text,
  city text,
  duration_seconds integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_visitor_id_idx on public.page_views (visitor_id);
create index if not exists page_views_session_id_idx on public.page_views (session_id);
create index if not exists page_views_page_path_idx on public.page_views (page_path);
create index if not exists page_views_country_code_idx on public.page_views (country_code);
create index if not exists page_views_traffic_source_idx on public.page_views (traffic_source);
create index if not exists page_views_device_category_idx on public.page_views (device_category);

-- 3. Aggregated Visitor Sessions Table (Crucial for Live Visitors)
create table if not exists public.visitor_sessions (
  id text primary key, -- session_id
  visitor_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  is_new_visitor boolean not null default true,
  entry_page text not null,
  exit_page text not null,
  page_views_count integer not null default 1,
  duration_seconds integer not null default 0,
  traffic_source text not null default 'Direct',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_category text not null default 'Desktop',
  browser text,
  os text,
  country_code text,
  country_name text,
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

create index if not exists visitor_sessions_started_at_idx on public.visitor_sessions (started_at desc);
create index if not exists visitor_sessions_last_activity_idx on public.visitor_sessions (last_activity_at desc);
create index if not exists visitor_sessions_visitor_id_idx on public.visitor_sessions (visitor_id);
create index if not exists visitor_sessions_country_idx on public.visitor_sessions (country_code);

-- 4. Enable Row Level Security (RLS)
alter table public.tool_usage enable row level security;
alter table public.page_views enable row level security;
alter table public.visitor_sessions enable row level security;

-- 5. Policies: Service Role (full write/read access)
drop policy if exists "service_role_all_tool_usage" on public.tool_usage;
create policy "service_role_all_tool_usage" on public.tool_usage for all to service_role using (true) with check (true);

drop policy if exists "service_role_all_page_views" on public.page_views;
create policy "service_role_all_page_views" on public.page_views for all to service_role using (true) with check (true);

drop policy if exists "service_role_all_visitor_sessions" on public.visitor_sessions;
create policy "service_role_all_visitor_sessions" on public.visitor_sessions for all to service_role using (true) with check (true);

-- 6. Read Policies: Authenticated active admins can read all analytics
drop policy if exists "admins_select_tool_usage" on public.tool_usage;
create policy "admins_select_tool_usage" on public.tool_usage for select to authenticated
using (
  exists (
    select 1 from public.admins a
    where a.auth_user_id = auth.uid() and a.status = 'active'
  )
);

drop policy if exists "admins_select_page_views" on public.page_views;
create policy "admins_select_page_views" on public.page_views for select to authenticated
using (
  exists (
    select 1 from public.admins a
    where a.auth_user_id = auth.uid() and a.status = 'active'
  )
);

drop policy if exists "admins_select_visitor_sessions" on public.visitor_sessions;
create policy "admins_select_visitor_sessions" on public.visitor_sessions for select to authenticated
using (
  exists (
    select 1 from public.admins a
    where a.auth_user_id = auth.uid() and a.status = 'active'
  )
);
