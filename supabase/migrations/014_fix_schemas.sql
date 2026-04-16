-- Migration 014: Fix schema mismatches found in frontend code
-- Run after 013_missing_tables.sql

-- ============================================================
-- Fix weekly_menus: replace JSON-column approach with per-row
-- ============================================================
DROP TABLE IF EXISTS weekly_menus CASCADE;

CREATE TABLE weekly_menus (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id      uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  week_start   date NOT NULL,
  day          text NOT NULL CHECK (day IN ('monday','tuesday','wednesday','thursday','friday')),
  meal_type    text NOT NULL CHECK (meal_type IN ('breakfast','lunch','snack')),
  title        text NOT NULL,
  description  text,
  allergens    text[],
  is_vegetarian boolean NOT NULL DEFAULT false,
  is_vegan     boolean NOT NULL DEFAULT false,
  created_by   uuid REFERENCES profiles(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, week_start, day, meal_type)
);

ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_menus_read" ON weekly_menus
  FOR SELECT USING (
    site_id IN (SELECT site_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "weekly_menus_staff_write" ON weekly_menus
  FOR ALL USING (
    site_id IN (
      SELECT site_id FROM profiles
      WHERE id = auth.uid()
        AND role IN ('educator', 'group_lead', 'admin', 'caretaker')
    )
  );

-- ============================================================
-- Fix eingewoehnung_processes: add site_id and start_date alias
-- ============================================================
ALTER TABLE eingewoehnung_processes
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id) ON DELETE CASCADE;

-- ============================================================
-- Fix material_orders: ensure item_name column exists
-- ============================================================
-- The table was created with 'title' in migration 013 but frontend uses 'item_name'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'material_orders' AND column_name = 'title'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'material_orders' AND column_name = 'item_name'
  ) THEN
    ALTER TABLE material_orders RENAME COLUMN title TO item_name;
  END IF;
END $$;

-- ============================================================
-- Fix fees: add period_month alias and ensure proper columns
-- ============================================================
-- Some forms use 'period_month' instead of 'period'
ALTER TABLE fees
  ADD COLUMN IF NOT EXISTS period_month text GENERATED ALWAYS AS (period) STORED;

-- ============================================================
-- Fix trainings: ensure staff_id and hours columns (some forms pass them)
-- ============================================================
ALTER TABLE trainings
  ADD COLUMN IF NOT EXISTS staff_id uuid REFERENCES profiles(id);

-- Frontend uses 'hours' but DB has 'duration_hours'
ALTER TABLE trainings
  ADD COLUMN IF NOT EXISTS hours numeric(4,1);

-- Backfill hours from duration_hours
UPDATE trainings
SET hours = duration_hours
WHERE hours IS NULL AND duration_hours IS NOT NULL;

-- ============================================================
-- Fix council_members: rename role_in_council to position, add extras
-- ============================================================
DO $$
BEGIN
  -- Rename role_in_council to position if not already renamed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'council_members' AND column_name = 'role_in_council'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'council_members' AND column_name = 'position'
  ) THEN
    ALTER TABLE council_members RENAME COLUMN role_in_council TO position;
  END IF;
END $$;

ALTER TABLE council_members
  ADD COLUMN IF NOT EXISTS position_order integer;

ALTER TABLE council_members
  ADD COLUMN IF NOT EXISTS notes text;

-- ============================================================
-- Fix council_meetings: add summary and content columns
-- ============================================================
ALTER TABLE council_meetings
  ADD COLUMN IF NOT EXISTS summary text;

ALTER TABLE council_meetings
  ADD COLUMN IF NOT EXISTS content text;

-- ============================================================
-- Fix surveys: add is_active column (used in befragung-manager)
-- ============================================================
ALTER TABLE surveys
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- ============================================================
-- Fix foerderplaene: ensure foerderplan_id FK exists in foerder_goals
-- ============================================================
-- foerder_goals references foerderplan_id but table may have been created
-- with wrong name. Make sure FK is correct.
ALTER TABLE foerder_goals
  ADD COLUMN IF NOT EXISTS foerderplan_id uuid;

-- Add FK if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'foerder_goals_foerderplan_id_fkey'
  ) THEN
    ALTER TABLE foerder_goals
      ADD CONSTRAINT foerder_goals_foerderplan_id_fkey
      FOREIGN KEY (foerderplan_id) REFERENCES foerderplaene(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add site_id, child_id, created_by to foerder_goals (needed for activity feed)
ALTER TABLE foerder_goals
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id) ON DELETE CASCADE;

ALTER TABLE foerder_goals
  ADD COLUMN IF NOT EXISTS child_id uuid REFERENCES children(id) ON DELETE CASCADE;

ALTER TABLE foerder_goals
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Backfill site_id and child_id from foerderplaene where possible
UPDATE foerder_goals fg
SET
  site_id  = fp.site_id,
  child_id = fp.child_id
FROM foerderplaene fp
WHERE fg.foerderplan_id = fp.id
  AND fg.site_id IS NULL;

-- ============================================================
-- Add sleep_date alias to sleep_records (some pages use it)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sleep_records' AND column_name = 'sleep_date'
  ) THEN
    ALTER TABLE sleep_records ADD COLUMN sleep_date date;
    -- Backfill from date column if it exists
    UPDATE sleep_records SET sleep_date = date WHERE sleep_date IS NULL;
  END IF;
END $$;

-- Also add duration_minutes alias (some code uses it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sleep_records' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE sleep_records
      ADD COLUMN duration_minutes integer GENERATED ALWAYS AS (duration_min) STORED;
  END IF;
END $$;

-- Also add start_time / end_time aliases for sleep_records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sleep_records' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE sleep_records ADD COLUMN start_time timestamptz;
    UPDATE sleep_records SET start_time = sleep_start WHERE start_time IS NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sleep_records' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE sleep_records ADD COLUMN end_time timestamptz;
    UPDATE sleep_records SET end_time = sleep_end WHERE end_time IS NULL;
  END IF;
END $$;

-- ============================================================
-- Add daily_reports.photo_urls (used in tagesjournal)
-- ============================================================
ALTER TABLE daily_reports
  ADD COLUMN IF NOT EXISTS photo_urls text[] NOT NULL DEFAULT '{}';

-- ============================================================
-- Fix health_records: add site_id (needed for admin activity feed)
-- ============================================================
ALTER TABLE health_records
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id) ON DELETE CASCADE;

-- Backfill site_id from children
UPDATE health_records hr
SET site_id = c.site_id
FROM children c
WHERE hr.child_id = c.id
  AND hr.site_id IS NULL;

-- ============================================================
-- Fix children: add extended fields used by gesundheit form
-- ============================================================
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS emergency_contact_name text;

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text;

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS doctor_name text;

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS doctor_phone text;

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS care_days text[];

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS care_start_time time;

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS care_end_time time;

-- Convert allergies from text[] to text if needed (form uses free-text entry)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'allergies'
      AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE children ALTER COLUMN allergies TYPE text USING array_to_string(allergies, ', ');
  END IF;
END $$;

-- ============================================================
-- Fix rooms: add assigned_group_id and notes columns
-- ============================================================
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS assigned_group_id uuid REFERENCES groups(id) ON DELETE SET NULL;

ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS notes text;

-- ============================================================
-- Fix sleep_records: change quality to integer
-- ============================================================
DO $$
BEGIN
  -- If quality column exists as text, convert it to integer
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sleep_records' AND column_name = 'quality'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE sleep_records ALTER COLUMN quality TYPE integer USING
      CASE quality
        WHEN 'poor' THEN 1
        WHEN 'fair' THEN 2
        WHEN 'good' THEN 3
        WHEN 'very_good' THEN 4
        WHEN 'excellent' THEN 5
        ELSE NULL
      END;
  END IF;
  -- If quality column doesn't exist at all, add it as integer
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sleep_records' AND column_name = 'quality'
  ) THEN
    ALTER TABLE sleep_records ADD COLUMN quality integer CHECK (quality BETWEEN 1 AND 5);
  END IF;
END $$;

-- ============================================================
-- Fix daily_schedule_items: add time_start/time_end/color aliases
-- ============================================================
ALTER TABLE daily_schedule_items
  ADD COLUMN IF NOT EXISTS time_start text;

ALTER TABLE daily_schedule_items
  ADD COLUMN IF NOT EXISTS time_end text;

ALTER TABLE daily_schedule_items
  ADD COLUMN IF NOT EXISTS color text;

-- Backfill time_start from start_time
UPDATE daily_schedule_items
SET time_start = start_time
WHERE time_start IS NULL AND start_time IS NOT NULL;

-- Backfill time_end from end_time
UPDATE daily_schedule_items
SET time_end = end_time
WHERE time_end IS NULL AND end_time IS NOT NULL;

-- ============================================================
-- Fix incident_reports: add severity column (used in unfall-form)
-- ============================================================
ALTER TABLE incident_reports
  ADD COLUMN IF NOT EXISTS severity text NOT NULL DEFAULT 'minor';

-- Make title optional (unfall-form auto-generates it)
ALTER TABLE incident_reports
  ALTER COLUMN title SET DEFAULT 'Unfallbericht';

-- ============================================================
-- Fix group_handovers: add columns used by uebergabe-manager
-- ============================================================
ALTER TABLE group_handovers
  ADD COLUMN IF NOT EXISTS handover_date date NOT NULL DEFAULT CURRENT_DATE;

ALTER TABLE group_handovers
  ADD COLUMN IF NOT EXISTS shift text;

ALTER TABLE group_handovers
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';

ALTER TABLE group_handovers
  ADD COLUMN IF NOT EXISTS incidents text;

ALTER TABLE group_handovers
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- ============================================================
-- Fix substitutions: add substitute_staff_id and reason
-- ============================================================
ALTER TABLE substitutions
  ADD COLUMN IF NOT EXISTS substitute_staff_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE substitutions
  ADD COLUMN IF NOT EXISTS reason text;

-- Backfill substitute_staff_id from substitute_id if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'substitutions' AND column_name = 'substitute_id'
  ) THEN
    UPDATE substitutions
    SET substitute_staff_id = substitute_id
    WHERE substitute_staff_id IS NULL AND substitute_id IS NOT NULL;
  END IF;
END $$;

-- ============================================================
-- Fix eingewoehnung_processes: ensure phase is integer
-- ============================================================
DO $$
DECLARE
  v_constraint_name text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'eingewoehnung_processes' AND column_name = 'phase'
      AND data_type = 'text'
  ) THEN
    -- Drop any CHECK constraints on phase column first
    FOR v_constraint_name IN
      SELECT cc.constraint_name
      FROM information_schema.constraint_column_usage cc
      JOIN information_schema.table_constraints tc
        ON tc.constraint_name = cc.constraint_name
      WHERE cc.table_name = 'eingewoehnung_processes'
        AND cc.column_name = 'phase'
        AND tc.constraint_type = 'CHECK'
    LOOP
      EXECUTE format('ALTER TABLE eingewoehnung_processes DROP CONSTRAINT IF EXISTS %I', v_constraint_name);
    END LOOP;

    ALTER TABLE eingewoehnung_processes ALTER COLUMN phase TYPE integer USING
      CASE phase
        WHEN '1' THEN 1 WHEN '2' THEN 2 WHEN '3' THEN 3
        WHEN '4' THEN 4 WHEN '5' THEN 5
        ELSE 1
      END;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'eingewoehnung_processes' AND column_name = 'phase'
  ) THEN
    ALTER TABLE eingewoehnung_processes ADD COLUMN phase integer NOT NULL DEFAULT 1;
  END IF;
END $$;

-- ============================================================
-- Updated_at triggers for new tables
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'weekly_menus', 'eingewoehnung_processes', 'material_orders', 'fees'
  ]) LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = tbl AND column_name = 'updated_at'
    ) THEN
      EXECUTE format(
        'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;
         CREATE TRIGGER trg_%s_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
        tbl, tbl, tbl, tbl
      );
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- Fix annual_events: add event_date, event_type, description, created_by
-- ============================================================
-- Frontend uses event_date/event_type/description/created_by;
-- original schema had month/day/category/notes only.
ALTER TABLE annual_events
  ADD COLUMN IF NOT EXISTS event_date date;

ALTER TABLE annual_events
  ADD COLUMN IF NOT EXISTS event_type text;

ALTER TABLE annual_events
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE annual_events
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Make month nullable so inserts via event_date still work
ALTER TABLE annual_events
  ALTER COLUMN month DROP NOT NULL;

-- Backfill month/day from event_date where available
UPDATE annual_events
SET
  month = EXTRACT(MONTH FROM event_date)::int,
  day   = EXTRACT(DAY FROM event_date)::int
WHERE event_date IS NOT NULL AND month IS NULL;

-- ============================================================
-- Fix newsletters: add summary, group_id, published_at
-- ============================================================
ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS summary text;

ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES groups(id) ON DELETE SET NULL;

ALTER TABLE newsletters
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Backfill published_at from sent_at
UPDATE newsletters
SET published_at = sent_at
WHERE published_at IS NULL AND sent_at IS NOT NULL;

-- ============================================================
-- Fix child_documents: add doc_type alias and visible_to_parents
-- ============================================================
ALTER TABLE child_documents
  ADD COLUMN IF NOT EXISTS doc_type text;

ALTER TABLE child_documents
  ADD COLUMN IF NOT EXISTS visible_to_parents boolean NOT NULL DEFAULT true;

-- Backfill doc_type from document_type if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'child_documents' AND column_name = 'document_type'
  ) THEN
    UPDATE child_documents
    SET doc_type = document_type
    WHERE doc_type IS NULL AND document_type IS NOT NULL;
  END IF;
END $$;

-- ============================================================
-- Fix quick_notes: add color column (used in notizen-client)
-- ============================================================
ALTER TABLE quick_notes
  ADD COLUMN IF NOT EXISTS color text;

-- ============================================================
-- Fix time_entries: add clock_in/clock_out, make date/start_time nullable
-- ============================================================
ALTER TABLE time_entries
  ADD COLUMN IF NOT EXISTS clock_in timestamptz;

ALTER TABLE time_entries
  ADD COLUMN IF NOT EXISTS clock_out timestamptz;

ALTER TABLE time_entries
  ALTER COLUMN date DROP NOT NULL;

ALTER TABLE time_entries
  ALTER COLUMN start_time DROP NOT NULL;

-- Backfill clock_in/clock_out from existing date + time columns if populated
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_entries' AND column_name = 'start_time'
  ) THEN
    UPDATE time_entries
    SET clock_in = (date::text || 'T' || start_time)::timestamptz
    WHERE clock_in IS NULL AND date IS NOT NULL AND start_time IS NOT NULL;

    UPDATE time_entries
    SET clock_out = (date::text || 'T' || end_time)::timestamptz
    WHERE clock_out IS NULL AND date IS NOT NULL AND end_time IS NOT NULL;
  END IF;
END $$;

-- ============================================================
-- Fix polls: add group_id column
-- ============================================================
ALTER TABLE polls
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES groups(id) ON DELETE SET NULL;

-- ============================================================
-- Fix bulletin_posts: add is_pinned alias and category column
-- ============================================================
-- Frontend uses is_pinned (DB has pinned) and category (not in DB)
ALTER TABLE bulletin_posts
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

ALTER TABLE bulletin_posts
  ADD COLUMN IF NOT EXISTS category text;

-- Sync is_pinned from pinned
UPDATE bulletin_posts SET is_pinned = pinned WHERE is_pinned IS DISTINCT FROM pinned;

-- ============================================================
-- Fix child_handover_checks: add date, type, status, notes
-- ============================================================
ALTER TABLE child_handover_checks
  ADD COLUMN IF NOT EXISTS date date;

ALTER TABLE child_handover_checks
  ADD COLUMN IF NOT EXISTS type text;

ALTER TABLE child_handover_checks
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

ALTER TABLE child_handover_checks
  ADD COLUMN IF NOT EXISTS notes text;

-- Backfill date from check_date
UPDATE child_handover_checks
SET date = check_date
WHERE date IS NULL AND check_date IS NOT NULL;

-- Add unique constraint for upsert (child_id, date, type)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'child_handover_checks_child_id_date_type_key'
  ) THEN
    ALTER TABLE child_handover_checks
      ADD CONSTRAINT child_handover_checks_child_id_date_type_key
      UNIQUE (child_id, date, type);
  END IF;
END $$;

-- ============================================================
-- Fix hygiene_checks: add per-item columns for upsert pattern
-- ============================================================
ALTER TABLE hygiene_checks
  ADD COLUMN IF NOT EXISTS section text;

ALTER TABLE hygiene_checks
  ADD COLUMN IF NOT EXISTS item_id text;

ALTER TABLE hygiene_checks
  ADD COLUMN IF NOT EXISTS checked boolean NOT NULL DEFAULT false;

-- Add unique constraint for upsert (site_id, check_date, section, item_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'hygiene_checks_site_date_section_item_key'
  ) THEN
    ALTER TABLE hygiene_checks
      ADD CONSTRAINT hygiene_checks_site_date_section_item_key
      UNIQUE (site_id, check_date, section, item_id);
  END IF;
END $$;

-- ============================================================
-- Fix staff_tasks: add completed_at
-- ============================================================
ALTER TABLE staff_tasks
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- ============================================================
-- Fix shifts: add role_note and created_by
-- ============================================================
ALTER TABLE shifts
  ADD COLUMN IF NOT EXISTS role_note text;

ALTER TABLE shifts
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- ============================================================
-- Fix kita_documents: add file_path, file_name, mime_type, uploaded_by
-- ============================================================
ALTER TABLE kita_documents
  ADD COLUMN IF NOT EXISTS file_path text;

ALTER TABLE kita_documents
  ADD COLUMN IF NOT EXISTS file_name text;

ALTER TABLE kita_documents
  ADD COLUMN IF NOT EXISTS mime_type text;

ALTER TABLE kita_documents
  ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Backfill file_path from file_url where available
UPDATE kita_documents
SET file_path = file_url
WHERE file_path IS NULL AND file_url IS NOT NULL;
