import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createBrowserClient() {
  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "supabase.auth.token",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

export function createClient() {
  return createBrowserClient()
}
