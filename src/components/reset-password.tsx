"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6 bg-black/60 border border-white/8 rounded-2xl p-8 backdrop-blur shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-2xl text-white">Set New Password</h1>
          <p className="text-gray text-sm">Please choose a new password for your account.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-mono">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-center text-sm font-mono space-y-3">
            <p>Password successfully updated!</p>
            <Link
              href="/login"
              className="inline-block bg-brand-red text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-brand-red-dark transition-colors"
            >
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="font-mono text-xs text-gray/70">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-xs text-gray/70">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Update Password
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link href="/login" className="inline-flex items-center gap-2 font-mono text-xs text-gray hover:text-white">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
