import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
    nodeEnv: process.env.NODE_ENV,
    message: "If hasSupabaseUrl or hasSupabaseAnonKey is false, environment variables are not set correctly in Vercel",
  })
}
