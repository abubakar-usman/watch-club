"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import Image from "next/image";
import Link from "next/link";

const DEFAULT_POSTER =
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop";

export interface TopTenItem {
  rank: number;
  id?: string | number;
  title: string;
  category: string;
  image: string;
}

/* =========================================================
   SINGLE CARD

   Number + poster are ONE horizontal composition.

   NUMBER
   - left
   - oversized
   - behind poster

   POSTER
   - right
   - overlaps number
   - above number
   ========================================================= */

function TopTenCardItem({
  item,
}: {
  item: TopTenItem;
}) {
  const [imgSrc, setImgSrc] = useState<string>(
    item.image || DEFAULT_POSTER
  );

  return (
    <Link
      href={item.id ? `/movie/${item.id}` : "#"}
      draggable={false}
      className="
        relative
        flex-none
        w-[240px]
        h-[199px]
        cursor-pointer
        select-none
        overflow-visible
      "
    >
      {/* =====================================================
         NUMBER
         ===================================================== */}

      <span
        className="
          absolute
          left-0
          top-[-51px]
          z-[1]
          pointer-events-none
          select-none
          whitespace-nowrap
          font-['Inter']
          font-[800]
          text-[264px]
          leading-[100%]
          tracking-[0px]
          text-transparent
        "
        style={{
          WebkitTextStroke: "2px #959292",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {item.rank}
      </span>

      {/* =====================================================
         POSTER
         ===================================================== */}

      <div
        className="
          absolute
          left-[100.45px]
          top-0
          z-[2]
          w-[139.45px]
          h-[198.1px]
          overflow-hidden
          bg-[#333333]
        "
        style={{
          boxShadow: "-10px 0px 20px rgba(0, 0, 0, 0.5)",
          borderRadius: "10px 20px 20px 10px",
        }}
      >
        <Image
          src={imgSrc}
          alt={item.title || "Poster"}
          fill
          sizes="140px"
          className="object-cover"
          unoptimized
          draggable={false}
          onError={() => setImgSrc(DEFAULT_POSTER)}
        />
      </div>
    </Link>
  );
}

/* =========================================================
   TOP TEN CAROUSEL
   ========================================================= */

export default function TopTenCarousel({
  items: initialItems,
}: {
  items?: TopTenItem[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<TopTenItem[]>(
    initialItems || []
  );

  const [loading, setLoading] = useState(
    !initialItems || initialItems.length === 0
  );

  const [activeIndex, setActiveIndex] = useState(0);

  /* =========================================================
     FETCH MOVIES
     ========================================================= */

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      return;
    }

    async function fetchTopTen() {
      try {
        const res = await fetch("/api/movies/trending");

        if (!res.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await res.json();

        const formatted: TopTenItem[] = (data.results || [])
          .slice(0, 10)
          .map((m: any, idx: number) => {
            const image =
              m.posterUrl ||
              m.poster ||
              (m.poster_path
                ? m.poster_path.startsWith("http")
                  ? m.poster_path
                  : `https://image.tmdb.org/t/p/w500${m.poster_path}`
                : DEFAULT_POSTER);

            const category =
              Array.isArray(m.genre_names) &&
                m.genre_names.length > 0
                ? m.genre_names
                  .slice(0, 2)
                  .join(" • ")
                : m.category || "Popular";

            return {
              rank: idx + 1,
              id: m.id,
              title:
                m.title ||
                m.name ||
                "Untitled",
              category,
              image: image || DEFAULT_POSTER,
            };
          });

        setItems(formatted);
      } catch (err) {
        console.error(
          "TopTenCarousel fetch error:",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTopTen();
  }, [initialItems]);

  /* =========================================================
     UPDATE ACTIVE SLIDE
     ========================================================= */

  const handleScroll = useCallback(() => {
    const track = trackRef.current;

    if (!track) return;

    const itemWidth = 240 + 32;

    const index = Math.round(
      track.scrollLeft / itemWidth
    );

    setActiveIndex(index);
  }, []);

  /* =========================================================
     IMPORTANT:
     HANDLE MOUSE WHEEL

     Vertical wheel:
       → page scrolls

     Horizontal wheel:
       → movie cards scroll
     ========================================================= */

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const track = trackRef.current;

      if (!track) return;

      /*
       * If the user is using horizontal scrolling
       * (trackpad horizontal gesture / Shift + wheel),
       * move the movie cards.
       */

      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        event.preventDefault();

        track.scrollLeft += event.deltaX;

        return;
      }

      /*
       * Normal mouse wheel / vertical trackpad movement.
       *
       * DO NOT let the carousel trap the page.
       *
       * Send the vertical movement to the page instead.
       */

      if (Math.abs(event.deltaY) > 0) {
        event.preventDefault();

        window.scrollBy({
          top: event.deltaY,
          left: 0,
          behavior: "auto",
        });
      }
    },
    []
  );

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <section
      className="
        w-full
        max-w-[1328px]
        mx-auto
        flex
        flex-col
        items-start
        gap-[8px]
      "
    >
      {/* =====================================================
         HEADER
         ===================================================== */}

      <div className="flex items-center justify-between w-full">
        <h2
          className="
            w-max
            h-[24px]
            font-['Inter']
            font-semibold
            text-[20px]
            leading-[120%]
            text-white
            capitalize
            whitespace-nowrap
          "
        >
          Top 10 Recommendations For Today
        </h2>

        {/* =================================================
           PAGINATION
           ================================================= */}

        {!loading && items.length > 0 && (
          <div
            className="
              flex
              items-center
              gap-[4px]
              w-[28px]
            "
          >
            <div
              className="
                w-[12px]
                h-0
                border-[2px]
                transition-colors
                duration-300
              "
              style={{
                borderColor:
                  activeIndex === 0
                    ? "#FFFFFF"
                    : "#9A9191",
              }}
            />

            <div
              className="
                w-[12px]
                h-0
                border-[2px]
                transition-colors
                duration-300
              "
              style={{
                borderColor:
                  activeIndex > 0
                    ? "#FFFFFF"
                    : "#9A9191",
              }}
            />
          </div>
        )}
      </div>

      {/* =====================================================
         LOADING
         ===================================================== */}

      {loading ? (
        <div
          className="
            w-full
            h-[250px]
            bg-white/5
            animate-pulse
            rounded-lg
          "
        />
      ) : (
        /* ===================================================
           CAROUSEL VIEWPORT

           IMPORTANT:

           This is ONLY responsible for horizontal
           scrolling.

           Vertical wheel movement is manually sent
           back to the page.
           =================================================== */

        <div
          ref={trackRef}
          onScroll={handleScroll}
          onWheel={handleWheel}
          className="
            relative
            w-full
            h-[250px]
            overflow-x-auto
            overflow-y-hidden
            scroll-smooth
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {/* =================================================
             HORIZONTAL TRACK

             51px top padding gives the oversized numbers
             enough room above the posters.

             CARD ITSELF REMAINS 199px.
             ================================================= */}

          <div
            className="
              flex
              flex-row
              items-start
              gap-[32px]
              w-max
              min-w-full
              h-[199px]
              pt-[51px]
            "
          >
            {items.map((item) => (
              <TopTenCardItem
                key={item.id ?? item.rank}
                item={item}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}