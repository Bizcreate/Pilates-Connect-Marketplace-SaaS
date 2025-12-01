"use client"

import type React from "react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  userType: "instructor" | "studio"
  onUploadComplete?: (url: string) => void
}

export function AvatarUpload({ userId, currentAvatarUrl, userType, onUploadComplete }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", `avatars/${userId}`)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()

      const supabase = createBrowserClient()
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId)

      if (updateError) throw updateError

      setAvatarUrl(url)
      onUploadComplete?.(url)
    } catch (error: any) {
      console.error("Avatar upload error:", error)
      alert("Upload failed: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const initials = userId.substring(0, 2).toUpperCase()

  return (
    <div className="relative inline-block">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || undefined} alt="Profile picture" />
        <AvatarFallback className="bg-primary/10 text-primary text-2xl">{initials}</AvatarFallback>
      </Avatar>

      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </div>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </label>
    </div>
  )
}
