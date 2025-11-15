"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  content: string
  sender_id: string
  read: boolean
  created_at: string
}

interface Conversation {
  id: string
  otherUser: {
    id: string
    display_name: string
    user_type: string
  } | null
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

interface MessagesListProps {
  conversations: Conversation[]
  currentUserId: string
}

export function MessagesList({ conversations, currentUserId }: MessagesListProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversations[0]?.id || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  const loadMessages = async (conversationId: string) => {
    console.log("[v0] Loading messages for conversation:", conversationId)
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error loading messages:", error)
      return
    }

    console.log("[v0] Loaded messages:", data?.length || 0)

    if (data) {
      setMessages(data)

      // Mark messages as read
      const unreadMessages = data.filter((m) => !m.read && m.sender_id !== currentUserId)
      if (unreadMessages.length > 0) {
        await supabase
          .from("messages")
          .update({ read: true })
          .in(
            "id",
            unreadMessages.map((m) => m.id),
          )

        router.refresh()
      }
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setIsLoading(true)

    try {
      console.log("[v0] Sending message to conversation:", selectedConversation)
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation,
        sender_id: currentUserId,
        content: newMessage.trim(),
      })

      if (error) {
        console.error("[v0] Error sending message:", error)
        throw error
      }

      console.log("[v0] Message sent successfully")
      setNewMessage("")
      await loadMessages(selectedConversation)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedConv = conversations.find((c) => c.id === selectedConversation)

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-2">
            {conversations.map((conv) => {
              const initials = conv.otherUser?.display_name?.substring(0, 2).toUpperCase() || "?"
              const isSelected = conv.id === selectedConversation

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isSelected ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold truncate">{conv.otherUser?.display_name}</p>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 min-w-5 px-1.5">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{conv.otherUser?.user_type}</p>
                      {conv.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate mt-1">{conv.lastMessage.content}</p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Messages View */}
      <Card className="lg:col-span-2">
        {selectedConv ? (
          <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedConv.otherUser?.display_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedConv.otherUser?.display_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{selectedConv.otherUser?.user_type}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isSender = message.sender_id === currentUserId

                    return (
                      <div key={message.id} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isSender ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isSender ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <CardContent className="flex items-center justify-center h-[600px]">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
