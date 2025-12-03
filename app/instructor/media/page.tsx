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
import { upload } from "@vercel/blob/client"

export default function InstructorMediaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
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
        setProfile(profileData)
        setImages(profileData.media_images || [])
        setVideos(profileData.media_videos || [])
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB")
      return
    }

    setUploading(true)

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })

      const newImages = [...images, blob.url]
      setImages(newImages)

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from("instructor_profiles").update({ media_images: newImages }).eq("id", user!.id)

      alert("Image uploaded successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file")
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("Video must be less than 50MB")
      return
    }

    setUploading(true)

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })

      const newVideos = [...videos, blob.url]
      setVideos(newVideos)

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from("instructor_profiles").update({ media_videos: newVideos }).eq("id", user!.id)

      alert("Video uploaded successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload video")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (url: string) => {
    if (!confirm("Remove this image?")) return

    const newImages = images.filter((img) => img !== url)
    setImages(newImages)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from("instructor_profiles").update({ media_images: newImages }).eq("id", user!.id)
  }

  const handleRemoveVideo = async (url: string) => {
    if (!confirm("Remove this video?")) return

    const newVideos = videos.filter((vid) => vid !== url)
    setVideos(newVideos)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from("instructor_profiles").update({ media_videos: newVideos }).eq("id", user!.id)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                        ) : (
                          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                        )}
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (MAX. 5MB)</p>
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </Label>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Instructor media ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                        ) : (
                          <Video className="h-12 w-12 text-muted-foreground mb-4" />
                        )}
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">MP4, MOV, or WebM (MAX. 50MB)</p>
                      </div>
                      <Input
                        id="video-upload"
                        type="file"
                        className="hidden"
                        accept="video/*"
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
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
