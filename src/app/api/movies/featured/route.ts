import { NextResponse } from "next/server";
import { withRepositoryAuth } from "@/lib/data";
import { getMovieProvider } from "@/lib/providers";

const movieProvider = getMovieProvider();

// Single source of truth for the "frozen" hero pick — change this one line to swap it later.
const FEATURED_HERO_TITLE = "The Last House";

export const GET = withRepositoryAuth(
    { auth: "none" },
    async () => {
        try {
            const searchData = await movieProvider.search(FEATURED_HERO_TITLE);
            const pinned = (searchData.results || []).find((m: { title?: string; name?: string }) =>
                (m.title || m.name || "").toLowerCase().includes(FEATURED_HERO_TITLE.toLowerCase())
            );

            if (pinned) {
                return NextResponse.json({
                    page: 1,
                    results: [pinned],
                    total_pages: 1,
                    total_results: 1,
                });
            }

            // Fallback: real trending, first item only, if the pin isn't found
            const providerData = await movieProvider.fetchTrending("day", 1, 1);
            return NextResponse.json({
                page: 1,
                results: providerData.results || [],
                total_pages: 1,
                total_results: (providerData.results || []).length,
            });
        } catch (error: unknown) {
            console.error("Failed to fetch featured hero movie:", error);
            const message =
                error instanceof Error ? error.message : "Internal Server Error";
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }
);