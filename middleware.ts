// middleware.ts
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(req: NextRequest) {
  // Just refresh the session and pass through
  return await updateSession(req)
}

export const config = {
  // Skip static files and the auth routes, allow everything else to run through middleware
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
