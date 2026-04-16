-- Weekly meal plan (Speiseplan)
CREATE TABLE IF NOT EXISTS weekly_menus (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id     uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  week_start  date NOT NULL,           -- always the Monday of that week
  day         text NOT NULL,           -- 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
  meal_type   text NOT NULL DEFAULT 'lunch', -- 'breakfast' | 'lunch' | 'snack'
  title       text NOT NULL,
  description text,
  allergens   text[],
  is_vegetarian  boolean DEFAULT false,
  is_vegan       boolean DEFAULT false,
  created_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (site_id, week_start, day, meal_type)
);

ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;

-- Everyone on the site can read
CREATE POLICY "site_members_read_menus"
  ON weekly_menus FOR SELECT
  USING (site_id = my_site_id());

-- Only staff can write
CREATE POLICY "staff_write_menus"
  ON weekly_menus FOR ALL
  USING (is_staff() AND site_id = my_site_id())
  WITH CHECK (is_staff() AND site_id = my_site_id());

-- updated_at trigger
CREATE TRIGGER trg_weekly_menus_updated_at
  BEFORE UPDATE ON weekly_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add to Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_menus;
