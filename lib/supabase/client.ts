import { createBrowserClient as createClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

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
    },
  })

  console.log("[v0] Supabase browser client initialized")

  return browserClient
}

export { createBrowserClient as createClient }
