-- Migration 2: Enable RLS and define security policies for comments and watchlist

-- Enable Row Level Security (RLS)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Comments Policies
-- ==========================================

-- 1. Anyone can read comments
CREATE POLICY "Anyone can read comments"
  ON public.comments
  FOR SELECT
  USING (true);

-- 2. Users can insert their own comments
CREATE POLICY "Users can insert their own comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON public.comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- Watchlist Policies (Private to owner)
-- ==========================================

-- 1. Users can read their own watchlist items
CREATE POLICY "Users can read their own watchlist"
  ON public.watchlist
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Users can insert into their own watchlist
CREATE POLICY "Users can insert into their own watchlist"
  ON public.watchlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can delete from their own watchlist
CREATE POLICY "Users can delete from their own watchlist"
  ON public.watchlist
  FOR DELETE
  USING (auth.uid() = user_id);
