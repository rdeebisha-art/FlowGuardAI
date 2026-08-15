/*
# FlowGuard AI — Real-time data tables

1. New Tables
- `citizen_reports` — Community-submitted traffic reports (jams, accidents, road damage, illegal parking, broken signals). Includes category, location text, lat/lng, description, photo URL, status, upvotes, created_at.
- `road_damage` — AI-flagged road damage with camera photo, damage type, severity, repair priority, lat/lng, status, created_at.
- `parking_reservations` — Live parking slot reservations tied to a lot ID, duration, cost, slot number, status, created_at.

2. Realtime
- Add all three tables to the Supabase Realtime publication so INSERT/UPDATE/DELETE events broadcast instantly to every connected browser.

3. Security
- This is a single-tenant public demo (no sign-in screen). RLS enabled on every table with `TO anon, authenticated` CRUD policies so the anon-key frontend can read and write.
- `USING (true)` is intentional: all data is shared and visible across viewers (that's the point of a live city dashboard).

4. Notes
- All lat/lng stored as double precision for map plotting.
- created_at defaults to now() so client inserts don't need to send a timestamp.
- status columns default to the initial state of each entity.
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================
-- citizen_reports
-- ========================
CREATE TABLE IF NOT EXISTS citizen_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('Traffic Jam','Accident','Road Damage','Illegal Parking','Broken Signal')),
  location text NOT NULL,
  lat double precision,
  lng double precision,
  description text NOT NULL DEFAULT '',
  photo_url text,
  status text NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted','Under Review','Resolved')),
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE citizen_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_citizen_reports" ON citizen_reports;
CREATE POLICY "anon_select_citizen_reports" ON citizen_reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_citizen_reports" ON citizen_reports;
CREATE POLICY "anon_insert_citizen_reports" ON citizen_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_citizen_reports" ON citizen_reports;
CREATE POLICY "anon_update_citizen_reports" ON citizen_reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_citizen_reports" ON citizen_reports;
CREATE POLICY "anon_delete_citizen_reports" ON citizen_reports FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_citizen_reports_created_at ON citizen_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_category ON citizen_reports (category);

-- ========================
-- road_damage
-- ========================
CREATE TABLE IF NOT EXISTS road_damage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_type text NOT NULL CHECK (damage_type IN ('Pothole','Broken Road','Waterlogging','Obstacle','Damaged Sign')),
  location text NOT NULL,
  lat double precision,
  lng double precision,
  severity text NOT NULL DEFAULT 'Minor' CHECK (severity IN ('Minor','Moderate','Critical')),
  repair_priority text NOT NULL DEFAULT 'Low' CHECK (repair_priority IN ('Low','Medium','High','Urgent')),
  photo_url text,
  status text NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported','Scheduled','In Repair','Completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE road_damage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_road_damage" ON road_damage;
CREATE POLICY "anon_select_road_damage" ON road_damage FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_road_damage" ON road_damage;
CREATE POLICY "anon_insert_road_damage" ON road_damage FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_road_damage" ON road_damage;
CREATE POLICY "anon_update_road_damage" ON road_damage FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_road_damage" ON road_damage;
CREATE POLICY "anon_delete_road_damage" ON road_damage FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_road_damage_created_at ON road_damage (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_road_damage_status ON road_damage (status);

-- ========================
-- parking_reservations
-- ========================
CREATE TABLE IF NOT EXISTS parking_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id text NOT NULL,
  lot_name text NOT NULL,
  location text NOT NULL DEFAULT '',
  hours integer NOT NULL DEFAULT 1 CHECK (hours > 0 AND hours <= 24),
  cost integer NOT NULL DEFAULT 0,
  slot_number integer NOT NULL,
  status text NOT NULL DEFAULT 'Reserved' CHECK (status IN ('Reserved','Active','Completed','Cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE parking_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_parking_reservations" ON parking_reservations;
CREATE POLICY "anon_select_parking_reservations" ON parking_reservations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_parking_reservations" ON parking_reservations;
CREATE POLICY "anon_insert_parking_reservations" ON parking_reservations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_parking_reservations" ON parking_reservations;
CREATE POLICY "anon_update_parking_reservations" ON parking_reservations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_parking_reservations" ON parking_reservations;
CREATE POLICY "anon_delete_parking_reservations" ON parking_reservations FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_parking_reservations_created_at ON parking_reservations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parking_reservations_lot_id ON parking_reservations (lot_id);

-- ========================
-- Realtime publication
-- ========================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'citizen_reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.citizen_reports;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'road_damage'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.road_damage;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'parking_reservations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_reservations;
  END IF;
END $$;
