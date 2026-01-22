import { createBrowserClient as createClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null
let sessionCheckInterval: NodeJS.Timeout | null = null

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[v0] Supabase environment variables are missing! Check your .env.local file or Vercel project settings.",
      { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey },
    )
    throw new Error("Missing Supabase environment variables")
  }

  if (browserClient) {
    return browserClient
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "pilates-connect-auth",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    global: {
      headers: {
        "x-client-info": "pilates-connect-web",
      },
    },
  })

  if (typeof window !== "undefined" && !sessionCheckInterval) {
    const isProtectedPage = () => {
      return (
        window.location.pathname.includes("/dashboard") ||
        window.location.pathname.includes("/studio/") ||
        window.location.pathname.includes("/instructor/") ||
        window.location.pathname.includes("/admin/")
      )
    }

    // Check session health every 5 minutes, but only on protected pages
    sessionCheckInterval = setInterval(
      async () => {
        // Skip validation if not on a protected page
        if (!isProtectedPage()) {
          return
        }

        try {
          const {
            data: { session },
            error,
          } = await browserClient!.auth.getSession()

          // Only try to refresh if there WAS a session but it's now invalid
          if (error && session) {
            console.log("[v0] Session invalid, attempting refresh...")
            const { error: refreshError } = await browserClient!.auth.refreshSession()

            if (refreshError) {
              console.error("[v0] Session refresh failed:", refreshError.message)
              await browserClient!.auth.signOut()
              window.location.href = "/auth/login"
            }
          } else if (!session && isProtectedPage()) {
            // No session on protected page - redirect to login
            console.log("[v0] No session on protected page, redirecting...")
            window.location.href = "/auth/login"
          }
        } catch (err) {
          console.error("[v0] Session health check error:", err)
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState === "visible" && isProtectedPage()) {
        try {
          const {
            data: { session },
            error,
          } = await browserClient!.auth.getSession()

          if (error && error.message.includes("refresh_token_not_found")) {
            console.log("[v0] Stale session detected, redirecting to login...")
            await browserClient!.auth.signOut()
            window.location.href = "/auth/login"
          } else if (!error && session) {
            // Silently refresh to keep session fresh
            await browserClient!.auth.refreshSession()
          }
        } catch (err) {
          console.error("[v0] Visibility change session check error:", err)
        }
      }
    })

    window.addEventListener("storage", async (e) => {
      if (e.key === "pilates-connect-auth") {
        const {
          data: { session },
        } = await browserClient!.auth.getSession()
        if (!session && isProtectedPage()) {
          // Session cleared in another tab and we're on a protected page
          window.location.href = "/auth/login"
        }
      }
    })
  }

  console.log("[v0] Supabase browser client initialized")

  return browserClient
}

export async function validateSession(): Promise<boolean> {
  try {
    const client = createBrowserClient()
    const {
      data: { session },
      error,
    } = await client.auth.getSession()

    if (error) {
      console.error("[v0] Session validation error:", error)
      return false
    }

    return !!session
  } catch (err) {
    console.error("[v0] Session validation exception:", err)
    return false
  }
}

export async function refreshSession(): Promise<boolean> {
  try {
    const client = createBrowserClient()
    const { error } = await client.auth.refreshSession()

    if (error) {
      console.error("[v0] Session refresh error:", error)
      await client.auth.signOut()
      return false
    }

    return true
  } catch (err) {
    console.error("[v0] Session refresh exception:", err)
    return false
  }
}

export { createBrowserClient as createClient }
