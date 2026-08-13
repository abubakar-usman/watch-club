import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  verifyCredentials,
  createContextClient,
  createAdminClient,
} from '@supabase/server/core'
import type { AuthModeWithKey, SupabaseContext, SupabaseEnv } from '@supabase/server'

/**
 * Maps Next.js env vars to the SupabaseEnv shape expected by @supabase/server/core.
 */
function resolveNextEnv(): Partial<SupabaseEnv> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const secretKey = process.env.SUPABASE_SECRET_KEYS

  return {
    url: url ?? undefined,
    publishableKeys: publishableKey ? { default: publishableKey } : {},
    secretKeys: secretKey ? { default: secretKey } : {},
  }
}

let cachedJwks: SupabaseEnv['jwks'] = null

async function getJwks(supabaseUrl: string): Promise<SupabaseEnv['jwks']> {
  if (cachedJwks) return cachedJwks
  const jwksUrl = process.env.SUPABASE_JWKS_URL || `${supabaseUrl}/auth/v1/.well-known/jwks.json`
  try {
    const res = await fetch(jwksUrl)
    if (!res.ok) return null
    cachedJwks = await res.json()
    return cachedJwks
  } catch {
    return null
  }
}

/**
 * Server-side Supabase context adapter for Next.js Route Handlers / Server Components.
 *
 * Composes @supabase/ssr (cookie session) with @supabase/server/core (JWT verification).
 * Returns { supabase, supabaseAdmin, userClaims, jwtClaims, authMode } on success.
 *
 * @param options.auth - Auth mode(s) to require. Defaults to 'user'.
 *                       Use 'none' for public endpoints, ['user', 'none'] for optional auth.
 */
export async function createSupabaseContext(
  options: { auth?: AuthModeWithKey | AuthModeWithKey[] } = { auth: 'user' },
): Promise<{ data: SupabaseContext; error: null } | { data: null; error: Error }> {
  const nextEnv = resolveNextEnv()

  if (!nextEnv.url || !nextEnv.publishableKeys?.default) {
    return {
      data: null,
      error: new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      ),
    }
  }

  // @supabase/ssr reads the (middleware-refreshed) cookie and exposes getSession().
  const cookieStore = await cookies()
  const ssrClient = createServerClient(
    nextEnv.url,
    nextEnv.publishableKeys.default,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Components can't write cookies — middleware handles it.
          }
        },
      },
    },
  )

  const {
    data: { session },
  } = await ssrClient.auth.getSession()
  const token = session?.access_token ?? null

  const jwks = await getJwks(nextEnv.url)
  const env: Partial<SupabaseEnv> = { ...nextEnv, jwks }

  const { data: auth, error } = await verifyCredentials(
    { token, apikey: null },
    { auth: options.auth ?? 'user', env },
  )

  if (error) {
    return { data: null, error }
  }

  const supabase = createContextClient({
    auth: { token: auth!.token },
    env,
  })
  const supabaseAdmin = createAdminClient({ env })

  return {
    data: {
      supabase,
      supabaseAdmin,
      userClaims: auth!.userClaims,
      jwtClaims: auth!.jwtClaims,
      authMode: auth!.authMode,
    },
    error: null,
  }
}
