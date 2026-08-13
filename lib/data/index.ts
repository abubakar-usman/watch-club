import { NextResponse } from "next/server";
import { withSupabase } from "@supabase/server";
import { DataRepository, RequestContext } from "./types";
import { SupabaseRepository } from "./supabaseRepository";
export * from "./types";
export * from "./supabaseRepository";

export const repository: DataRepository = new SupabaseRepository();

export type RouteHandler = (
  req: Request,
  ctx: RequestContext,
  routeContext?: any
) => Promise<Response>;

export function withRepositoryAuth(
  options: { auth: "user" | "none" },
  handler: RouteHandler
) {
  return withSupabase(
    {
      auth: options.auth,
      env: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        publishableKeys: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          ? { default: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY }
          : undefined,
        secretKeys: process.env.SUPABASE_SECRET_KEYS
          ? { default: process.env.SUPABASE_SECRET_KEYS }
          : undefined,
      },
    },
    async (req: Request, ctx: any, routeContext?: any) => {
      try {
        const userId = ctx.credentials?.userId || ctx.user?.id || ctx.jwtClaims?.sub || ctx.userId;
        console.log("[withRepositoryAuth DEBUG]", {
          authOption: options.auth,
          credentialsUserId: ctx.credentials?.userId,
          ctxUserId: ctx.userId,
          ctxUser: ctx.user,
          jwtClaimsSub: ctx.jwtClaims?.sub,
          authMode: ctx.authMode,
          resolvedUserId: userId,
          authHeader: req.headers.get("authorization") ? `${req.headers.get("authorization")?.substring(0, 30)}...` : null,
          cookieHeader: req.headers.get("cookie") ? `${req.headers.get("cookie")?.substring(0, 30)}...` : null,
        });

        if (options.auth === "user" && !userId) {
          const authErrorMsg = "Unauthorized User: Missing or invalid authentication token";
          console.error(`[SERVER POST /api/comments ERROR] Category: [auth/JWT failure]`, {
            error: authErrorMsg,
            authMode: options.auth,
            headers: Object.fromEntries(req.headers.entries()),
            ctxKeys: Object.keys(ctx || {}),
          });
          return NextResponse.json({ error: authErrorMsg, category: "auth/JWT failure" }, { status: 401 });
        }

        return await handler(req, { userId, supabase: ctx.supabase }, routeContext);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal Server Error";
        const details =
          err && typeof err === "object" && "details" in err
            ? (err as { details?: any }).details
            : undefined;
        const code =
          err && typeof err === "object" && "code" in err
            ? (err as { code?: any }).code
            : undefined;

        let category = "Supabase connection error";
        const errStr = `${message} ${details || ""} ${code || ""}`;

        if (
          code === "42501" ||
          errStr.includes("row-level security") ||
          errStr.includes("RLS") ||
          errStr.includes("policy") ||
          errStr.includes("permission denied")
        ) {
          category = "RLS rejection";
        } else if (
          errStr.includes("JWT") ||
          errStr.includes("auth") ||
          errStr.includes("Unauthorized") ||
          errStr.includes("credentials")
        ) {
          category = "auth/JWT failure";
        } else if (
          errStr.includes("Zod") ||
          errStr.includes("validation") ||
          errStr.includes("invalid_type")
        ) {
          category = "Zod validation failure";
        } else if (
          errStr.includes("fetch failed") ||
          errStr.includes("ECONNREFUSED") ||
          errStr.includes("ENOTFOUND") ||
          errStr.includes("connection")
        ) {
          category = "Supabase connection error";
        }

        console.error(`[SERVER POST /api/comments ERROR] Category: [${category}]`, {
          message,
          details,
          code,
          stack: err instanceof Error ? err.stack : undefined,
          rawError: err,
        });

        return NextResponse.json(
          details ? { error: message, category, details, code } : { error: message, category, code },
          { status: 500 }
        );
      }
    }
  );
}
