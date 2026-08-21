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
    { name: "Terms of Use", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ];

  return (
    <footer className="w-full bg-[#282828] border-t border-[#535353] py-[36px] mt-auto">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Content Layout: 188px gap between logo block and nav columns, 104px gap between nav columns */}
        <div className="flex justify-between items-start gap-[188px] mb-12 max-[1024px]:flex-col max-[1024px]:gap-12">

          {/* Brand & Logo Column */}
          <div className="flex flex-col gap-4 shrink-0 max-w-[280px]">
            <Link href="/" className="inline-block" aria-label="WatchClub Home">
              <Image
                src="/bglogo.png"
                alt="WatchClub Logo"
                width={160}
                height={40}
                className="h-[60px] w-auto object-contain"
              />
            </Link>
            <p className="text-[#C7C7C7] text-[12px] font-medium leading-[1.6]">
              Your guide to the best of netflix, powered by real viewers.
            </p>
          </div>

          {/* Nav Columns Container with 104px gap between columns */}
          <div className="flex items-start justify-between gap-[104px] flex-1 max-[768px]:flex-wrap max-[768px]:gap-8">

            {/* Explore Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white text-[14px] font-semibold tracking-wide">Explore</h4>
              <ul className="list-none flex flex-col gap-2.5">
                {exploreLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[#C7C7C7] text-[12px] font-medium no-underline transition-colors duration-150 inline-block hover:text-[#E50914]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white text-[14px] font-semibold tracking-wide">Community</h4>
              <ul className="list-none flex flex-col gap-2.5">
                {communityLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[#C7C7C7] text-[12px] font-medium no-underline transition-colors duration-150 inline-block hover:text-[#E50914]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white text-[14px] font-semibold tracking-wide">Support</h4>
              <ul className="list-none flex flex-col gap-2.5">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[#C7C7C7] text-[12px] font-medium no-underline transition-colors duration-150 inline-block hover:text-[#E50914]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Email Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white text-[14px] font-semibold tracking-wide">Contact Us</h4>
              <a
                href="mailto:Sarmayafinancials@Gmail.com"
                className="text-[#C7C7C7] text-[12px] font-medium no-underline transition-colors duration-150 break-all inline-block hover:text-[#E50914]"
              >
                Sarmayafinancials@Gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex justify-center items-center text-[#C7C7C7] text-[12px] font-medium">
          <p>© {new Date().getFullYear()} WatchClub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
