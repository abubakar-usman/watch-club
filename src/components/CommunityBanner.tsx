"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Flame } from "lucide-react";

export interface TrendingTopic {
  id: string | number;
  title: string;
  replies: string;
  href: string;
}

const defaultTopics: TrendingTopic[] = [
  {
    id: "dark-discussion",
    title: "Should i watch dark? Is it too confusing?",
    replies: "456 Replies",
    href: "/community",
  },
  {
    id: "k-thriller",
    title: "Best korean thriller on netflix right now?",
    replies: "456 Replies",
    href: "/community",
  },
  {
    id: "short-thriller",
    title: "Recommend a thriller under 10 ep?",
    replies: "456 Replies",
    href: "/community",
  },
];

export default function CommunityBanner({
  topics: initialTopics,
}: {
  topics?: TrendingTopic[];
}) {
  const [topics] = useState<TrendingTopic[]>(
    initialTopics || defaultTopics
  );

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "24px 0",
      }}
    >
      <div
        style={{
          position: "relative",
          minHeight: "180px",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",

          // Frame 6 is now the background of the WHOLE banner
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(55, 0, 0, 0.82) 0%,
              rgba(30, 0, 0, 0.70) 35%,
              rgba(10, 10, 10, 0.30) 100%
            ),
            url("/Frame_6.png")
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",

          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          alignItems: "center",
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            padding: "28px 36px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#fff",
              lineHeight: "1.1",
              margin: "0 0 14px 0",
            }}
          >
            JOIN THE COMMUNITY
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "13px",
              lineHeight: "1.5",
              margin: "0 0 18px 0",
              maxWidth: "290px",
            }}
          >
            Ask, discuss and share recommendations with thousands of netflix
            fans like you.
          </p>

          <Link
            href="/community"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              background: "#111",
              color: "#fff",
              padding: "9px 15px",
              borderRadius: "7px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "13px",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Users size={15} />
            Join Community
          </Link>
        </div>

        {/* VERTICAL DIVIDER */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            borderLeft: "1px solid rgba(255,255,255,0.18)",
            padding: "20px 25px",
            minHeight: "120px",
          }}
        >
          {/* TRENDING HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              marginBottom: "8px",
            }}
          >
            <Flame
              size={15}
              fill="#777"
              color="#777"
            />

            <span
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: "12px",
              }}
            >
              Trending Discussions
            </span>
          </div>

          {/* DISCUSSIONS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {topics.map((topic, index) => (
              <Link
                key={topic.id}
                href={topic.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  padding: "10px 0",
                  textDecoration: "none",
                  borderBottom:
                    index !== topics.length - 1
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "none",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.92)",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {topic.title}
                </span>

                <span
                  style={{
                    color: "rgba(255,255,255,0.25)",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {topic.replies}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}