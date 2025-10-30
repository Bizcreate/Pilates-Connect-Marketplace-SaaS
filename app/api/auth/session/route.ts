import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json()

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: "Missing tokens" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      console.error("[v0] Error setting session:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Session set successfully for user:", data.user?.id)

    return NextResponse.json({ success: true, user: data.user })
  } catch (error) {
    console.error("[v0] Session route error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
