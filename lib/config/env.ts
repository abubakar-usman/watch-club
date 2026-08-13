/**
 * Centralized Environment Variable Validation and Configuration
 *
 * Enforces standardized naming:
 * - NEXT_PUBLIC_SUPABASE_URL (Client & Server)
 * - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (Client & Server)
 * - SUPABASE_SECRET_KEYS (Server Only)
 * - SUPABASE_JWKS_URL (Server Only)
 * - STREAMING_AVAILABILITY_API_KEY (Server Only)
 */

export interface EnvConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
  supabaseSecretKeys?: string;
  supabaseJwksUrl?: string;
  streamingAvailabilityApiKey: string;
}

export function validateEnv(): EnvConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !supabaseUrl.trim()) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL. Please set it in your .env.local file."
    );
  }

  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabasePublishableKey || !supabasePublishableKey.trim()) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Please set it in your .env.local file."
    );
  }

  const streamingAvailabilityApiKey = process.env.STREAMING_AVAILABILITY_API_KEY;
  if (!streamingAvailabilityApiKey || !streamingAvailabilityApiKey.trim()) {
    throw new Error(
      "Missing required environment variable: STREAMING_AVAILABILITY_API_KEY. Please set it in your .env.local file."
    );
  }

  const supabaseSecretKeys = process.env.SUPABASE_SECRET_KEYS;
  const supabaseJwksUrl = process.env.SUPABASE_JWKS_URL;

  return {
    supabaseUrl: supabaseUrl.trim(),
    supabasePublishableKey: supabasePublishableKey.trim(),
    supabaseSecretKeys: supabaseSecretKeys?.trim(),
    supabaseJwksUrl: supabaseJwksUrl?.trim(),
    streamingAvailabilityApiKey: streamingAvailabilityApiKey.trim(),
  };
}

let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}
