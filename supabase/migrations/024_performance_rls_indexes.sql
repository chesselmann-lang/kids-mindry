-- Phase 0: Performance (Supabase-Performance-Berater vom 20.11.2026)
-- Inhaltlich ändert sich an den Zugriffsrechten nichts.
--
-- 1) RLS: auth.uid()/auth.role()/auth.jwt() in (select …) einpacken, damit Postgres den Wert
--    einmal pro Abfrage statt einmal pro Zeile auswertet (Lint auth_rls_initplan, 236 Richtlinien).
-- 2) Fehlende Indizes auf Fremdschlüsseln anlegen (Lint unindexed_foreign_keys, 112).
-- 3) Doppelte Indizes entfernen (Lint duplicate_index, 3).

-- 1) RLS-Richtlinien
do $$
declare
  r record;
  v_using text;
  v_check text;
  v_sql text;
  v_pattern constant text := '(?<!SELECT )auth\.(uid|role|jwt)\(\)';
begin
  for r in
    select schemaname, tablename, policyname, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (coalesce(qual, '') || coalesce(with_check, '')) ~ v_pattern
  loop
    v_using := case when r.qual is not null
                    then regexp_replace(r.qual, v_pattern, '(select auth.\1())', 'g') end;
    v_check := case when r.with_check is not null
                    then regexp_replace(r.with_check, v_pattern, '(select auth.\1())', 'g') end;

    v_sql := format('alter policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    if v_using is not null then
      v_sql := v_sql || format(' using (%s)', v_using);
    end if;
    if v_check is not null then
      v_sql := v_sql || format(' with check (%s)', v_check);
    end if;
    execute v_sql;
  end loop;
end $$;

-- 2) Indizes auf Fremdschlüsseln ohne passenden Index (führende Spalten)
do $$
declare
  r record;
begin
  for r in
    select c.conrelid::regclass::text as tbl,
           left('idx_' || c.conrelid::regclass::text || '_' || string_agg(a.attname, '_' order by k.ord), 63) as idx,
           string_agg(quote_ident(a.attname), ', ' order by k.ord) as cols
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    cross join lateral unnest(c.conkey) with ordinality k(attnum, ord)
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum
    where c.contype = 'f'
      and n.nspname = 'public'
      and not exists (
        select 1 from pg_index i
        where i.indrelid = c.conrelid
          and (i.indkey::int2[])[0:array_length(c.conkey, 1) - 1] = c.conkey
      )
    group by c.oid, c.conrelid
  loop
    execute format('create index if not exists %I on public.%I (%s)', r.idx, r.tbl, r.cols);
  end loop;
end $$;

-- 3) Doppelte Indizes (jeweils identische Definition, kein Constraint dahinter)
drop index if exists public.idx_announcement_reactions_ann;
drop index if exists public.favorite_children_user_idx;
drop index if exists public.online_anmeldungen_site_id_idx;
