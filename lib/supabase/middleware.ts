import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log("[v0] Middleware: Starting, path:", request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log("[v0] Middleware: Reading cookies, count:", cookies.length)
          return cookies
        },
        setAll(cookiesToSet) {
          console.log("[v0] Middleware: Setting cookies, count:", cookiesToSet.length)
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options })
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set({ name, value, ...options })
          })
        },
      },
    },
  )

  // Just pass through without any auth logic
  // Client-side auth will handle everything
  return supabaseResponse
}
