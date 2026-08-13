-- Migration 3: Create trending_snapshot table

CREATE TABLE public.trending_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id TEXT NOT NULL,
  rank INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_url TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trending_snapshot ENABLE ROW LEVEL SECURITY;

-- Allow read access to trending_snapshot
CREATE POLICY "Anyone can read trending_snapshot"
  ON public.trending_snapshot
  FOR SELECT
  USING (true);

-- Allow all operations for snapshot management
CREATE POLICY "Anyone can manage trending_snapshot"
  ON public.trending_snapshot
  FOR ALL
  USING (true)
  WITH CHECK (true);
