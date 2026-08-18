"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  X,
  LogIn,
  Menu,
} from "lucide-react";

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

export default function Navbar() {
  const router = useRouter();
  // Auto-detects the current route — no need to pass activePath from every page
  const activePath = usePathname();

  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsGenreOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsGenreOpen(false);
  };

  return (
    <header className="navbar__header">
      <div className="navbar__container">

        {/* LEFT: LOGO */}
        <div className="navbar__left">
          <Link
            href="/"
            className="navbar__logo-link"
            aria-label="WatchClub Home"
          >
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

        {/* CENTER: DESKTOP NAVIGATION */}
        <div className="navbar__center">
          <nav>
            <ul className="navbar__nav-list">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? activePath === "/"
                    : activePath?.startsWith(link.href);

                return (
                  <li
                    key={link.name}
                    className="navbar__nav-item"
                  >
                    <Link
                      href={link.href}
                      className={`navbar__nav-link${isActive
                        ? " navbar__nav-link--active"
                        : ""
                        }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="navbar__right">

          {/* GENRE DROPDOWN */}
          <div
            className="navbar__dropdown-wrapper"
            ref={dropdownRef}
          >
            <button
              type="button"
              className={`navbar__dropdown-trigger${isGenreOpen
                ? " navbar__dropdown-trigger--active"
                : ""
                }`}
              onClick={() => setIsGenreOpen(!isGenreOpen)}
              aria-expanded={isGenreOpen}
              aria-label="Toggle Genre dropdown"
            >
              <span>Genre</span>

              <ChevronDown
                size={14}
                className={`navbar__dropdown-chevron${isGenreOpen
                  ? " navbar__dropdown-chevron--open"
                  : ""
                  }`}
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

          {/* SEARCH */}
          <div className="navbar__search-wrapper">
            {isSearchOpen ? (
              <div className="navbar__search-input-container">
                <Search
                  size={16}
                  className="navbar__search-icon-inside"
                />

                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      searchQuery.trim()
                    ) {
                      router.push(
                        `/search?q=${encodeURIComponent(
                          searchQuery.trim()
                        )}`
                      );
                    }
                  }}
                  className="navbar__search-input"
                />

                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="navbar__clear-search"
                  aria-label="Close search"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="navbar__icon-btn"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open search bar"
              >
                <Search size={20} />
              </button>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div
            className="navbar__notif-wrapper"
            ref={notificationRef}
          >
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

              {unreadNotifications && (
                <span className="navbar__badge" />
              )}
            </button>

            {isNotificationOpen && (
              <div className="navbar__notif-menu">
                <div className="navbar__notif-header">
                  <span>Notifications</span>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                  }}
                >
                  No new notifications.
                </div>
              </div>
            )}
          </div>

          {/* LOGIN */}
          <Link
            href="/login"
            className="navbar__login-btn"
          >
            <LogIn size={16} />
            <span>Login</span>
          </Link>

          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className="navbar__mobile-menu-btn"
            onClick={() =>
              setIsMobileMenuOpen(!isMobileMenuOpen)
            }
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION MENU */}
      {isMobileMenuOpen && (
        <div className="navbar__mobile-menu">
          <nav>
            <ul className="navbar__mobile-nav-list">

              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? activePath === "/"
                    : activePath?.startsWith(link.href);

                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={handleMobileLinkClick}
                      className={`navbar__mobile-nav-link${isActive
                        ? " navbar__mobile-nav-link--active"
                        : ""
                        }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}

              {/* MOBILE GENRE */}
              <li>
                <button
                  type="button"
                  className="navbar__mobile-genre-btn"
                  onClick={() =>
                    setIsGenreOpen(!isGenreOpen)
                  }
                >
                  <span>Genre</span>

                  <ChevronDown
                    size={16}
                    className={
                      isGenreOpen
                        ? "navbar__dropdown-chevron--open"
                        : ""
                    }
                  />
                </button>

                {isGenreOpen && (
                  <div className="navbar__mobile-genres">
                    {genres.map((genre) => (
                      <Link
                        key={genre}
                        href={`/genre/${genre.toLowerCase()}`}
                        onClick={handleMobileLinkClick}
                        className="navbar__mobile-genre-item"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                )}
              </li>

            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}