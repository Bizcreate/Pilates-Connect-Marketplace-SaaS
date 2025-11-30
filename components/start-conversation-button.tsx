"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

interface StartConversationButtonProps {
  userId: string
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function StartConversationButton({
  userId,
  variant = "default",
  size = "default",
  className,
}: StartConversationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStartConversation = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/messages/${userId}`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to start conversation")

      const { conversationId } = await response.json()
      router.push(`/messages?conversation=${conversationId}`)
    } catch (error) {
      console.error("[v0] Error starting conversation:", error)
      alert("Failed to start conversation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleStartConversation} disabled={isLoading} variant={variant} size={size} className={className}>
      <MessageSquare className="h-4 w-4 mr-2" />
      {isLoading ? "Starting..." : "Message"}
    </Button>
  )
}
