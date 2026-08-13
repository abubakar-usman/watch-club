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
    <footer className="footer__footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Brand & Logo Column */}
          <div className="footer__brand-col">
            <Link href="/" className="footer__logo-link" aria-label="WatchClub Home">
              <Image
                src="/bglogo.png"
                alt="WatchClub Logo"
                width={160}
                height={40}
                className="footer__logo-image"
              />
            </Link>
            <p className="footer__brand-blurb">
              Your guide to the best of netflix, powered by real viewers.
            </p>
          </div>

          {/* Explore Column */}
          <div className="footer__nav-col">
            <h4 className="footer__col-title">Explore</h4>
            <ul className="footer__link-list">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="footer__link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Column */}
          <div className="footer__nav-col">
            <h4 className="footer__col-title">Community</h4>
            <ul className="footer__link-list">
              {communityLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="footer__link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="footer__nav-col">
            <h4 className="footer__col-title">Support</h4>
            <ul className="footer__link-list">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="footer__link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Email Column */}
          <div className="footer__nav-col footer__contact-col">
            <h4 className="footer__col-title">Contact Us</h4>
            <a
              href="mailto:Sarmayafinancials@Gmail.com"
              className="footer__contact-email"
            >
              Sarmayafinancials@Gmail.com
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom-bar">
          <p>© {new Date().getFullYear()} WatchClub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
