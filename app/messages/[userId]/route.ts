import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant_1_id.eq.${user.id},participant_2_id.eq.${userId}),and(participant_1_id.eq.${userId},participant_2_id.eq.${user.id})`,
      )
      .single()

    if (existingConv) {
      return NextResponse.json({ conversationId: existingConv.id })
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({
        participant_1_id: user.id,
        participant_2_id: userId,
      })
      .select("id")
      .single()

    if (error) throw error

    return NextResponse.json({ conversationId: newConv.id })
  } catch (error) {
    console.error("[v0] Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
