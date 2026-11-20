-- Phase 0a: Rechteausweitung über Profile schließen
-- a) Angemeldete Nutzer dürfen role/site_id nicht selbst ändern
-- b) Rolle/Einrichtung/Kind aus Metadaten nur bei Einladungen (invited_at gesetzt)

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.site_id is distinct from old.site_id)
     and coalesce(auth.role(), '') in ('authenticated', 'anon') then
    raise exception 'Rolle und Einrichtung können nur von der Verwaltung geändert werden'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function public.protect_profile_privileges() from public, anon, authenticated;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invited boolean := new.invited_at is not null;  -- nur über Admin-API (Einladung) gesetzt
  v_child_id uuid;
begin
  insert into public.profiles (id, full_name, site_id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when v_invited then (new.raw_user_meta_data->>'site_id')::uuid else null end,
    case when v_invited then coalesce(new.raw_user_meta_data->>'role', 'parent') else 'parent' end
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    site_id   = case when v_invited then coalesce(excluded.site_id, public.profiles.site_id) else public.profiles.site_id end,
    role      = case when v_invited then coalesce(excluded.role, public.profiles.role) else public.profiles.role end;

  if v_invited then
    v_child_id := (new.raw_user_meta_data->>'child_id')::uuid;
    if v_child_id is not null then
      insert into public.guardians (user_id, child_id, relationship)
      values (new.id, v_child_id, 'parent')
      on conflict (user_id, child_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
