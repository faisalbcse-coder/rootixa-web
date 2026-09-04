-- Admin Authentication: admins table + RLS
-- Apply in Supabase SQL editor or via supabase CLI migrations.

-- 1) Core table
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text,
  email text not null unique,
  role text not null check (role in ('super_admin', 'admin')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.admins (id)
);

create index if not exists admins_auth_user_id_idx on public.admins (auth_user_id);
create index if not exists admins_status_idx on public.admins (status);
create index if not exists admins_role_idx on public.admins (role);

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_admins_updated_at on public.admins;
create trigger set_admins_updated_at
before update on public.admins
for each row execute function public.set_updated_at();

-- 2) RLS
alter table public.admins enable row level security;

-- Helper predicate: active super admin
create or replace function public.is_active_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where a.auth_user_id = auth.uid()
      and a.role = 'super_admin'
      and a.status = 'active'
  );
$$;

-- Read: any admin can read their own row; super_admin can read all
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self"
on public.admins
for select
to authenticated
using (auth_user_id = auth.uid());

drop policy if exists "admins_select_all_super_admin" on public.admins;
create policy "admins_select_all_super_admin"
on public.admins
for select
to authenticated
using (public.is_active_super_admin());

-- Insert/Update/Delete: only active super_admin
drop policy if exists "admins_insert_super_admin" on public.admins;
create policy "admins_insert_super_admin"
on public.admins
for insert
to authenticated
with check (public.is_active_super_admin());

drop policy if exists "admins_update_super_admin" on public.admins;
create policy "admins_update_super_admin"
on public.admins
for update
to authenticated
using (public.is_active_super_admin())
with check (public.is_active_super_admin());

drop policy if exists "admins_delete_super_admin" on public.admins;
create policy "admins_delete_super_admin"
on public.admins
for delete
to authenticated
using (public.is_active_super_admin());
