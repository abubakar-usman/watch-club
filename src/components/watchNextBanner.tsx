"use client";

import React from "react";
import Link from "next/link";
import { Clapperboard, Users } from "lucide-react";

export default function WatchNextBanner() {
    return (
        <section className="watch-next-section">
            <div className="watch-next-container">

                <div className="watch-next-content">
                    <h2>NOT SURE WHAT TO WATCH NEXT?</h2>

                    <p>
                        Discover community-driven recommendations, honest reviews,
                        and trending Netflix content tailored for you.
                    </p>
                </div>

                <div className="watch-next-actions">

                    {/* Explore */}
                    <Link
                        href="/movies"
                        className="watch-next-button"
                    >
                        <Clapperboard size={17} />
                        <span>Explore</span>
                    </Link>

                    {/* Join Community */}
                    <Link
                        href="/community"
                        className="watch-next-button"
                    >
                        <Users size={17} />
                        <span>Join Community</span>
                    </Link>

                </div>

            </div>
        </section>
    );
}