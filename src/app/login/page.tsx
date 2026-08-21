import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In | Netflix Discussion",
  description: "Sign in to Netflix Discussion to leave reviews, manage your watchlist, and join the conversation.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Card */}
        <div className="bg-black/60 border border-white/8 rounded-2xl shadow-2xl shadow-black/60
                        backdrop-blur overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-brand-red-dark via-brand-red to-brand-red-dark" />

          <div className="px-8 py-9 space-y-7">
            {/* Header */}
            <div className="space-y-1.5 text-center">
              <Link href="/" className="inline-block font-heading text-xl text-brand-red mb-4">
                NETFLIX <span className="text-white font-normal text-base">DISCUSSION</span>
              </Link>
              <h1 className="font-heading text-3xl text-white tracking-tight">Welcome back</h1>
              <p className="text-gray text-sm">Sign in to your account to continue the discussion.</p>
            </div>

            {/* Auth notice */}
            <div className="bg-white/3 border border-white/6 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30
                               px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                LIVE
              </span>
              <p className="font-mono text-[11px] text-gray/60 leading-relaxed">
                Sign in with your WatchClub account powered by Better Auth &amp; PostgreSQL.
              </p>
            </div>

            {/* Form */}
            <AuthForm mode="login" />
          </div>
        </div>
      </div>
    </div>
  );
}
