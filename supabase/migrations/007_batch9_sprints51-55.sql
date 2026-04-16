-- Sprint 51: child_documents
CREATE TABLE IF NOT EXISTS child_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  site_id uuid NOT NULL,
  title text NOT NULL,
  doc_type text DEFAULT 'other' CHECK (doc_type IN ('contract','health','permit','report','other')),
  file_url text NOT NULL,
  visible_to_parents boolean DEFAULT true,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE child_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage child docs" ON child_documents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_id = child_documents.site_id AND role IN ('educator','group_lead','admin','caretaker')));
CREATE POLICY "Parents read visible docs" ON child_documents FOR SELECT TO authenticated
  USING (visible_to_parents = true AND EXISTS (SELECT 1 FROM child_guardians WHERE user_id = auth.uid() AND child_id = child_documents.child_id));

-- Sprint 52: onboarding_completed in profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Sprint 53: weekly_reports
CREATE TABLE IF NOT EXISTS weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  title text NOT NULL,
  summary text,
  content text NOT NULL,
  week_start date NOT NULL,
  group_id uuid REFERENCES groups(id),
  photo_urls text[],
  highlights text[],
  author_id uuid REFERENCES profiles(id),
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage weekly reports" ON weekly_reports FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_id = weekly_reports.site_id AND role IN ('educator','group_lead','admin','caretaker')));
CREATE POLICY "All site users read weekly reports" ON weekly_reports FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_id = weekly_reports.site_id));

-- Sprint 54: foerderplaene
CREATE TABLE IF NOT EXISTS foerderplaene (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  title text NOT NULL,
  goals text[] NOT NULL DEFAULT '{}',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  review_date date,
  notes text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE foerderplaene ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage foerderplaene" ON foerderplaene FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_id = foerderplaene.site_id AND role IN ('educator','group_lead','admin','caretaker')));

-- Sprint 55: time_entries
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  staff_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  clock_in timestamptz NOT NULL DEFAULT now(),
  clock_out timestamptz,
  break_minutes int DEFAULT 0,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage own time entries" ON time_entries FOR ALL TO authenticated
  USING (staff_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_id = time_entries.site_id AND role IN ('admin','group_lead')));
