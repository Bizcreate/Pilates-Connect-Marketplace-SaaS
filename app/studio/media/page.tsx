"use client"

import type React from "react"
import { upload } from "@vercel/blob/client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, ImageIcon, Video, Loader2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function StudioMediaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [studioId, setStudioId] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadMedia() {
      console.log("[v0] Loading studio media...")
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.log("[v0] No user found, redirecting to login")
          router.push("/auth/login")
          return
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .maybeSingle()

        if (!profileData || profileData.user_type !== "studio") {
          console.log("[v0] User is not a studio")
          router.push("/instructor/dashboard")
          return
        }

        setStudioId(user.id)

        const { data: studioProfile, error } = await supabase
          .from("studio_profiles")
          .select("image_gallery, video_urls")
          .eq("id", user.id)
          .maybeSingle()

        console.log("[v0] Studio profile data:", studioProfile, "Error:", error)

        if (studioProfile) {
          setImages(studioProfile.image_gallery || [])
          setVideos(studioProfile.video_urls || [])
        }
      } catch (error) {
        console.error("[v0] Error loading media:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMedia()
  }, [router, supabase])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !studioId) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, WEBP)",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }

    setUploading(true)
    console.log("[v0] Uploading image:", file.name)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "image")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed: ${errorText}`)
      }

      const { url } = await response.json()
      console.log("[v0] Image uploaded successfully:", url)

      const newImages = [...images, url]
      setImages(newImages)

      const { error: updateError } = await supabase
        .from("studio_profiles")
        .update({ image_gallery: newImages })
        .eq("id", studioId)

      if (updateError) {
        console.error("[v0] Error updating database:", updateError)
        throw updateError
      }

      toast({
        title: "Image uploaded",
        description: "Your studio image has been uploaded successfully",
      })

      e.target.value = ""
    } catch (error: any) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !studioId) return

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, MOV, WEBM)",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }

    // Validate file size (50MB for videos)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 50MB",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }

    setUploading(true)
    console.log("[v0] Uploading video:", file.name)

    try {
      console.log("[v0] Starting client-side Blob upload for:", file.name)

      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })

      console.log("[v0] Video uploaded to Blob:", blob.url)

      const newVideos = [...videos, blob.url]
      setVideos(newVideos)

      const { error: updateError } = await supabase
        .from("studio_profiles")
        .update({ video_urls: newVideos })
        .eq("id", studioId)

      if (updateError) {
        console.error("[v0] Error updating database:", updateError)
        throw updateError
      }

      toast({
        title: "Video uploaded",
        description: "Your studio video has been uploaded successfully",
      })

      e.target.value = ""
    } catch (error: any) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (url: string) => {
    if (!studioId) return

    try {
      const newImages = images.filter((img) => img !== url)
      setImages(newImages)

      const { error } = await supabase.from("studio_profiles").update({ image_gallery: newImages }).eq("id", studioId)

      if (error) throw error

      toast({
        title: "Image deleted",
        description: "The image has been removed from your gallery",
      })
    } catch (error) {
      console.error("[v0] Delete error:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  const handleDeleteVideo = async (url: string) => {
    if (!studioId) return

    try {
      const newVideos = videos.filter((vid) => vid !== url)
      setVideos(newVideos)

      const { error } = await supabase.from("studio_profiles").update({ video_urls: newVideos }).eq("id", studioId)

      if (error) throw error

      toast({
        title: "Video deleted",
        description: "The video has been removed from your gallery",
      })
    } catch (error) {
      console.error("[v0] Delete error:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete video",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading media...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Studio Media</h1>
            <p className="text-muted-foreground">
              Upload photos and videos to showcase your studio facility and equipment
            </p>
          </div>

          <Tabs defaultValue="images" className="space-y-6">
            <TabsList>
              <TabsTrigger value="images">
                <ImageIcon className="h-4 w-4 mr-2" />
                Images ({images.length})
              </TabsTrigger>
              <TabsTrigger value="videos">
                <Video className="h-4 w-4 mr-2" />
                Videos ({videos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Images</CardTitle>
                  <CardDescription>Add photos of your studio, equipment, and facilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <label
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      uploading
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <>
                          <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="mb-2 text-sm text-center">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (MAX. 5MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </CardContent>
              </Card>

              {images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Studio Images</CardTitle>
                    <CardDescription>These images are visible to instructors on your profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                          <Image
                            src={url || "/placeholder.svg"}
                            alt={`Studio image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => handleDeleteImage(url)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Videos</CardTitle>
                  <CardDescription>Add video tours of your studio or class demos</CardDescription>
                </CardHeader>
                <CardContent>
                  <label
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      uploading
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <>
                          <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Video className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="mb-2 text-sm text-center">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">MP4, MOV, or WEBM (MAX. 50MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
                      onChange={handleVideoUpload}
                      disabled={uploading}
                    />
                  </label>
                </CardContent>
              </Card>

              {videos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Studio Videos</CardTitle>
                    <CardDescription>These videos are visible to instructors on your profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((url, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                          <video src={url} controls className="w-full h-full object-cover" preload="metadata">
                            Your browser does not support the video tag.
                          </video>
                          <button
                            onClick={() => handleDeleteVideo(url)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <Button onClick={() => router.push("/studio/dashboard")} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
