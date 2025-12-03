"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, ImageIcon, Video, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function InstructorMediaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.replace("/auth/login")
          return
        }

        const { data: profileData } = await supabase
          .from("instructor_profiles")
          .select("media_images, media_videos")
          .eq("id", user.id)
          .maybeSingle()

        if (profileData) {
          setImages(profileData.media_images || [])
          setVideos(profileData.media_videos || [])
        }
      } catch (error) {
        console.error("[v0] Error loading media:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, or WEBP)",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }

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

    try {
      console.log("[v0] Starting image upload:", file.name)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      console.log("[v0] Upload response:", data)

      const newImages = [...images, data.url]
      setImages(newImages)

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase.from("instructor_profiles").update({ media_images: newImages }).eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      })
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      e.target.value = ""
      setUploading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, MOV, or WebM)",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }

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

    try {
      console.log("[v0] Starting video upload:", file.name)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      console.log("[v0] Upload response:", data)

      const newVideos = [...videos, data.url]
      setVideos(newVideos)

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase.from("instructor_profiles").update({ media_videos: newVideos }).eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      })
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      })
    } finally {
      e.target.value = ""
      setUploading(false)
    }
  }

  const handleRemoveImage = async (url: string) => {
    const newImages = images.filter((img) => img !== url)
    setImages(newImages)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from("instructor_profiles").update({ media_images: newImages }).eq("id", user.id)

      toast({
        title: "Image removed",
        description: "Image has been removed from your profile",
      })
    } catch (error) {
      console.error("Remove error:", error)
      setImages([...images])
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      })
    }
  }

  const handleRemoveVideo = async (url: string) => {
    const newVideos = videos.filter((vid) => vid !== url)
    setVideos(newVideos)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from("instructor_profiles").update({ media_videos: newVideos }).eq("id", user.id)

      toast({
        title: "Video removed",
        description: "Video has been removed from your profile",
      })
    } catch (error) {
      console.error("Remove error:", error)
      setVideos([...videos])
      toast({
        title: "Error",
        description: "Failed to remove video",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Profile Media</h1>
            <p className="text-muted-foreground mt-1">
              Upload photos and videos to showcase your teaching style and experience
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

            <TabsContent value="images" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Images</CardTitle>
                  <CardDescription>Add photos of your classes, certifications, or teaching environment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors ${
                        uploading ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <>
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="mb-2 text-sm text-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (MAX. 5MB)</p>
                          </>
                        )}
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </Label>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((url, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Instructor media ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(url)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Videos</CardTitle>
                  <CardDescription>Share video clips of your teaching style or client testimonials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="video-upload"
                      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors ${
                        uploading ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <>
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Video className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="mb-2 text-sm text-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">MP4, MOV, or WebM (MAX. 50MB)</p>
                          </>
                        )}
                      </div>
                      <Input
                        id="video-upload"
                        type="file"
                        className="hidden"
                        accept="video/mp4,video/quicktime,video/webm"
                        onChange={handleVideoUpload}
                        disabled={uploading}
                      />
                    </Label>
                  </div>

                  {videos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((url, index) => (
                        <div key={index} className="relative group">
                          <video src={url} controls className="w-full h-64 object-cover rounded-lg bg-black" />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveVideo(url)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
