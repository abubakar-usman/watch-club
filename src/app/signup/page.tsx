import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account | Netflix Discussion",
  description: "Join Netflix Discussion — create an account to write reviews, build a watchlist, and discuss movies.",
};

export default function SignupPage() {
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
              <h1 className="font-heading text-3xl text-white tracking-tight">Join the discussion</h1>
              <p className="text-gray text-sm">Create an account to rate films, leave reviews, and track your watchlist.</p>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: "★", label: "Rate Movies" },
                { icon: "💬", label: "Discuss" },
                { icon: "📋", label: "Watchlist" },
              ].map(({ icon, label }) => (
                <div key={label}
                  className="flex flex-col items-center gap-1.5 bg-white/3 border border-white/6
                             rounded-xl py-3 px-2">
                  <span className="text-xl">{icon}</span>
                  <span className="font-mono text-[10px] text-gray/60 text-center">{label}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            <AuthForm mode="signup" />
          </div>
        </div>
      </div>
    </div>
  );
}
