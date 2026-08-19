"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown, X } from "lucide-react";

export default function Navbar() {
  const activePath = usePathname();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (searchQuery === "") setIsSearchExpanded(false);
      }
      if (genreRef.current && !genreRef.current.contains(event.target as Node)) {
        setIsGenreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Series", href: "/series" },
    { name: "Movies", href: "/movies" },
    { name: "Discussion", href: "/community" },
    { name: "About Us", href: "/about" },
  ];

  const genres = [
    { name: "Action", href: "/genre/action" },
    { name: "Adventure", href: "/genre/adventure" },
    { name: "Animation", href: "/genre/animation" },
    { name: "Comedy", href: "/genre/comedy" },
    { name: "Crime", href: "/genre/crime" },
    { name: "Documentary", href: "/genre/documentary" },
    { name: "Drama", href: "/genre/drama" },
    { name: "Fantasy", href: "/genre/fantasy" },
    { name: "Horror", href: "/genre/horror" },
    { name: "Mystery", href: "/genre/mystery" },
    { name: "Romance", href: "/genre/romance" },
    { name: "Sci-Fi", href: "/genre/sci-fi" },
    { name: "Thriller", href: "/genre/thriller" },
    { name: "Western", href: "/genre/western" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] h-[84px] bg-[#000000] border-b border-white/5">
      <div className="w-full max-w-[1400px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* LEFT: LOGO */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/bglogo.png"
              alt="WatchClub"
              width={187}
              height={46}
              priority
              className="h-[130px] w-auto object-contain"
            />
          </Link>
        </div>

        {/* CENTER: NAVIGATION */}
        <nav className="hidden lg:flex items-center justify-center flex-1">
          <ul className="flex items-center gap-[6px]">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? activePath === "/" : activePath?.startsWith(link.href);
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-[15px] px-6 py-2 rounded-full transition-all duration-300 font-medium whitespace-nowrap
                      ${isActive
                        ? "bg-[#1A1A1A] text-white"
                        : "text-white/80 hover:text-white"
                      }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-[20px] flex-shrink-0">

          {/* GENRE BUTTON & DROPDOWN */}
          <div ref={genreRef} className="relative">
            <button
              onClick={() => setIsGenreOpen(!isGenreOpen)}
              className="flex items-center gap-1.5 border border-white/20 bg-transparent hover:bg-white/5 text-white text-[14px] px-4 py-1.5 rounded-full transition-all focus:outline-none"
            >
              Genre <ChevronDown size={14} className={isGenreOpen ? "rotate-180 transition-transform duration-200" : "transition-transform duration-200"} />
            </button>

            {isGenreOpen && (
              <div className="absolute top-full right-0 mt-3 w-[340px] bg-[#262626] border border-white/10 rounded-2xl p-6 shadow-2xl z-50">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {genres.map((genre) => (
                    <Link
                      key={genre.name}
                      href={genre.href}
                      onClick={() => setIsGenreOpen(false)}
                      className="text-[#d4d4d8] hover:text-white text-[15px] font-medium transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SEARCH BAR */}
          <div ref={searchRef} className="relative flex items-center">
            <div className={`flex items-center transition-all duration-300 rounded-full ${isSearchExpanded ? "bg-[#1A1A1A] px-3 py-1.5 w-[200px]" : "w-auto"}`}>
              <button onClick={() => setIsSearchExpanded(true)} className="text-white focus:outline-none">
                <Search size={22} strokeWidth={2} />
              </button>
              {isSearchExpanded && (
                <input
                  autoFocus
                  className="bg-transparent border-none outline-none text-white text-sm ml-2 w-full"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* NOTIFICATION */}
          <button className="text-white hover:opacity-80 focus:outline-none">
            <Bell size={22} strokeWidth={2} />
          </button>

          {/* USER AVATAR */}
          <div className="w-[40px] h-[40px] rounded-[12px] overflow-hidden cursor-pointer border border-white/10 hover:scale-105 transition-transform">
            <Image
              src="/popcorn.png"
              alt="User"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}