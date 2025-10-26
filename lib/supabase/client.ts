import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseInstance: SupabaseClient | null = null

export function createBrowserClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  supabaseInstance = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "supabase.auth.token",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseInstance
}

export function createClient() {
  return createBrowserClient()
}
