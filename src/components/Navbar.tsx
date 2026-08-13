"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, X, LogIn } from "lucide-react";

const genres = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Western",
];



interface NavbarProps {
  activePath?: string;
}

export default function Navbar({ activePath = "/" }: NavbarProps) {
  const router = useRouter();
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsGenreOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Series", href: "/series" },
    { name: "Movies", href: "/movies" },
    { name: "Community", href: "/community" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <header className="navbar__header">
      <div className="navbar__container">
        {/* Left Section: Logo only */}
        <div className="navbar__left">
          <Link href="/" className="navbar__logo-link" aria-label="WatchClub Home">
            <Image
              src="/bglogo.png"
              alt="WatchClub Logo"
              width={160}
              height={40}
              priority
              className="navbar__logo-image"
            />
          </Link>
        </div>

        {/* Center Section: Main Navigation */}
        <div className="navbar__center">
          <nav>
            <ul className="navbar__nav-list">
              {navLinks.map((link) => {
                const isActive = activePath === link.href;
                return (
                  <li key={link.name} className="navbar__nav-item">
                    <Link
                      href={link.href}
                      className={`navbar__nav-link${isActive ? " navbar__nav-link--active" : ""}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}

              {/* Genre Dropdown */}
              <li className="navbar__nav-item">
                <div className="navbar__dropdown-wrapper" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`navbar__dropdown-trigger${isGenreOpen ? " navbar__dropdown-trigger--active" : ""}`}
                    onClick={() => setIsGenreOpen(!isGenreOpen)}
                    aria-expanded={isGenreOpen}
                    aria-label="Toggle Genre dropdown"
                  >
                    <span>Genre</span>
                    <ChevronDown
                      size={16}
                      className={`navbar__dropdown-chevron${isGenreOpen ? " navbar__dropdown-chevron--open" : ""}`}
                    />
                  </button>

                  {isGenreOpen && (
                    <div className="navbar__dropdown-menu">
                      {genres.map((genre) => (
                        <Link
                          key={genre}
                          href={`/genre/${genre.toLowerCase()}`}
                          className="navbar__genre-item"
                          onClick={() => setIsGenreOpen(false)}
                        >
                          {genre}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right Section: Search, Notifications, Login CTA */}
        <div className="navbar__right">
          <div className="navbar__search-wrapper">
            {isSearchOpen ? (
              <div className="navbar__search-input-container">
                <Search size={16} className="navbar__search-icon-inside" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search movies, series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="navbar__search-input"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="navbar__clear-search"
                    aria-label="Clear search text"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="navbar__clear-search"
                    aria-label="Close search input"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="navbar__search-btn"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open search bar"
              >
                <Search size={20} />
              </button>
            )}
          </div>

          <div className="navbar__notif-wrapper" ref={notificationRef}>
            <button
              type="button"
              className="navbar__icon-btn"
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setUnreadNotifications(false);
              }}
              aria-label="View notifications"
            >
              <Bell size={20} />
              {unreadNotifications && <span className="navbar__badge" />}
            </button>

            {isNotificationOpen && (
              <div className="navbar__notif-menu">
                <div className="navbar__notif-header">
                  <span>Notifications</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    0 New
                  </span>
                </div>
                <div style={{ padding: "1rem", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  No new notifications.
                </div>
              </div>
            )}
          </div>

          <Link href="/login" className="navbar__login-btn">
            <LogIn size={16} />
            <span>Login</span>
          </Link>
        </div>
      </div>
    </header>
  );
}