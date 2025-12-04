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
    // Check session health every 5 minutes
    sessionCheckInterval = setInterval(
      async () => {
        try {
          const {
            data: { session },
            error,
          } = await browserClient!.auth.getSession()

          if (error || !session) {
            console.log("[v0] Session validation failed, refreshing...")
            const { error: refreshError } = await browserClient!.auth.refreshSession()

            if (refreshError) {
              console.error("[v0] Session refresh failed:", refreshError)
              // Clear stale session data
              await browserClient!.auth.signOut()
              // Force page reload to get fresh state
              if (window.location.pathname.includes("/dashboard") || window.location.pathname.includes("/studio")) {
                window.location.href = "/auth/login"
              }
            }
          }
        } catch (err) {
          console.error("[v0] Session health check error:", err)
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState === "visible") {
        try {
          const {
            data: { session },
            error,
          } = await browserClient!.auth.getSession()

          if (error && error.message.includes("refresh_token_not_found")) {
            console.log("[v0] Stale session detected on tab focus, clearing...")
            await browserClient!.auth.signOut()
            window.location.reload()
          } else if (!error && session) {
            // Session is valid, refresh it to ensure it's up to date
            await browserClient!.auth.refreshSession()
          }
        } catch (err) {
          console.error("[v0] Visibility change session check error:", err)
        }
      }
    })

    window.addEventListener("storage", async (e) => {
      if (e.key === "pilates-connect-auth") {
        console.log("[v0] Auth storage changed in another tab, syncing...")
        const {
          data: { session },
        } = await browserClient!.auth.getSession()
        if (!session) {
          // Session cleared in another tab, reload to sync
          window.location.reload()
        }
      }
    })
  }

  console.log("[v0] Supabase browser client initialized with session monitoring")

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
