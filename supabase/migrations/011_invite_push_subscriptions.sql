-- ============================================================
-- Migration 011: Guardian invite metadata + Push Subscriptions
-- ============================================================

-- ── 1. Update handle_new_user to also create guardian record
--    if child_id is present in invite metadata
-- ──────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_child_id uuid;
begin
  -- Upsert profile from invite metadata
  insert into public.profiles (id, full_name, site_id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    (new.raw_user_meta_data->>'site_id')::uuid,
    coalesce(new.raw_user_meta_data->>'role', 'parent')
  )
  on conflict (id) do update
    set
      full_name = coalesce(excluded.full_name, profiles.full_name),
      site_id   = coalesce(excluded.site_id, profiles.site_id),
      role      = coalesce(excluded.role, profiles.role);

  -- If a child_id was supplied in the invite, create a guardian link
  v_child_id := (new.raw_user_meta_data->>'child_id')::uuid;
  if v_child_id is not null then
    insert into public.guardians (user_id, child_id, relationship)
    values (new.id, v_child_id, 'parent')
    on conflict (user_id, child_id) do nothing;
  end if;

  return new;
end;
$$;

-- ── 2. push_subscriptions table for Web Push / VAPID
-- ──────────────────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  site_id     uuid references public.sites(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id, endpoint)
);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Policies: users can only manage their own subscriptions
drop policy if exists "Own push subscriptions" on public.push_subscriptions;
create policy "Own push subscriptions" on public.push_subscriptions
  for all using (user_id = auth.uid());

-- Allow service role (edge functions) to insert/update/delete freely
-- (the service role bypasses RLS by default)

-- Indexes
create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id);
create index if not exists idx_push_subscriptions_site on public.push_subscriptions(site_id);

-- Updated_at trigger
drop trigger if exists set_updated_at on public.push_subscriptions;
create trigger set_updated_at
  before update on public.push_subscriptions
  for each row execute procedure public.handle_updated_at();

-- ── 3. notification_log table for tracking sent push notifications
-- ──────────────────────────────────────────────────────────
create table if not exists public.notification_log (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid references public.sites(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  title        text not null,
  body         text,
  url          text,
  source_type  text,   -- 'message' | 'announcement' | 'tagesbericht' | 'abwesenheit'
  source_id    uuid,
  sent_at      timestamptz default now(),
  status       text default 'sent'  -- 'sent' | 'failed' | 'skipped'
);

alter table public.notification_log enable row level security;

drop policy if exists "Staff read notification log" on public.notification_log;
create policy "Staff read notification log" on public.notification_log
  for select using (
    site_id in (select site_id from public.profiles where id = auth.uid())
    and (
      select role from public.profiles where id = auth.uid() limit 1
    ) in ('admin','group_lead','educator','caretaker')
  );

create index if not exists idx_notif_log_site on public.notification_log(site_id);
create index if not exists idx_notif_log_recipient on public.notification_log(recipient_id);
create index if not exists idx_notif_log_sent_at on public.notification_log(sent_at desc);
