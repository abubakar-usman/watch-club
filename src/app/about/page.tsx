import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Us | WatchClub",
  description:
    "Learn about WatchClub — a community-powered platform where real viewers help you discover movies and series worth watching.",
};

export default function AboutPage() {
  return (
    <main className="w-full flex flex-col items-center bg-[#282828] gap-8 pb-0">
      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section
        className="w-full max-w-[1344px] mx-auto rounded-[12px] bg-black overflow-hidden flex-shrink-0"
        style={{ height: "400px" }}
      >
        <div className="w-full h-full flex flex-row justify-between items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col items-start gap-7 px-[60px] py-[61px] w-[454px] shrink-0">
            {/* Headline + description */}
            <div className="flex flex-col items-start gap-[18px]">
              <h1
                className="text-white font-semibold text-[40px] leading-[47px] capitalize"
                style={{ fontFamily: "Roboto, sans-serif", width: "319px" }}
              >
                Find Your Next Favorite Through Real Reviews
              </h1>
              <p
                className="text-white text-[14px] leading-[17px] capitalize"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  width: "454px",
                }}
              >
                WatchClub is a community-powered platform where real viewers help
                you discover movies and series worth watching according to your
                taste.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-row items-center gap-2 w-full">
              {/* Explore Button */}
              <Link
                href="/movies"
                id="about-explore-btn"
                className="flex flex-row justify-center items-center gap-1 px-3 py-3 rounded-[40px] bg-[#E60813] text-white text-[14px] font-medium capitalize"
                style={{ fontFamily: "Inter, sans-serif", width: "109px", height: "40px" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.33337 8H12.6667"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.66663 4L12.6666 8L8.66663 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Explore
              </Link>

              {/* Join Community Button */}
              <Link
                href="/community"
                id="about-join-community-btn"
                className="flex flex-row justify-center items-center gap-1 px-3 py-3 rounded-[40px] border border-white text-white text-[14px] font-medium capitalize"
                style={{
                  fontFamily: "Inter, sans-serif",
                  width: "155px",
                  height: "40px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="8"
                    y1="3.33"
                    x2="8"
                    y2="12.67"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="3.33"
                    y1="8"
                    x2="12.67"
                    y2="8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Join Community
              </Link>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div
            className="relative shrink-0"
            style={{ width: "781px", height: "400px", borderRadius: "0 12px 12px 0", overflow: "hidden" }}
          >
            <Image
              src="/aboutus.png"
              alt="WatchClub Hero — Find Your Next Favorite"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Gradient overlay fading from black on the left */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90.18deg, #000000 4.83%, rgba(40,40,40,0) 27.43%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ─── Problem Section ──────────────────────────────────────── */}
      <section
        className="w-full max-w-[1344px] mx-auto rounded-[12px] flex flex-row justify-between items-center overflow-hidden shrink-0"
        style={{
          height: "202px",
          background: "#282828",
          border: "1px solid #535353",
          paddingLeft: "60px",
        }}
      >
        {/* Left: Text */}
        <div
          className="flex flex-col items-start gap-2 shrink-0"
          style={{ width: "406px" }}
        >
          <span
            className="text-[#E60813] text-[14px] font-medium capitalize w-full"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            The Problem
          </span>
          <div className="flex flex-col items-start gap-[18px] w-full">
            <h2
              className="text-white font-semibold text-[20px] leading-[24px] capitalize w-full"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Endless Scrolling, Still Nothing To Watch?
            </h2>
            <p
              className="text-white text-[14px] leading-[17px] capitalize w-full"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
            >
              With thousands of movies and series, finding something genuinely
              worth watching can be harder than watching it.
            </p>
          </div>
        </div>

        {/* Right: Image */}
        <div
          className="relative shrink-0"
          style={{ width: "711px", height: "200px" }}
        >
          <Image
            src="/about-us.png"
            alt="What should I watch tonight?"
            fill
            className="object-cover object-center"
          />
          {/* Gradient overlay fading from left */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #282828 0%, rgba(40,40,40,0) 28.27%)",
            }}
          />
        </div>
      </section>

      {/* ─── Mission Statement Cards ───────────────────────────────── */}
      <div className="w-full max-w-[1344px] mx-auto flex flex-col gap-3">
        {/* Card 1 */}
        <div
          className="w-full flex flex-row items-center gap-6 px-5 rounded-[6px] shrink-0"
          style={{ height: "70px", background: "#302F2F" }}
        >
          <div
            className="shrink-0"
            style={{
              width: "4px",
              height: "46px",
              background: "#E60813",
              borderRadius: "2px",
            }}
          />
          <p
            className="text-white text-[16px] leading-[19px] capitalize"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
          >
            Finding something great to watch should feel simple.
          </p>
        </div>

        {/* Card 2 */}
        <div
          className="w-full flex flex-row items-center gap-6 px-5 rounded-[6px] shrink-0"
          style={{ height: "70px", background: "#302F2F" }}
        >
          <div
            className="shrink-0"
            style={{
              width: "4px",
              height: "46px",
              background: "#E60813",
              borderRadius: "2px",
            }}
          />
          <p
            className="text-white text-[16px] leading-[19px] capitalize"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
          >
            Real opinions from real viewers — not algorithms, not ads.
          </p>
        </div>
      </div>
    </main>
  );
}
