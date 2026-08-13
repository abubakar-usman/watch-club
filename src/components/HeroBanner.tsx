"use client";

import React, { useState } from "react";
import { Star, ThumbsUp, MessageSquare, Plus, Info, Check, Trophy } from "lucide-react";

interface HeroData {
  title: string;
  subtitle: string;
  clubScore: string;
  recommendedPercent: string;
  commentCount: string;
  tags: string[];
  description: string;
  award: string;
}

const defaultHeroData: HeroData = {
  title: "Demon Slayer",
  subtitle: "Kimetsu No Yaiba",
  clubScore: "9.8",
  recommendedPercent: "96%",
  commentCount: "0k+",
  tags: ["Movie", "Violence", "Suicide", "2025", "18+"],
  description:
    "After Tragedy Strikes His Family, A Young Demon Slayer Embarks On A Dangerous Quest To Protect His Sister And Defeat Evil.",
  award: "Emmy Winner",
};

export default function HeroBanner({ data = defaultHeroData }: { data?: HeroData }) {
  const [inWatchlist, setInWatchlist] = useState(false);

  return (
    <section className="hero__section">
      <div className="hero__content">
        {/* Title */}
        <div className="hero__title-container">
          <h1 className="hero__main-title">{data.title}</h1>
          <span className="hero__subtitle">{data.subtitle}</span>
        </div>

        {/* Badges Row */}
        <div className="hero__badge-row">
          <div className="hero__badge">
            <Star size={18} className="hero__star-icon" />
            <span className="hero__badge-value">{data.clubScore}</span>
            <span className="hero__badge-label">Club Score</span>
          </div>

          <div className="hero__badge">
            <ThumbsUp size={18} className="hero__thumb-icon" />
            <span className="hero__badge-value">{data.recommendedPercent}</span>
            <span className="hero__badge-label">Recommended</span>
          </div>

          <div className="hero__badge">
            <MessageSquare size={18} className="hero__comment-icon" />
            <span className="hero__badge-value">{data.commentCount}</span>
            <span className="hero__badge-label">Comments</span>
          </div>
        </div>

        {/* Tag Row */}
        <div className="hero__tag-row">
          {data.tags.map((tag) => (
            <span
              key={tag}
              className={`hero__tag${tag === "18+" || tag === "Violence" ? " hero__tag--accent" : ""}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="hero__description">{data.description}</p>

        {/* Action Buttons */}
        <div className="hero__button-group">
          <button
            type="button"
            className="hero__primary-btn"
            onClick={() => setInWatchlist(!inWatchlist)}
            aria-label="Add to Watchlist"
          >
            {inWatchlist ? (
              <>
                <Check size={18} />
                <span>In Watchlist</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Add To Watchlist</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="hero__secondary-btn"
            aria-label="More Info"
          >
            <Info size={18} />
            <span>More Info</span>
          </button>
        </div>
      </div>

      {/* Award Badge */}
      {data.award && (
        <div className="hero__award-badge">
          <Trophy size={16} />
          <span>{data.award}</span>
        </div>
      )}
    </section>
  );
}
