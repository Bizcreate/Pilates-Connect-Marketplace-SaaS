"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, Loader2, ImageIcon, Video } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface GalleryUploadProps {
  userId: string
  userType: "instructor" | "studio"
  currentImages?: string[]
  currentVideos?: string[]
  onUpdate?: () => void
}

export function GalleryUpload({
  userId,
  userType,
  currentImages = [],
  currentVideos = [],
  onUpdate,
}: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState(currentImages)
  const [videos, setVideos] = useState(currentVideos)

  const handleFileUpload = async (file: File, type: "image" | "video") => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", `${userType}/${userId}/${type}s`)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()

      // Update database
      const supabase = createBrowserClient()
      const table = userType === "instructor" ? "instructor_profiles" : "studio_profiles"

      if (type === "image") {
        const newImages = [...images, url]
        await supabase.from(table).update({ image_gallery: newImages }).eq("id", userId)
        setImages(newImages)
      } else {
        const newVideos = [...videos, url]
        await supabase.from(table).update({ video_urls: newVideos }).eq("id", userId)
        setVideos(newVideos)
      }

      onUpdate?.()
    } catch (error: any) {
      console.error("Upload error:", error)
      alert("Upload failed: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (url: string, type: "image" | "video") => {
    try {
      // Delete from Blob storage
      await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      // Update database
      const supabase = createBrowserClient()
      const table = userType === "instructor" ? "instructor_profiles" : "studio_profiles"

      if (type === "image") {
        const newImages = images.filter((img) => img !== url)
        await supabase.from(table).update({ image_gallery: newImages }).eq("id", userId)
        setImages(newImages)
      } else {
        const newVideos = videos.filter((vid) => vid !== url)
        await supabase.from(table).update({ video_urls: newVideos }).eq("id", userId)
        setVideos(newVideos)
      }

      onUpdate?.()
    } catch (error: any) {
      console.error("Delete error:", error)
      alert("Delete failed: " + error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Image Gallery</h3>
          <Button
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = "image/*"
              input.multiple = true
              input.onchange = async (e: any) => {
                const files = Array.from(e.target.files) as File[]
                for (const file of files) {
                  await handleFileUpload(file, "image")
                }
              }
              input.click()
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Images
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={url || "/placeholder.svg"}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handleDelete(url, "image")}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length === 0 && (
            <div className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-2" />
              <p className="text-xs">No images yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Video Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Video Gallery</h3>
          <Button
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = "video/*"
              input.onchange = async (e: any) => {
                const file = e.target.files[0]
                if (file) await handleFileUpload(file, "video")
              }
              input.click()
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Video
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((url, index) => (
            <div key={index} className="relative aspect-video group">
              <video src={url} controls className="w-full h-full object-cover rounded-lg" />
              <button
                onClick={() => handleDelete(url, "video")}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {videos.length === 0 && (
            <div className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
              <Video className="h-8 w-8 mb-2" />
              <p className="text-xs">No videos yet</p>
            </div>
          )}
        </div>
      </div>

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}
    </div>
  )
}
