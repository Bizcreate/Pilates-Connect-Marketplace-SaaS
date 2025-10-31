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
      const supabase = createBrowserClient()

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      // Update profile
      const table = userType === "instructor" ? "instructor_profiles" : "studio_profiles"
      const { error: updateError } = await supabase.from(table).update({ avatar_url: publicUrl }).eq("id", userId)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      onUploadComplete?.(publicUrl)
    } catch (error: any) {
      console.error("[v0] Avatar upload error:", error)
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
