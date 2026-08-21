"use client";

import React from "react";
import Link from "next/link";
import { Clapperboard, Users } from "lucide-react";

export default function WatchNextBanner() {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full min-h-[173px] bg-[#282828] border border-[#535353] rounded-[10px] py-[41px] px-[44px] flex items-center justify-between gap-[77px] max-[900px]:flex-col max-[900px]:items-stretch max-[900px]:gap-6 max-[900px]:px-6 max-[900px]:py-6">

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h2 className="m-0 mb-2 text-white text-[32px] font-semibold leading-[38px] uppercase font-roboto">
            NOT SURE WHAT TO WATCH NEXT?
          </h2>
          <p className="max-w-[600px] m-0 text-[#EEEEEE] text-sm leading-relaxed">
            Discover community-driven recommendations, honest reviews,
            and trending Netflix content tailored for you.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 shrink-0 max-[900px]:w-full max-[900px]:gap-3">

          {/* Explore */}
          <Link
            href="/movies"
            className="inline-flex items-center justify-center gap-2 py-[14px] px-[16px] bg-[#E60813] text-white rounded-[10px] text-[18px] font-semibold no-underline whitespace-nowrap transition-all duration-150 hover:bg-[#F40612] max-[900px]:flex-1"
          >
            <Clapperboard size={20} />
            <span>Explore</span>
          </Link>

          {/* Join Community */}
          <Link
            href="/community"
            className="inline-flex items-center justify-center gap-2 py-[14px] px-[16px] bg-[#E60813] text-white rounded-[10px] text-[18px] font-semibold no-underline whitespace-nowrap transition-all duration-150 hover:bg-[#F40612] max-[900px]:flex-1"
          >
            <Users size={20} />
            <span>Join Community</span>
          </Link>
        </div>
      </div>
    </section>
  );
}