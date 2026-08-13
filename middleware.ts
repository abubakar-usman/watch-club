import { NextResponse, type NextRequest } from "next/server";

// Simple in-memory rate limiting store for /api/movies/* routes
const rateLimitMap = new Map<string, number[]>();

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limiting for /api/movies/*
  if (pathname.startsWith("/api/movies")) {
    const rawWindowMs = process.env.RATE_LIMIT_WINDOW_MS?.replace(/\s+/g, "");
    const windowMs = parseInt(rawWindowMs || "60000", 10);
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const now = Date.now();
    const cutoff = now - windowMs;

    const timestamps = (rateLimitMap.get(clientIp) || []).filter((ts) => ts > cutoff);

    if (timestamps.length >= maxRequests) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(windowMs / 1000)),
            "X-RateLimit-Limit": String(maxRequests),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    timestamps.push(now);
    rateLimitMap.set(clientIp, timestamps);
  }

  const response = NextResponse.next({ request });

  if (pathname.startsWith("/api/movies")) {
    const rawWindowMs = process.env.RATE_LIMIT_WINDOW_MS?.replace(/\s+/g, "");
    const windowMs = parseInt(rawWindowMs || "60000", 10);
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10);
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const activeRequests = (rateLimitMap.get(clientIp) || []).length;
    const remaining = Math.max(0, maxRequests - activeRequests);

    response.headers.set("X-RateLimit-Limit", String(maxRequests));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
