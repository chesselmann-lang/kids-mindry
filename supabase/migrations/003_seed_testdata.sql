-- ============================================================
-- SEED TESTDATEN für KitaHub
-- WICHTIG: Nur auf Entwicklungs-/Testdatenbanken ausführen!
-- ============================================================
-- Nutzer müssen zuerst über Supabase Auth angelegt werden.
-- Diese Datei setzt nur die Profil- und Inhaltsdaten.
--
-- Demo-Accounts (Passwort: Demo1234! für alle):
--   admin@kita-demo.de    → Administrator
--   erzieherin@kita-demo.de → Erzieherin
--   mama@kita-demo.de     → Elternteil (Mutter von Emma)
--   papa@kita-demo.de     → Elternteil (Vater von Lukas)
-- ============================================================

DO $$
DECLARE
  v_site_id   uuid;
  v_group1_id uuid;
  v_group2_id uuid;
  v_admin_id  uuid;
  v_edu_id    uuid;
  v_mama_id   uuid;
  v_papa_id   uuid;
  v_emma_id   uuid;
  v_lukas_id  uuid;
  v_noah_id   uuid;
  v_mia_id    uuid;
  v_conv1_id  uuid;
  v_monday    date;
BEGIN

  -- Site holen (erste vorhandene Site)
  SELECT id INTO v_site_id FROM sites LIMIT 1;
  IF v_site_id IS NULL THEN
    RAISE EXCEPTION 'Keine Site gefunden. Bitte zuerst 001_initial_schema.sql ausführen.';
  END IF;

  -- ---- Gruppen -------------------------------------------------------
  INSERT INTO groups (site_id, name, age_min_months, age_max_months, capacity, color)
  VALUES
    (v_site_id, 'Schmetterlinge', 12, 36, 15, '#F59E0B'),
    (v_site_id, 'Regenbogen', 36, 72, 20, '#3B6CE8')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_group1_id;

  SELECT id INTO v_group1_id FROM groups WHERE site_id = v_site_id AND name = 'Schmetterlinge' LIMIT 1;
  SELECT id INTO v_group2_id FROM groups WHERE site_id = v_site_id AND name = 'Regenbogen' LIMIT 1;

  -- ---- Profile (UUID kommt aus auth.users – hier Platzhalter) --------
  -- In der Praxis: Nutzer zuerst über Supabase-Auth anlegen,
  -- dann profile.id = auth.users.id setzen.
  -- Für Tests können wir deterministische UUIDs nutzen:

  v_admin_id  := '00000000-0000-0000-0000-000000000001'::uuid;
  v_edu_id    := '00000000-0000-0000-0000-000000000002'::uuid;
  v_mama_id   := '00000000-0000-0000-0000-000000000003'::uuid;
  v_papa_id   := '00000000-0000-0000-0000-000000000004'::uuid;

  INSERT INTO profiles (id, site_id, full_name, phone, role)
  VALUES
    (v_admin_id,  v_site_id, 'Karin Müller',    '+49 151 11111111', 'admin'),
    (v_edu_id,    v_site_id, 'Jana Schmidt',     '+49 151 22222222', 'educator'),
    (v_mama_id,   v_site_id, 'Sabine Fischer',   '+49 151 33333333', 'parent'),
    (v_papa_id,   v_site_id, 'Thomas Weber',     '+49 151 44444444', 'parent')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone     = EXCLUDED.phone,
    role      = EXCLUDED.role,
    site_id   = EXCLUDED.site_id;

  -- ---- Kinder --------------------------------------------------------
  v_emma_id  := gen_random_uuid();
  v_lukas_id := gen_random_uuid();
  v_noah_id  := gen_random_uuid();
  v_mia_id   := gen_random_uuid();

  INSERT INTO children (id, site_id, group_id, first_name, last_name, date_of_birth, gender, status)
  VALUES
    (v_emma_id,  v_site_id, v_group1_id, 'Emma',  'Fischer', '2022-03-15', 'female', 'active'),
    (v_lukas_id, v_site_id, v_group2_id, 'Lukas', 'Weber',   '2020-07-22', 'male',   'active'),
    (v_noah_id,  v_site_id, v_group1_id, 'Noah',  'Bauer',   '2022-11-08', 'male',   'active'),
    (v_mia_id,   v_site_id, v_group2_id, 'Mia',   'Koch',    '2020-01-30', 'female', 'active')
  ON CONFLICT DO NOTHING;

  -- Allergien für Emma
  UPDATE children SET allergies = ARRAY['Erdnüsse', 'Baumnüsse'] WHERE id = v_emma_id;

  -- ---- Erziehungsberechtigte -----------------------------------------
  INSERT INTO guardians (child_id, user_id, full_name, phone, relationship, is_primary, can_pickup)
  VALUES
    (v_emma_id,  v_mama_id, 'Sabine Fischer', '+49 151 33333333', 'parent', true,  true),
    (v_lukas_id, v_papa_id, 'Thomas Weber',   '+49 151 44444444', 'parent', true,  true),
    (v_noah_id,  NULL,      'Peter Bauer',    '+49 151 55555555', 'parent', true,  true),
    (v_mia_id,   NULL,      'Claudia Koch',   '+49 151 66666666', 'parent', true,  true)
  ON CONFLICT DO NOTHING;

  -- ---- Anwesenheit heute ---------------------------------------------
  INSERT INTO attendance (child_id, site_id, date, status, check_in_at)
  VALUES
    (v_emma_id,  v_site_id, CURRENT_DATE, 'present',       NOW() - INTERVAL '3 hours'),
    (v_lukas_id, v_site_id, CURRENT_DATE, 'present',       NOW() - INTERVAL '2.5 hours'),
    (v_noah_id,  v_site_id, CURRENT_DATE, 'absent_sick',   NULL),
    (v_mia_id,   v_site_id, CURRENT_DATE, 'present',       NOW() - INTERVAL '2 hours')
  ON CONFLICT DO NOTHING;

  -- ---- Tagesberichte -------------------------------------------------
  INSERT INTO daily_reports (child_id, author_id, report_date, mood, sleep_minutes, activities, notes)
  VALUES
    (v_emma_id,  v_edu_id, CURRENT_DATE,     'great', 90, 'Malen, Puzzeln',        'Emma war heute sehr aufgeweckt und hat toll mitgemacht.'),
    (v_emma_id,  v_edu_id, CURRENT_DATE - 1, 'good',  75, 'Singen, Turnen',        'Schöner Tag im Garten.'),
    (v_lukas_id, v_edu_id, CURRENT_DATE,     'okay',  60, 'Bauen, Vorlesen',       'Lukas war etwas müde, hat sich aber gut in der Gruppe eingebracht.'),
    (v_lukas_id, v_edu_id, CURRENT_DATE - 1, 'great', 90, 'Rollenspiel, Basteln',  NULL),
    (v_mia_id,   v_edu_id, CURRENT_DATE,     'good',  80, 'Töpfern, Gartenarbeit', NULL)
  ON CONFLICT DO NOTHING;

  -- ---- Ankündigungen -------------------------------------------------
  INSERT INTO announcements (site_id, author_id, title, body, type, published_at, pinned)
  VALUES
    (v_site_id, v_admin_id,
      'Willkommen bei KitaHub! 🎉',
      'Liebe Eltern, wir freuen uns, euch unser neues digitales Kommunikationssystem vorzustellen. Hier findet ihr alle wichtigen Informationen rund um den Kita-Alltag.',
      'info', NOW() - INTERVAL '7 days', true),
    (v_site_id, v_admin_id,
      'Elternabend am 25. April',
      'Wir laden herzlich zum nächsten Elternabend ein. Themen: Jahresplanung, Ausflüge, und offene Fragen. Beginn: 19:00 Uhr im großen Gruppenraum.',
      'important', NOW() - INTERVAL '2 days', false),
    (v_site_id, v_edu_id,
      'Ausflug zum Tierpark',
      'Am Donnerstag fahren wir mit der Gruppe Regenbogen in den Tierpark. Bitte bringt wetterfeste Kleidung und eine Brotdose mit. Abfahrt: 9:00 Uhr.',
      'event', NOW() - INTERVAL '1 day', false),
    (v_site_id, v_edu_id,
      'Kein Mittagessen am Freitag',
      'Aufgrund einer technischen Störung in der Küche kann am Freitag kein warmes Mittagessen angeboten werden. Bitte gebt euren Kindern eine Lunchbox mit.',
      'reminder', NOW() - INTERVAL '3 hours', false)
  ON CONFLICT DO NOTHING;

  -- ---- Veranstaltungen -----------------------------------------------
  INSERT INTO events (site_id, author_id, title, description, location, starts_at, ends_at, all_day, type, rsvp_required, color)
  VALUES
    (v_site_id, v_admin_id,
      'Elternabend',
      'Gemeinsamer Elternabend aller Gruppen. Jahresplanung, Ausflüge, offene Fragen.',
      'Großer Gruppenraum',
      (CURRENT_DATE + 13) + TIME '19:00',
      (CURRENT_DATE + 13) + TIME '21:00',
      false, 'parent_evening', true, '#3B6CE8'),
    (v_site_id, v_edu_id,
      'Ausflug Tierpark (Regenbogen)',
      'Tagesausflug in den Tierpark. Wetterfeste Kleidung und Brotdose mitbringen.',
      'Stadtpark Tierpark',
      (CURRENT_DATE + 3) + TIME '09:00',
      (CURRENT_DATE + 3) + TIME '16:00',
      false, 'excursion', true, '#F59E0B'),
    (v_site_id, v_admin_id,
      'Sommerfest 🎊',
      'Unser jährliches Sommerfest! Mit Grillen, Spielen und Musik. Alle Familien sind herzlich eingeladen.',
      'Kita-Garten',
      (CURRENT_DATE + 30) + TIME '14:00',
      (CURRENT_DATE + 30) + TIME '18:00',
      false, 'event', false, '#10B981')
  ON CONFLICT DO NOTHING;

  -- ---- Speiseplan (aktuelle Woche) -----------------------------------
  v_monday := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::int - 1);
  -- Adjust: if Sunday (0), go back 6 days; otherwise go back (DOW-1) days
  IF EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN
    v_monday := CURRENT_DATE - 6;
  ELSE
    v_monday := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::int - 1);
  END IF;

  INSERT INTO weekly_menus (site_id, week_start, day, meal_type, title, description, is_vegetarian)
  VALUES
    (v_site_id, v_monday, 'monday',    'lunch',  'Spaghetti Bolognese',    'Mit frischem Parmesan', false),
    (v_site_id, v_monday, 'monday',    'snack',  'Apfelschnitze',          NULL, true),
    (v_site_id, v_monday, 'tuesday',   'lunch',  'Gemüsesuppe',            'Mit Vollkornbrot', true),
    (v_site_id, v_monday, 'tuesday',   'snack',  'Joghurt mit Früchten',   NULL, true),
    (v_site_id, v_monday, 'wednesday', 'lunch',  'Fischstäbchen mit Reis', 'Mit Erbsen', false),
    (v_site_id, v_monday, 'wednesday', 'snack',  'Banane & Knäckebrot',    NULL, true),
    (v_site_id, v_monday, 'thursday',  'lunch',  'Linsensuppe',            'Mit Dinkelbrötchen', true),
    (v_site_id, v_monday, 'thursday',  'snack',  'Obstspieße',             NULL, true),
    (v_site_id, v_monday, 'friday',    'lunch',  'Pizzatag',               'Verschiedene Toppings', false),
    (v_site_id, v_monday, 'friday',    'snack',  'Rohkost-Teller',         'Karotten, Gurken, Paprika', true)
  ON CONFLICT (site_id, week_start, day, meal_type) DO NOTHING;

  -- ---- Demo-Konversation ---------------------------------------------
  INSERT INTO conversations (id, site_id, subject, type)
  VALUES (gen_random_uuid(), v_site_id, 'Frage zur Abwesenheit von Emma', 'direct')
  RETURNING id INTO v_conv1_id;

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES
    (v_conv1_id, v_mama_id),
    (v_conv1_id, v_edu_id);

  INSERT INTO messages (conversation_id, sender_id, body, type)
  VALUES
    (v_conv1_id, v_mama_id, 'Hallo Frau Schmidt, Emma wird morgen nicht kommen, sie hat Fieber.', 'text'),
    (v_conv1_id, v_edu_id,  'Hallo Frau Fischer, vielen Dank für die Nachricht! Ich wünsche Emma gute Besserung. Bis bald!', 'text');

  RAISE NOTICE 'Testdaten erfolgreich angelegt!';
  RAISE NOTICE 'Gruppen: Schmetterlinge (%), Regenbogen (%)', v_group1_id, v_group2_id;
  RAISE NOTICE 'Kinder: Emma (%), Lukas (%), Noah (%), Mia (%)', v_emma_id, v_lukas_id, v_noah_id, v_mia_id;

END $$;
