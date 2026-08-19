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
  const [topics] = useState<TrendingTopic[]>(initialTopics || defaultTopics);

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div
        className="relative w-full min-h-[242px] rounded-[10px] overflow-hidden flex items-center bg-[#1e1e1e]"
        style={{
          backgroundImage: `linear-gradient(to right, 
            rgba(55, 0, 0, 1) 0%, 
            rgba(55, 0, 0, 1) 25%, 
            rgba(55, 0, 0, 0.8) 45%, 
            rgba(0, 0, 0, 0) 70%
          ), url('/Frame_6.png')`,
          backgroundSize: "cover",
          backgroundPosition: "right center",
        }}
      >
        {/* Main Content Grid */}
        <div className="relative z-10 w-full grid grid-cols-[1.2fr_auto_1.5fr_1fr] items-center gap-12 pl-[50px] pr-8 py-6 max-[1100px]:grid-cols-1 max-[1100px]:px-8">

          {/* LEFT SIDE: Heading & Description */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[32px] font-semibold leading-[38px] uppercase text-white font-roboto">
              Join the community
            </h2>
            <p className="text-[#CCCCCC] text-[16px] font-medium leading-[19px] uppercase max-w-[380px]">
              Ask, discuss and share recommendations with thousands of netflix
              fans like you.
            </p>
            <Link
              href="/community"
              className="bg-[#E60813] text-white text-base font-bold py-[12px] px-[16px] rounded-[10px] flex items-center gap-3 w-fit transition-transform hover:scale-105 active:scale-95"
            >
              <Users size={20} />
              Join Community
            </Link>
          </div>

          {/* VERTICAL DIVIDER (Hidden on mobile) */}
          <div className="h-40 w-[1px] bg-white/20 max-[1100px]:hidden" />

          {/* RIGHT SIDE: Trending Discussions */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2.5 text-white text-xl font-bold">
              <Flame size={22} className="text-[#ff4d4d] fill-[#ff4d4d]" />
              <span>Trending Discussions</span>
            </div>

            <div className="flex flex-col gap-5">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={topic.href}
                  className="flex items-center justify-between gap-8 group no-underline"
                >
                  <span className="text-white text-base font-semibold group-hover:text-white/70 transition-colors">
                    {topic.title}
                  </span>
                  <span className="text-[#E50914] text-base font-bold whitespace-nowrap">
                    {topic.replies}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* SPACER COLUMN: This pushes content left to let the family image show clearly */}
          <div className="max-[1920px]:hidden" />
        </div>

        {/* Subtle overlay to ensure text readability if image is too bright */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>
    </section>
  );
}