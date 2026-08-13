"use client";

/*
 * AuthProvider — real Supabase Auth via @supabase/ssr browser client.
 *
 * Session lifecycle:
 *  • On mount: calls supabase.auth.getSession() to restore any existing session
 *    from the cookie managed by the Next.js middleware (src/middleware.ts).
 *  • login: calls supabase.auth.signInWithPassword — writes session cookie.
 *  • signup: calls supabase.auth.signUp — writes session cookie on confirmation.
 *  • logout: calls supabase.auth.signOut — clears session cookie.
 *  • onAuthStateChange listener keeps React state in sync with the cookie session.
 *
 * The hook surface (useAuth) is unchanged — no other file changes needed.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import {
  AUTH_USER_KEY,
  AuthContextValue,
  AuthError,
  AuthUser,
} from "./types";

/* ─── Helpers ───────────────────────────────────────────────── */
function toAuthUser(user: User, name?: string): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name:
      name ??
      user.user_metadata?.name ??
      user.user_metadata?.full_name ??
      user.email?.split("@")[0] ??
      "Anonymous",
  };
}

/* ─── Context ───────────────────────────────────────────────── */
const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Provider ──────────────────────────────────────────────── */
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = getSupabaseBrowserClient();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  /* Persist display name to localStorage so it survives session restores */
  function cacheName(userId: string, name: string) {
    try {
      localStorage.setItem(`${AUTH_USER_KEY}_name_${userId}`, name);
    } catch { /* storage unavailable */ }
  }
  function getCachedName(userId: string): string | undefined {
    try {
      return localStorage.getItem(`${AUTH_USER_KEY}_name_${userId}`) ?? undefined;
    } catch { return undefined; }
  }

  function applySession(session: Session | null) {
    if (session?.user) {
      const cachedName = getCachedName(session.user.id);
      setUser(toAuthUser(session.user, cachedName));
      setToken(session.access_token);
    } else {
      setUser(null);
      setToken(null);
    }
  }

  /* ── Restore session on mount + subscribe to auth state changes ── */
  useEffect(() => {
    let mounted = true;

    // Safety timeout: if Supabase keys are missing/invalid, resolve loading
    // after 2 s so Sign in / Sign up always become visible.
    const loadingTimeout = setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 2000);

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (mounted) {
        applySession(data.session);
        setIsLoading(false);
        clearTimeout(loadingTimeout);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        if (mounted) {
          applySession(session);
          setIsLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Login ──────────────────────────────────────────────────── */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsAuthenticating(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          throw { message: error.message, code: error.status?.toString() } satisfies AuthError;
        }
        applySession(data.session);
      } finally {
        setIsAuthenticating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ── Signup ─────────────────────────────────────────────────── */
  const signup = useCallback(
    async (email: string, password: string, name?: string): Promise<void> => {
      setIsAuthenticating(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name?.trim() || email.split("@")[0] },
          },
        });
        if (error) {
          throw { message: error.message, code: error.status?.toString() } satisfies AuthError;
        }
        // If email confirmation is required, data.session will be null.
        if (data.session) {
          if (name) cacheName(data.user!.id, name.trim());
          applySession(data.session);
        } else if (data.user) {
          // Account created but email confirmation pending.
          throw {
            message:
              "Account created! Please check your email to confirm your address, then sign in.",
          } satisfies AuthError;
        }
      } finally {
        setIsAuthenticating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ── Logout ─────────────────────────────────────────────────── */
  const logout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticating,
      isAuthenticated: !!user && !!token,
      login,
      signup,
      logout,
    }),
    [user, token, isLoading, isAuthenticating, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ─── Internal getter for useAuth ───────────────────────────── */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
