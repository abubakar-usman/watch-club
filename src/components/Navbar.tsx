"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown, X, Film, User } from "lucide-react";

export default function Navbar() {
  const activePath = usePathname();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (searchQuery === "") setIsSearchExpanded(false);
      }
      if (genreRef.current && !genreRef.current.contains(event.target as Node)) {
        setIsGenreOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
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

  // User dropdown menu items
  const userMenuItems = [
    {
      label: "Profile",
      href: "/portal",
      icon: <User size={15} />,
    },
    {
      label: "Watchlist",
      href: "/watchlist",
      icon: <Film size={15} />,
    },
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
              id="genre-dropdown-btn"
              onClick={() => setIsGenreOpen(!isGenreOpen)}
              className={`flex items-center gap-1.5 bg-transparent text-white text-[14px] px-4 py-1.5 rounded-[10px] transition-all duration-200 focus:outline-none border ${
                isGenreOpen
                  ? "border-white/50 bg-white/5"
                  : "border-white/30 hover:border-white/50 hover:bg-white/5"
              }`}
            >
              Genre{" "}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isGenreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isGenreOpen && (
              <div className="absolute top-full right-0 mt-3 w-[340px] bg-[#1A1A1A] border border-white/15 rounded-2xl p-6 shadow-2xl z-50">
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
              <button
                id="search-toggle-btn"
                onClick={() => setIsSearchExpanded(true)}
                className="text-white focus:outline-none"
              >
                <Search size={22} strokeWidth={2} />
              </button>
              {isSearchExpanded && (
                <>
                  <input
                    autoFocus
                    className="bg-transparent border-none outline-none text-white text-sm ml-2 w-full"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(""); setIsSearchExpanded(false); }}
                      className="text-white/50 hover:text-white ml-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* NOTIFICATION BELL — links to /notifications */}
          <Link
            href="/notifications"
            id="notifications-link"
            className="relative text-white hover:opacity-80 focus:outline-none transition-opacity"
            title="Notifications"
          >
            <Bell size={22} strokeWidth={2} />
            {/* Unread badge */}
            <span className="absolute -top-1 -right-1 w-[9px] h-[9px] rounded-full bg-[#E60813] border border-black" />
          </Link>

          {/* USER AVATAR + DROPDOWN CHEVRON */}
          <div ref={userRef} className="relative flex items-center gap-1.5">
            {/* Avatar */}
            <div
              className="w-[40px] h-[40px] rounded-[12px] overflow-hidden cursor-pointer border border-white/15 hover:border-white/40 transition-colors"
              onClick={() => setIsUserOpen((v) => !v)}
            >
              <Image
                src="/popcorn.png"
                alt="User"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>

            {/* Chevron next to avatar */}
            <button
              id="user-menu-chevron"
              onClick={() => setIsUserOpen((v) => !v)}
              className="text-white/70 hover:text-white transition-colors focus:outline-none p-0.5"
              aria-label="Open user menu"
            >
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${isUserOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* User Dropdown */}
            {isUserOpen && (
              <div
                className="absolute top-full right-0 mt-3 w-[180px] rounded-2xl border border-white/12 shadow-2xl overflow-hidden z-50"
                style={{ background: "#1A1A1A" }}
              >
                {userMenuItems.map((item, idx) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    id={`user-menu-${item.label.toLowerCase()}`}
                    onClick={() => setIsUserOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 text-[14px] font-medium text-[#C7C7C7] hover:text-white hover:bg-white/5 transition-all ${
                      idx !== userMenuItems.length - 1 ? "border-b border-white/8" : ""
                    }`}
                  >
                    <span className="text-[#E60813]">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}