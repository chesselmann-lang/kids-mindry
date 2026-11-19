-- ============================================================
-- 008 DEMO-DATEN ERWEITERT — mindry Kids (Kita Regenbogen)
-- Erweiterte Demo-Daten: 3 Gruppen, 25 Kinder, 5 Fachkräfte
-- Admin: hallo@hesselmann-service.de / Hesselmann2026!
--
-- HINWEIS Auth: Supabase Auth-Nutzer müssen manuell über das
-- Supabase Dashboard angelegt werden (Authentication → Users).
-- Die folgenden Profile-Einträge nutzen deterministische UUIDs
-- als Platzhalter. Login via Demo-Bypass in der App funktioniert
-- ohne Supabase-Account (localStorage-basiert).
-- ============================================================

DO $$
DECLARE
  v_site_id      uuid;
  v_grp_sonn_id  uuid;  -- Sonnenkinder (2-3 J.)
  v_grp_stern_id uuid;  -- Sternschnuppen (3-4 J.)
  v_grp_regen_id uuid;  -- Regenbogen (4-6 J., vorhandene Gruppe)
  v_admin_id     uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
  v_leitung_id   uuid := 'a0000000-0000-0000-0000-000000000002'::uuid;
  v_erz1_id      uuid := 'a0000000-0000-0000-0000-000000000003'::uuid;
  v_erz2_id      uuid := 'a0000000-0000-0000-0000-000000000004'::uuid;
  v_erz3_id      uuid := 'a0000000-0000-0000-0000-000000000005'::uuid;
BEGIN

  -- Site
  SELECT id INTO v_site_id FROM sites LIMIT 1;
  IF v_site_id IS NULL THEN
    INSERT INTO sites (name, address, capacity, opening_time, closing_time)
    VALUES ('Kita Regenbogen', 'Gartenstraße 7, 48149 Münster', 75, '07:00', '17:00')
    RETURNING id INTO v_site_id;
  END IF;

  -- ── Gruppen ─────────────────────────────────────────────────────────────
  INSERT INTO groups (site_id, name, age_min_months, age_max_months, capacity, color)
  VALUES
    (v_site_id, 'Sonnenkinder',    24, 42,  12, '#FBBF24'),
    (v_site_id, 'Sternschnuppen',  36, 54,  15, '#818CF8')
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_grp_sonn_id  FROM groups WHERE site_id = v_site_id AND name = 'Sonnenkinder'  LIMIT 1;
  SELECT id INTO v_grp_stern_id FROM groups WHERE site_id = v_site_id AND name = 'Sternschnuppen' LIMIT 1;
  SELECT id INTO v_grp_regen_id FROM groups WHERE site_id = v_site_id AND name = 'Regenbogen'    LIMIT 1;

  -- ── Fachkräfte (Profile) ─────────────────────────────────────────────────
  -- Admin / Kita-Leitung
  INSERT INTO profiles (id, site_id, full_name, phone, role)
  VALUES
    (v_admin_id,   v_site_id, 'Christian Hesselmann',  '+49 251 1234560', 'admin'),
    (v_leitung_id, v_site_id, 'Monika Braun',           '+49 251 1234561', 'educator'),
    (v_erz1_id,    v_site_id, 'Sarah Weber',             '+49 251 1234562', 'educator'),
    (v_erz2_id,    v_site_id, 'Jana Hoffmann',           '+49 251 1234563', 'educator'),
    (v_erz3_id,    v_site_id, 'Petra Schneider',         '+49 251 1234564', 'educator')
  ON CONFLICT (id) DO NOTHING;

  -- ── Kinder — Sonnenkinder ─────────────────────────────────────────────────
  WITH inserted AS (
    INSERT INTO children (site_id, first_name, last_name, date_of_birth, enrollment_date, status)
    VALUES
      (v_site_id, 'Jonas',   'Müller',   '2022-03-15', '2024-09-01', 'active'),
      (v_site_id, 'Emilia',  'Schmidt',  '2022-07-22', '2024-09-01', 'active'),
      (v_site_id, 'Ben',     'Krause',   '2022-11-05', '2024-09-01', 'active'),
      (v_site_id, 'Hanna',   'Fischer',  '2023-01-18', '2024-09-01', 'active'),
      (v_site_id, 'Luis',    'Weber',    '2022-05-30', '2024-09-01', 'active'),
      (v_site_id, 'Mila',    'Bauer',    '2022-09-12', '2024-09-01', 'active'),
      (v_site_id, 'Felix',   'Koch',     '2023-02-25', '2024-09-01', 'active'),
      (v_site_id, 'Leni',    'Richter',  '2022-12-08', '2024-09-01', 'active')
    ON CONFLICT DO NOTHING
    RETURNING id, first_name
  )
  INSERT INTO group_members (group_id, child_id, joined_date)
  SELECT v_grp_sonn_id, id, '2024-09-01' FROM inserted
  ON CONFLICT DO NOTHING;

  -- ── Kinder — Sternschnuppen ───────────────────────────────────────────────
  WITH inserted AS (
    INSERT INTO children (site_id, first_name, last_name, date_of_birth, enrollment_date, status)
    VALUES
      (v_site_id, 'Sophie',  'Lange',    '2021-04-10', '2023-09-01', 'active'),
      (v_site_id, 'Luca',    'Herrmann', '2021-08-19', '2023-09-01', 'active'),
      (v_site_id, 'Marie',   'Peters',   '2021-02-27', '2023-09-01', 'active'),
      (v_site_id, 'Noah',    'Wolf',     '2021-06-14', '2023-09-01', 'active'),
      (v_site_id, 'Alina',   'Schulz',   '2021-10-03', '2023-09-01', 'active'),
      (v_site_id, 'Paul',    'Thomas',   '2021-12-21', '2023-09-01', 'active'),
      (v_site_id, 'Ella',    'Neumann',  '2021-03-09', '2023-09-01', 'active'),
      (v_site_id, 'Leon',    'Frank',    '2021-09-16', '2023-09-01', 'active')
    ON CONFLICT DO NOTHING
    RETURNING id, first_name
  )
  INSERT INTO group_members (group_id, child_id, joined_date)
  SELECT v_grp_stern_id, id, '2023-09-01' FROM inserted
  ON CONFLICT DO NOTHING;

  -- ── Kinder — Regenbogen ───────────────────────────────────────────────────
  WITH inserted AS (
    INSERT INTO children (site_id, first_name, last_name, date_of_birth, enrollment_date, status)
    VALUES
      (v_site_id, 'Emma',    'Braun',    '2019-05-11', '2022-09-01', 'active'),
      (v_site_id, 'Lukas',   'Klein',    '2019-11-28', '2022-09-01', 'active'),
      (v_site_id, 'Anna',    'Hofmann',  '2020-01-15', '2022-09-01', 'active'),
      (v_site_id, 'Finn',    'Kaiser',   '2019-08-06', '2022-09-01', 'active'),
      (v_site_id, 'Lara',    'Kramer',   '2019-03-22', '2022-09-01', 'active'),
      (v_site_id, 'Max',     'Vogt',     '2020-02-17', '2022-09-01', 'active'),
      (v_site_id, 'Ida',     'Simon',    '2019-07-04', '2022-09-01', 'active'),
      (v_site_id, 'Anton',   'Jung',     '2019-12-13', '2022-09-01', 'active'),
      (v_site_id, 'Klara',   'Schäfer',  '2020-04-28', '2022-09-01', 'active')
    ON CONFLICT DO NOTHING
    RETURNING id, first_name
  )
  INSERT INTO group_members (group_id, child_id, joined_date)
  SELECT COALESCE(v_grp_regen_id, v_grp_sonn_id), id, '2022-09-01' FROM inserted
  ON CONFLICT DO NOTHING;

  -- ── Wochenmenu Beispiel ───────────────────────────────────────────────────
  INSERT INTO weekly_menus (site_id, week_start, monday, tuesday, wednesday, thursday, friday)
  VALUES (
    v_site_id,
    date_trunc('week', CURRENT_DATE)::date,
    'Kartoffelsuppe mit Vollkornbrot',
    'Nudeln mit Tomatensoße und Salat',
    'Gemüse-Reis-Pfanne mit Hähnchen',
    'Linsensuppe mit Brötchen',
    'Fischstäbchen mit Kartoffelpüree und Erbsen'
  ) ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Demo-Daten eingespielt: 3 Gruppen, 25 Kinder, 5 Fachkräfte';
  RAISE NOTICE '   Admin-Bypass: hallo@hesselmann-service.de / Hesselmann2026!';
  RAISE NOTICE '   (Demo-Login via localStorage — kein Supabase-Account erforderlich)';
END $$;
