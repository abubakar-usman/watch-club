"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6 bg-black/60 border border-white/8 rounded-2xl p-8 backdrop-blur shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-2xl text-white">Reset Your Password</h1>
          <p className="text-gray text-sm">Enter your email address to receive password reset instructions.</p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-center text-sm font-mono space-y-2">
            <p>Password reset link sent!</p>
            <p className="text-xs text-gray/80">Check your inbox for further instructions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="font-mono text-xs text-gray/70">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray/40" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Send Reset Link
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
