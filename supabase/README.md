# Supabase Admin Auth Setup

This project uses Supabase Auth for administrator sign-in, but authorization (roles/status) lives in the `public.admins` table (not in `app_metadata`).

## 1) Run migrations

Run the SQL in:

- `supabase/migrations/20260730_admins.sql`

## 2) Create/link the initial Super Admin

You already created the first Auth user manually in Supabase. That user must be linked to `public.admins` as `super_admin`.

1. Find the user's `id` (Auth user UUID) in `Authentication -> Users`.
2. Insert the admin profile:

```sql
insert into public.admins (auth_user_id, full_name, email, role, status)
values (
  '00000000-0000-0000-0000-000000000000', -- replace with auth.users.id
  'Super Admin',
  'you@example.com',
  'super_admin',
  'active'
);
```

Notes:

- Do not create another `super_admin`.
- Roles supported: `super_admin`, `admin`.
- Status supported: `active`, `inactive` (inactive admins cannot access `/admin/*`).

