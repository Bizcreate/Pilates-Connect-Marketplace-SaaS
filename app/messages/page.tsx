import { redirect } from 'next/navigation'
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { MessagesList } from "@/components/messages-list"
import { MessageSquare } from 'lucide-react'

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's conversations
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      id,
      participant1_id,
      participant2_id,
      updated_at,
      messages(
        id,
        content,
        sender_id,
        read,
        created_at
      )
    `)
    .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })

  console.log("[v0] Fetched conversations:", conversations?.length || 0)

  // Get other participant details for each conversation
  const conversationsWithDetails = await Promise.all(
    (conversations || []).map(async (conv) => {
      const otherParticipantId = conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id

      const { data: otherUser } = await supabase
        .from("profiles")
        .select("id, display_name, user_type, avatar_url")
        .eq("id", otherParticipantId)
        .single()

      const messages = Array.isArray(conv.messages) ? conv.messages : []
      const lastMessage = messages.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0]

      const unreadCount = messages.filter((m) => !m.read && m.sender_id !== user.id).length

      return {
        id: conv.id,
        otherUser,
        lastMessage,
        unreadCount,
        updatedAt: conv.updated_at,
      }
    }),
  )

  console.log("[v0] Conversations with details:", conversationsWithDetails.length)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground mt-1">Connect with studios and instructors</p>
          </div>

          {conversationsWithDetails.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Start a conversation by contacting studios or instructors from their profiles
                </p>
              </CardContent>
            </Card>
          ) : (
            <MessagesList conversations={conversationsWithDetails} currentUserId={user.id} />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
