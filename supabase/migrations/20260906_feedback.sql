-- Feedback & Community Suggestions Foundation
-- Schema for capturing user reviews, tool suggestions, bug reports, and inquiries with admin reply tracking

create table if not exists public.feedback (
  id text primary key,
  category text not null check (category in ('suggestion', 'bug', 'review', 'inquiry')),
  rating integer check (rating between 1 and 5),
  tool_name text default 'General',
  title text not null,
  message text not null,
  user_name text default 'Community Member',
  user_email text not null,
  device_info text,
  wants_reply boolean default true,
  attachment jsonb,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'replied', 'resolved', 'featured')),
  admin_reply text,
  admin_name text,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists feedback_category_idx on public.feedback (category);
create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_status_idx on public.feedback (status);
create index if not exists feedback_user_email_idx on public.feedback (user_email);

-- Enable RLS
alter table public.feedback enable row level security;

-- Allow anonymous users to submit feedback
create policy if not exists "Allow public feedback insert"
  on public.feedback for insert
  with check (true);

-- Allow public to read featured feedback
create policy if not exists "Allow public read featured feedback"
  on public.feedback for select
  using (status = 'featured');

-- Allow service role full access
create policy if not exists "Allow service role full access"
  on public.feedback for all
  using (true)
  with check (true);
