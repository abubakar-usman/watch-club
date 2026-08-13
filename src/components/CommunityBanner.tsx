"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Flame } from "lucide-react";

export interface TrendingTopic {
  id: string | number;
  title: string;
  replies: string;
  href: string;
}

export default function CommunityBanner({
  topics: initialTopics,
}: {
  topics?: TrendingTopic[];
}) {
  const [topics, setTopics] = useState<TrendingTopic[]>(initialTopics || []);
  const [loading, setLoading] = useState(!initialTopics);

  useEffect(() => {
    if (initialTopics) {
      setTopics(initialTopics);
      setLoading(false);
      return;
    }

    async function fetchCommunityTopics() {
      try {
        const res = await fetch("/api/movies/trending/community");
        if (res.ok) {
          const data = await res.json();
          const movies = data.results || [];
          const fetchedTopics: TrendingTopic[] = movies.slice(0, 5).map((m: any) => ({
            id: m.id,
            title: `Discussion: ${m.title}`,
            replies: typeof m.comment_count === "number" ? `${m.comment_count} Comments` : "Community Active",
            href: `/movie/${m.id}#discussion`,
          }));
          setTopics(fetchedTopics);
        }
      } catch {
        // Handle error gracefully
      } finally {
        setLoading(false);
      }
    }

    fetchCommunityTopics();
  }, [initialTopics]);

  return (
    <section className="community__section">
      <div className="community__card">
        {/* Left Column: Callout */}
        <div className="community__left-col">
          <h2 className="community__heading">Join The Community</h2>
          <p className="community__sub-text">
            Ask, discuss and share recommendations with thousands of fans like you.
          </p>
          <Link href="/watchlist" className="community__cta-btn">
            <Users size={18} />
            <span>Join Community</span>
          </Link>
        </div>

        {/* Right Column: Trending Discussions */}
        <div className="community__right-col">
          <div className="community__trending-header">
            <Flame size={20} className="community__flame-icon" />
            <span>Trending Discussions</span>
          </div>

          <div className="community__discussion-list">
            {loading ? (
              <div style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Loading discussions...
              </div>
            ) : topics.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "monospace", fontSize: "0.75rem", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "var(--radius-lg)", background: "rgba(0,0,0,0.2)" }}>
                No active community discussions yet. Post comments on movie pages to participate!
              </div>
            ) : (
              topics.map((topic) => (
                <Link key={topic.id} href={topic.href} className="community__discussion-item">
                  <span className="community__item-title">{topic.title}</span>
                  <span className="community__reply-count">{topic.replies}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
