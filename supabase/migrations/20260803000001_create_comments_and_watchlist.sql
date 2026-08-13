-- Migration 1: Create comments and watchlist tables

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL CHECK (char_length(comment_text) <= 1000),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT watchlist_user_id_movie_id_key UNIQUE (user_id, movie_id)
);