"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'

export async function createConversation(otherUserId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  console.log("[v0] Creating conversation between:", user.id, "and", otherUserId)

  // Check if conversation already exists
  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`
    )
    .maybeSingle()

  if (existingConversation) {
    console.log("[v0] Conversation already exists:", existingConversation.id)
    return { conversationId: existingConversation.id }
  }

  // Create new conversation
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
    throw error
  }

  console.log("[v0] Created new conversation:", newConversation.id)
  return { conversationId: newConversation.id }
}
