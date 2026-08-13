/** Represents a signed-in user (mock or real Supabase). */
export interface AuthUser {
  /** Unique ID — "mock-<slug>" in mock mode, Supabase UUID in real mode. */
  id: string;
  /** Email address the user authenticated with. */
  email: string;
  /** Display name (optional). */
  name?: string;
}

/** Auth session containing the bearer token. */
export interface AuthSession {
  user: AuthUser;
  /** Bearer token sent in Authorization headers. */
  token: string;
}

/** Errors thrown by auth operations. */
export interface AuthError {
  message: string;
  code?: string;
}

/** Full auth state + actions exposed by useAuth. */
export interface AuthContextValue {
  /** Currently authenticated user, or null if not signed in. */
  user: AuthUser | null;
  /** True while the initial session is being restored from storage. */
  isLoading: boolean;
  /** True when a sign-in / sign-up operation is in-flight. */
  isAuthenticating: boolean;
  /** The active bearer token, or null. */
  token: string | null;
  /** Derived convenience flag. */
  isAuthenticated: boolean;
  /** Sign in with email + password. Throws AuthError on failure. */
  login(email: string, password: string): Promise<void>;
  /** Create a new account. Throws AuthError on failure. */
  signup(email: string, password: string, name?: string): Promise<void>;
  /** Sign out and clear session. */
  logout(): Promise<void>;
}

export const AUTH_TOKEN_KEY = "nd_auth_token";
export const AUTH_USER_KEY  = "nd_auth_user";
