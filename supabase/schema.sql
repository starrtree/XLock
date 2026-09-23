-- XLock MVP persistence
-- Run this in the Supabase SQL editor, then enable Anonymous Sign-Ins in Auth.
-- The app uses one authenticated row per browser/user profile and RLS keeps rows private.

create table if not exists public.xlock_state (
  owner_id uuid not null references auth.users(id) on delete cascade,
  profile_key text not null default 'primary',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner_id, profile_key)
);

alter table public.xlock_state enable row level security;

revoke all on table public.xlock_state from anon;
grant select, insert, update, delete on table public.xlock_state to authenticated;

drop policy if exists "xlock_select_own" on public.xlock_state;
create policy "xlock_select_own"
on public.xlock_state
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "xlock_insert_own" on public.xlock_state;
create policy "xlock_insert_own"
on public.xlock_state
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "xlock_update_own" on public.xlock_state;
create policy "xlock_update_own"
on public.xlock_state
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "xlock_delete_own" on public.xlock_state;
create policy "xlock_delete_own"
on public.xlock_state
for delete
to authenticated
using ((select auth.uid()) = owner_id);
