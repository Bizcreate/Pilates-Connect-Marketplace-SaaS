import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: otherUserId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[v0] Creating conversation via API between:", user.id, "and", otherUserId)

  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`
    )
    .maybeSingle()

  if (existingConversation) {
    console.log("[v0] Conversation already exists:", existingConversation.id)
    return NextResponse.json({ conversationId: existingConversation.id })
  }

  const { data: newConversation, error } = await supabase
    .from("conversations")
    .insert({
      participant1_id: user.id,
      participant2_id: otherUserId,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[v0] Error creating conversation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log("[v0] Created new conversation:", newConversation.id)
  return NextResponse.json({ conversationId: newConversation.id })
}
