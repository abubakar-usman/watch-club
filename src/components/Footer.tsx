import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const exploreLinks = [
    { name: "Movies", href: "/movies" },
    { name: "Series", href: "/series" },
    { name: "Genre", href: "/genre" },
    { name: "Top Rated", href: "/top-rated" },
  ];
  const communityLinks = [
    { name: "Discussion", href: "/community/discussion" },
    { name: "Reviews", href: "/community/reviews" },
    { name: "Members", href: "/community/members" },
    { name: "Leaderboard", href: "/community/leaderboard" },
  ];
  const supportLinks = [
    { name: "Help Center", href: "/support/help" },
    { name: "Contact Us", href: "/support/contact" },
    { name: "Terms Of Use", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ];

  return (
    <footer className="w-full flex justify-center mt-auto py-10 px-8">
      <div className="w-full max-w-[1400px] flex flex-row items-start justify-between gap-8">

        {/* Brand Column */}
        <div className="flex flex-col items-start gap-3 max-w-[260px] shrink-0">
          <Link href="/" className="shrink-0 block">
            <Image
              src="/bglogo.png"
              alt="WatchClub Logo"
              width={187}
              height={46}
              className="h-auto w-auto object-contain"
              priority
            />
          </Link>
          <p className="font-['Inter'] font-medium text-[12px] leading-[16px] text-[#C7C7C7]">
            Your guide to the best of netflix, powered by real viewers.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-row items-start gap-16 md:gap-24 shrink-0">

          {/* Explore Links */}
          <div className="flex flex-col items-start gap-2.5">
            {exploreLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-['Inter'] font-medium text-[13px] text-[#C7C7C7] hover:text-white transition-colors whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Community Links */}
          <div className="flex flex-col items-start gap-2.5">
            {communityLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-['Inter'] font-medium text-[13px] text-[#C7C7C7] hover:text-white transition-colors whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Support Links */}
          <div className="flex flex-col items-start gap-2.5">
            {supportLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-['Inter'] font-medium text-[13px] text-[#C7C7C7] hover:text-white transition-colors whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Email Column */}
        <div className="shrink-0 flex items-start">
          <a
            href="mailto:sarmaayafinancials@gmail.com"
            className="font-['Inter'] font-medium text-[13px] text-[#C7C7C7] hover:text-white transition-colors whitespace-nowrap"
          >
            sarmaayafinancials@gmail.com
          </a>
        </div>

      </div>
    </footer>
  );
}