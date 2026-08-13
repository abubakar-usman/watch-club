"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Send } from "lucide-react";

interface CommentItem {
  id: string;
  movie_id: number;
  user_id: string;
  parent_id: string | null;
  comment_text: string;
  rating: number | null;
  created_at: string;
}

interface DiscussionBoxProps {
  movieId: number;
  supabaseUrl?: string;
  supabasePublishableKey?: string;
}

export default function DiscussionBox({ movieId }: DiscussionBoxProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState<number | null>(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadComments() {
      try {
        const res = await fetch(`/api/comments?movie_id=${movieId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movie_id: movieId,
          comment_text: commentText.trim(),
          rating,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments([data.comment, ...comments]);
          setCommentText("");
        }
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="discussion" className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare size={20} className="text-brand-red" />
        <h2 className="font-heading text-2xl text-white">Community Discussion</h2>
      </div>

      {/* Post comment form */}
      <form onSubmit={handleSubmit} className="bg-black/40 border border-white/8 rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray">Rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 transition-colors ${rating && rating >= star ? "text-amber-400" : "text-white/20"}`}
              >
                <Star size={18} fill={rating && rating >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          placeholder="Share your thoughts on this title..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray/40 text-sm focus:outline-none focus:border-brand-red transition-colors"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            <span>{submitting ? "Posting..." : "Post Comment"}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-white/5 rounded-xl" />
          <div className="h-20 bg-white/5 rounded-xl" />
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-black/30 border border-white/5 rounded-xl p-8 text-center text-gray/50 font-mono text-sm">
          No comments yet. Be the first to start the discussion!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="bg-black/40 border border-white/8 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-gray/60">
                <span>User #{c.user_id?.slice(0, 8)}</span>
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">{c.comment_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
