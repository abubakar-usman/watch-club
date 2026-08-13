"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { setUser, setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Set demo authenticated user session
      const newUser = {
        id: "5d4ff78e-4631-41e6-b496-b50d1cd9d146",
        email,
        name: name || email.split("@")[0],
      };
      localStorage.setItem("watchclub_user", JSON.stringify(newUser));
      setUser(newUser);
      setToken("demo-jwt-token");
      router.push("/portal");
    } catch {
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-mono">
          {error}
        </div>
      )}

      {mode === "signup" && (
        <div className="space-y-1">
          <label className="font-mono text-xs text-gray/70">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray/40" />
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray/30 text-sm focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>
        </div>
      )}

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
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray/30 text-sm focus:outline-none focus:border-brand-red transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="font-mono text-xs text-gray/70">Password</label>
          {mode === "login" && (
            <Link href="/forgot-password" className="font-mono text-[11px] text-brand-red hover:underline">
              Forgot password?
            </Link>
          )}
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray/40" />
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray/30 text-sm focus:outline-none focus:border-brand-red transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-brand-red/20 disabled:opacity-50 mt-2"
      >
        <span>{loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}</span>
        <ArrowRight size={16} />
      </button>

      <div className="text-center pt-2">
        {mode === "login" ? (
          <p className="text-gray text-xs">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand-red font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        ) : (
          <p className="text-gray text-xs">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-red font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
