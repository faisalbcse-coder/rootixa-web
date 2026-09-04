-- Rootixa Visitor Analytics Schema
-- Provides dual-table foundation for raw page views and session aggregation

-- 1. Raw Page Views
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

-- Indexes for performance
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_visitor_id_idx on public.page_views (visitor_id);
create index if not exists page_views_session_id_idx on public.page_views (session_id);
create index if not exists page_views_page_path_idx on public.page_views (page_path);
create index if not exists page_views_country_code_idx on public.page_views (country_code);
create index if not exists page_views_traffic_source_idx on public.page_views (traffic_source);
create index if not exists page_views_device_category_idx on public.page_views (device_category);

-- 2. Aggregated Visitor Sessions
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

-- 3. Row Level Security
alter table public.page_views enable row level security;
alter table public.visitor_sessions enable row level security;

-- Read policy: only executive admins can read raw analytics data
drop policy if exists "page_views_select_admin" on public.page_views;
create policy "page_views_select_admin"
on public.page_views
for select
to authenticated
using (
  exists (
    select 1 from public.admins a
    where a.auth_user_id = auth.uid() and a.status = 'active'
  )
);

drop policy if exists "visitor_sessions_select_admin" on public.visitor_sessions;
create policy "visitor_sessions_select_admin"
on public.visitor_sessions
for select
to authenticated
using (
  exists (
    select 1 from public.admins a
    where a.auth_user_id = auth.uid() and a.status = 'active'
  )
);
