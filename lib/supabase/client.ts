import { createBrowserClient as createClient } from "@supabase/ssr"

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[v0] Supabase environment variables are missing! Check your .env.local file or Vercel project settings.",
    )
  }

  return createClient(supabaseUrl || "", supabaseAnonKey || "")
}

export { createBrowserClient as createClient }
