-- Batch 6 Migrations (Sprints 36-40)
-- Sprint 36: staff_tasks table
CREATE TABLE IF NOT EXISTS staff_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  due_date date,
  priority text DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status text DEFAULT 'open' CHECK (status IN ('open','in_progress','done')),
  assigned_to uuid REFERENCES profiles(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage tasks" ON staff_tasks FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_id = staff_tasks.site_id AND role IN ('educator','group_lead','admin','caretaker')));

-- Sprint 38: shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  staff_id uuid REFERENCES profiles(id),
  shift_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  role_note text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, shift_date, start_time)
);
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view shifts" ON shifts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_id = shifts.site_id AND role IN ('educator','group_lead','admin','caretaker')));
CREATE POLICY "Admin manage shifts" ON shifts FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_id = shifts.site_id AND role IN ('admin','group_lead')));

-- Sprint 39: parent_meetings table
CREATE TABLE IF NOT EXISTS parent_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  site_id uuid NOT NULL,
  meeting_date date NOT NULL,
  attendees text,
  topics text NOT NULL,
  agreements text,
  next_meeting date,
  conducted_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE parent_meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage meetings" ON parent_meetings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND site_id = parent_meetings.site_id AND role IN ('educator','group_lead','admin','caretaker')));
