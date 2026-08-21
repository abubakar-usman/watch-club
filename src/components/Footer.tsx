import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const exploreLinks = [{ name: "Movies", href: "/movies" }, { name: "Series", href: "/series" }, { name: "Genre", href: "/genre" }, { name: "Top Rated", href: "/top-rated" }];
  const communityLinks = [{ name: "Discussion", href: "/community/discussion" }, { name: "Reviews", href: "/community/reviews" }, { name: "Members", href: "/community/members" }, { name: "Leaderboard", href: "/community/leaderboard" }];
  const supportLinks = [{ name: "Help Center", href: "/support/help" }, { name: "Contact Us", href: "/support/contact" }, { name: "Terms of Use", href: "/terms" }, { name: "Privacy Policy", href: "/privacy" }];

  return (
    // 1. Added w-screen and max-w-none to ensure the outer tag isn't restricted by a parent
    <footer className="w-full flex justify-center mt-auto bg-transparent overflow-visible">

      {/* 2. Added min-w-[1400px] to FORCE the width regardless of parent squeezing */}
      <div className="w-[1400px] min-w-[1400px] h-[185px] px-[72px] py-[36px] flex flex-row items-center gap-[188px] flex-shrink-0">

        {/* Brand Column: Gap 16px */}
        <div className="w-[249px] h-[99px] flex flex-col items-start gap-[16px] shrink-0">
          <Link href="/" className="w-[187px] h-[46px] relative block shrink-0">
            <Image
              src="/bglogo.png"
              alt="WatchClub Logo"
              fill
              className="object-contain object-left" // Ensures logo stays to the left
              priority
            />
          </Link>
          <p className="w-[249px] h-[37px] font-['Inter'] font-medium text-[12px] leading-[15px] text-[#C7C7C7]">
            Your guide to the best of netflix, powered by real viewers.
          </p>
        </div>

        {/* Navigation Container: Gap 104px */}
        <div className="w-[843px] h-[113px] flex flex-row justify-between items-center gap-[104px] shrink-0">

          <div className="w-[59px] h-[113px] flex flex-col items-start gap-[12px] shrink-0">
            <h4 className="font-['Inter'] font-semibold text-[14px] leading-[17px] text-white capitalize">Explore</h4>
            <div className="flex flex-col items-start gap-[8px]">
              {exploreLinks.map((link) => (
                <Link key={link.name} href={link.href} className="font-['Inter'] font-medium text-[12px] leading-[15px] text-[#C7C7C7] capitalize hover:text-white whitespace-nowrap">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-[79px] h-[113px] flex flex-col items-start gap-[12px] shrink-0">
            <h4 className="font-['Inter'] font-semibold text-[14px] leading-[17px] text-white capitalize">Community</h4>
            <div className="flex flex-col items-start gap-[8px]">
              {communityLinks.map((link) => (
                <Link key={link.name} href={link.href} className="font-['Inter'] font-medium text-[12px] leading-[15px] text-[#C7C7C7] capitalize hover:text-white whitespace-nowrap">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-[80px] h-[113px] flex flex-col items-start gap-[12px] shrink-0">
            <h4 className="font-['Inter'] font-semibold text-[14px] leading-[17px] text-white capitalize">Support</h4>
            <div className="flex flex-col items-start gap-[8px]">
              {supportLinks.map((link) => (
                <Link key={link.name} href={link.href} className="font-['Inter'] font-medium text-[12px] leading-[15px] text-[#C7C7C7] capitalize hover:text-white whitespace-nowrap">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-[186px] h-[44px] flex flex-col items-start gap-[12px] self-start shrink-0">
            <h4 className="font-['Inter'] font-semibold text-[14px] leading-[17px] text-white capitalize">Contact Us</h4>
            <a href="mailto:sarmaayafinancials@gmail.com" className="font-['Inter'] font-medium text-[12px] leading-[15px] text-[#C7C7C7] hover:text-white whitespace-nowrap">
              sarmaayafinancials@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}