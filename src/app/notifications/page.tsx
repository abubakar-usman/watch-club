"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Film,
  MessageCircle,
  Heart,
  Star,
  Bookmark,
  CheckCheck,
  Trash2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type NotifType = "discussion" | "like" | "watchlist" | "review" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  timeAgo: string;
  isRead: boolean;
  href: string;
  meta?: string; // e.g. movie title
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: Replace with GET /api/notifications?userId=:id

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "discussion",
    title: "New reply on your discussion",
    body: "CrunchyRoll replied to your comment on Oppenheimer: \"Totally agree, the Trinity scene was breathtaking!\"",
    timeAgo: "5 min ago",
    isRead: false,
    href: "/movie/872585#discussion",
    meta: "Oppenheimer",
  },
  {
    id: "n2",
    type: "like",
    title: "Your post got 12 new likes",
    body: "People loved your review of Dune: Part Two. Keep sharing your thoughts!",
    timeAgo: "32 min ago",
    isRead: false,
    href: "/movie/693134#discussion",
    meta: "Dune: Part Two",
  },
  {
    id: "n3",
    type: "watchlist",
    title: "Movie leaving soon",
    body: "Spider-Man: Across the Spider-Verse is leaving the platform in 3 days. Watch it before it's gone!",
    timeAgo: "1h ago",
    isRead: false,
    href: "/movie/569094",
    meta: "Spider-Man: Across the Spider-Verse",
  },
  {
    id: "n4",
    type: "review",
    title: "Top critic reviewed a movie you like",
    body: "Deadpool & Wolverine just received a 9/10 rating from WatchClub's top critics.",
    timeAgo: "3h ago",
    isRead: true,
    href: "/movie/533535",
    meta: "Deadpool & Wolverine",
  },
  {
    id: "n5",
    type: "discussion",
    title: "Hot discussion you might like",
    body: "50+ people are discussing 'Best sci-fi films of 2024' in the community right now.",
    timeAgo: "5h ago",
    isRead: true,
    href: "/community",
    meta: "Community",
  },
  {
    id: "n6",
    type: "watchlist",
    title: "New arrival added to your genre",
    body: "A new Thriller just dropped: 'Longlegs'. Check it out before everyone else!",
    timeAgo: "Yesterday",
    isRead: true,
    href: "/genre/thriller",
    meta: "Thriller",
  },
  {
    id: "n7",
    type: "system",
    title: "Welcome to WatchClub!",
    body: "Your account is all set. Start by adding movies to your watchlist or joining a discussion.",
    timeAgo: "3d ago",
    isRead: true,
    href: "/portal",
    meta: "WatchClub",
  },
];

// ─── Icon helper ─────────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: NotifType }) {
  const cls = "w-full h-full flex items-center justify-center";
  switch (type) {
    case "discussion":
      return (
        <div className={cls}>
          <MessageCircle size={18} className="text-blue-400" />
        </div>
      );
    case "like":
      return (
        <div className={cls}>
          <Heart size={18} className="text-[#E60813]" />
        </div>
      );
    case "watchlist":
      return (
        <div className={cls}>
          <Bookmark size={18} className="text-emerald-400" />
        </div>
      );
    case "review":
      return (
        <div className={cls}>
          <Star size={18} className="text-yellow-400" />
        </div>
      );
    case "system":
    default:
      return (
        <div className={cls}>
          <Bell size={18} className="text-[#959292]" />
        </div>
      );
  }
}

const iconBg: Record<NotifType, string> = {
  discussion: "rgba(96,165,250,0.12)",
  like: "rgba(230,8,19,0.12)",
  watchlist: "rgba(52,211,153,0.12)",
  review: "rgba(250,204,21,0.12)",
  system: "rgba(255,255,255,0.06)",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterTab = "all" | "unread";

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const displayed =
    activeFilter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotif = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="w-full max-w-[860px] mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Bell size={22} className="text-[#E60813]" />
            <h1 className="text-white font-bold text-[26px] leading-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#E60813] text-white text-[12px] font-bold min-w-[24px]">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-[#959292] text-[14px]">
            Stay up to date with your discussions, reviews, and watchlist.
          </p>
        </div>

        {/* Mark all read */}
        {unreadCount > 0 && (
          <button
            id="mark-all-read-btn"
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-[#959292] border border-[#535353] hover:text-white hover:border-white/40 bg-transparent transition-all self-start"
          >
            <CheckCheck size={15} />
            Mark all read
          </button>
        )}
      </div>

      {/* ── Filter Tabs ──────────────────────────────────────────────────── */}
      <div className="flex items-center border-b border-[#535353]">
        {(["all", "unread"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            id={`notif-tab-${tab}`}
            onClick={() => setActiveFilter(tab)}
            className={`relative px-5 py-3 text-[14px] font-semibold capitalize transition-colors ${
              activeFilter === tab
                ? "text-white"
                : "text-[#959292] hover:text-white"
            }`}
          >
            {tab === "all" ? "All" : `Unread (${unreadCount})`}
            {activeFilter === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E60813] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Notification List ────────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        /* Empty state */
        <div
          className="rounded-2xl border border-[#535353] p-14 text-center space-y-5"
          style={{ background: "#1E1E1E" }}
          id="notifications-empty-state"
        >
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: "rgba(230,8,19,0.08)",
              border: "1px solid rgba(230,8,19,0.2)",
            }}
          >
            <Bell size={34} className="text-[#E60813]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-bold text-[20px]">
              {activeFilter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </h3>
            <p className="text-[#959292] text-[14px] max-w-sm mx-auto leading-relaxed">
              {activeFilter === "unread"
                ? "You're all caught up! Switch to 'All' to see your history."
                : "Join discussions, add movies to your watchlist, and stay active to receive notifications."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold text-white bg-[#E60813] hover:bg-[#c5070f] transition-all"
            >
              <MessageCircle size={15} />
              Browse Discussions
            </Link>
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold text-[#C7C7C7] border border-[#535353] hover:border-white/40 hover:text-white transition-all"
            >
              Go to Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((notif) => (
            <Link
              key={notif.id}
              href={notif.href}
              id={`notif-item-${notif.id}`}
              onClick={() => markRead(notif.id)}
              className={`group flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                notif.isRead
                  ? "border-[#333] hover:border-[#535353]"
                  : "border-[#535353] hover:border-white/30"
              }`}
              style={{ background: notif.isRead ? "#181818" : "#1E1E1E" }}
            >
              {/* Unread dot */}
              {!notif.isRead && (
                <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#E60813] flex-shrink-0" />
              )}

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden"
                style={{ background: iconBg[notif.type] }}
              >
                <NotifIcon type={notif.type} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p
                    className={`text-[14px] font-semibold leading-snug ${
                      notif.isRead ? "text-[#C7C7C7]" : "text-white"
                    }`}
                  >
                    {notif.title}
                  </p>
                  {notif.meta && (
                    <span className="text-[11px] text-[#E60813] bg-[#E60813]/10 px-2 py-0.5 rounded-full font-medium border border-[#E60813]/20 flex-shrink-0">
                      {notif.meta}
                    </span>
                  )}
                </div>
                <p className="text-[#959292] text-[13px] leading-relaxed line-clamp-2">
                  {notif.body}
                </p>
                <p className="text-[#595959] text-[11px] mt-1.5 font-medium">
                  {notif.timeAgo}
                </p>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => deleteNotif(notif.id, e)}
                title="Dismiss"
                className="absolute top-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-[#595959] hover:text-white hover:bg-white/5"
                id={`delete-notif-${notif.id}`}
              >
                <Trash2 size={14} />
              </button>
            </Link>
          ))}
        </div>
      )}

      {/* ── Footer links ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-[#333]">
        <Link
          href="/portal"
          className="flex items-center gap-1.5 text-[#959292] hover:text-white text-[13px] transition-colors"
        >
          <Film size={14} />
          My Profile
        </Link>
        <div className="w-px h-4 bg-[#333]" />
        <Link
          href="/watchlist"
          className="flex items-center gap-1.5 text-[#959292] hover:text-white text-[13px] transition-colors"
        >
          <Bookmark size={14} />
          My Watchlist
        </Link>
        <div className="w-px h-4 bg-[#333]" />
        <Link
          href="/community"
          className="flex items-center gap-1.5 text-[#959292] hover:text-white text-[13px] transition-colors"
        >
          <MessageCircle size={14} />
          Community
        </Link>
      </div>
    </div>
  );
}
