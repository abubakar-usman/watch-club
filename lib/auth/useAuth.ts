/*
 * useAuth — the single public hook for all auth operations.
 *
 * This is the ONLY import the rest of the app uses.
 * To swap from mock → real Supabase Auth, edit context.tsx only.
 * This file never needs to change.
 *
 * Usage:
 *   const { user, isAuthenticated, login, signup, logout, token } = useAuth();
 */
"use client";

import { useAuthContext } from "./context";
export type { AuthUser, AuthSession, AuthError, AuthContextValue } from "./types";

export function useAuth() {
  return useAuthContext();
}
