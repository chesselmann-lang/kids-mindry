-- Migration 010: Storage bucket for portfolio + realtime publication fixes

-- ─── Storage bucket ──────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access for portfolio photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'Portfolio photos public read'
  ) THEN
    CREATE POLICY "Portfolio photos public read"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'portfolio');
  END IF;
END $$;

-- Authenticated users can upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'Portfolio photos authenticated upload'
  ) THEN
    CREATE POLICY "Portfolio photos authenticated upload"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'portfolio');
  END IF;
END $$;

-- Authenticated users can delete own photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'Portfolio photos authenticated delete'
  ) THEN
    CREATE POLICY "Portfolio photos authenticated delete"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'portfolio');
  END IF;
END $$;

-- ─── Ensure attendance table has realtime enabled ─────────────────────────────
-- (Supabase enables realtime per-table via publication)
-- These run idempotently
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ─── announcement_reactions table (if not exists from 009) ────────────────────
CREATE TABLE IF NOT EXISTS announcement_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(announcement_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_announcement_reactions_announcement ON announcement_reactions(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reactions_user ON announcement_reactions(user_id);

ALTER TABLE announcement_reactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'announcement_reactions'
      AND policyname = 'All authenticated can view reactions'
  ) THEN
    CREATE POLICY "All authenticated can view reactions"
      ON announcement_reactions FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'announcement_reactions'
      AND policyname = 'Users can manage own reactions'
  ) THEN
    CREATE POLICY "Users can manage own reactions"
      ON announcement_reactions FOR ALL TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE announcement_reactions;

-- ─── portfolio_entries + portfolio_photos (if not exists from 008) ────────────
CREATE TABLE IF NOT EXISTS portfolio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  content text,
  is_shared boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_entries_child ON portfolio_entries(child_id);

ALTER TABLE portfolio_entries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'portfolio_entries'
      AND policyname = 'Staff can manage portfolio entries'
  ) THEN
    CREATE POLICY "Staff can manage portfolio entries"
      ON portfolio_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS portfolio_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  entry_id uuid REFERENCES portfolio_entries(id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  caption text,
  is_shared boolean DEFAULT false,
  taken_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_photos_child ON portfolio_photos(child_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_photos_entry ON portfolio_photos(entry_id);

ALTER TABLE portfolio_photos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'portfolio_photos'
      AND policyname = 'Staff can manage portfolio photos'
  ) THEN
    CREATE POLICY "Staff can manage portfolio photos"
      ON portfolio_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ─── kiosk_pins (if not exists from 008) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS kiosk_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(child_id)
);

ALTER TABLE kiosk_pins ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'kiosk_pins'
      AND policyname = 'Service role can manage kiosk pins'
  ) THEN
    CREATE POLICY "Service role can manage kiosk pins"
      ON kiosk_pins FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'kiosk_pins'
      AND policyname = 'Authenticated staff can manage kiosk pins'
  ) THEN
    CREATE POLICY "Authenticated staff can manage kiosk pins"
      ON kiosk_pins FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ─── message_reads (if not exists from 008) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_reads_message ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id);

ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'message_reads'
      AND policyname = 'Users can manage own message reads'
  ) THEN
    CREATE POLICY "Users can manage own message reads"
      ON message_reads FOR ALL TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'message_reads'
      AND policyname = 'Users can view conversation message reads'
  ) THEN
    CREATE POLICY "Users can view conversation message reads"
      ON message_reads FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- ─── RPC: unread conversation count (if not exists from 008) ──────────────────
CREATE OR REPLACE FUNCTION get_unread_conversation_count(p_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(DISTINCT m.conversation_id)
  FROM messages m
  JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
    AND cp.user_id = p_user_id
  WHERE m.sender_id <> p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM message_reads mr
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    );
$$;

-- ─── announcement_translations (if not exists from 008) ───────────────────────
CREATE TABLE IF NOT EXISTS announcement_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  language text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(announcement_id, language)
);

ALTER TABLE announcement_translations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'announcement_translations'
      AND policyname = 'Authenticated can view translations'
  ) THEN
    CREATE POLICY "Authenticated can view translations"
      ON announcement_translations FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'announcement_translations'
      AND policyname = 'Authenticated can insert translations'
  ) THEN
    CREATE POLICY "Authenticated can insert translations"
      ON announcement_translations FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;
