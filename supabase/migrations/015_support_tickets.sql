-- Support Tickets (M32)
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  category text not null default 'question'
    check (category in ('question', 'bug', 'feature', 'billing', 'other')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  subject text not null,
  message text not null,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists support_ticket_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references support_tickets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  is_internal boolean default false,
  is_staff_reply boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table support_tickets enable row level security;
alter table support_ticket_replies enable row level security;

-- Admins can do everything
create policy "admin_all_tickets" on support_tickets
  for all to authenticated
  using (
    site_id = (
      select site_id from profiles where id = auth.uid() limit 1
    )
    and (
      select role from profiles where id = auth.uid() limit 1
    ) in ('admin', 'group_lead')
  )
  with check (
    site_id = (
      select site_id from profiles where id = auth.uid() limit 1
    )
  );

-- Users can see/create their own tickets
create policy "user_own_tickets" on support_tickets
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Replies: admin can see all for their site's tickets
create policy "admin_all_replies" on support_ticket_replies
  for all to authenticated
  using (
    ticket_id in (
      select id from support_tickets where site_id = (
        select site_id from profiles where id = auth.uid() limit 1
      )
    )
    and (select role from profiles where id = auth.uid() limit 1) in ('admin', 'group_lead')
  );

-- Users see replies for own tickets
create policy "user_own_replies" on support_ticket_replies
  for select to authenticated
  using (
    ticket_id in (select id from support_tickets where user_id = auth.uid())
    and is_internal = false
  );

create policy "user_create_replies" on support_ticket_replies
  for insert to authenticated
  with check (
    ticket_id in (select id from support_tickets where user_id = auth.uid())
    and is_internal = false
    and is_staff_reply = false
  );

-- Indexes
create index if not exists idx_support_tickets_site_id on support_tickets(site_id);
create index if not exists idx_support_tickets_user_id on support_tickets(user_id);
create index if not exists idx_support_tickets_status on support_tickets(status);
create index if not exists idx_support_ticket_replies_ticket_id on support_ticket_replies(ticket_id);
