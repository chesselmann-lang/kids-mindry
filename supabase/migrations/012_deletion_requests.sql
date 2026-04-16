-- ============================================================
-- Migration 012: DSGVO Deletion Requests
-- ============================================================

create table if not exists public.deletion_requests (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  reason                text,
  status                text not null default 'pending'
                        check (status in ('pending','approved','rejected','completed')),
  scheduled_deletion_at timestamptz,
  completed_at          timestamptz,
  completed_by          uuid references auth.users(id),
  rejection_reason      text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

alter table public.deletion_requests enable row level security;

-- Users can see and create their own requests
drop policy if exists "Own deletion requests" on public.deletion_requests;
create policy "Own deletion requests" on public.deletion_requests
  for select using (user_id = auth.uid());

drop policy if exists "Create own deletion request" on public.deletion_requests;
create policy "Create own deletion request" on public.deletion_requests
  for insert with check (user_id = auth.uid());

-- Admins can see all requests for their site
drop policy if exists "Admin deletion requests" on public.deletion_requests;
create policy "Admin deletion requests" on public.deletion_requests
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin')
      and site_id = (
        select site_id from public.profiles where id = deletion_requests.user_id limit 1
      )
    )
  );

create index if not exists idx_deletion_requests_user on public.deletion_requests(user_id);
create index if not exists idx_deletion_requests_status on public.deletion_requests(status);

drop trigger if exists set_updated_at on public.deletion_requests;
create trigger set_updated_at
  before update on public.deletion_requests
  for each row execute procedure public.handle_updated_at();
