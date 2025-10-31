"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Upload, CheckCircle, Instagram, Facebook, Linkedin, Globe } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { AvatarUpload } from "@/components/avatar-upload"
import { GalleryUpload } from "@/components/gallery-upload"

export default function InstructorProfilePage() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    linkedin: "",
    website: "",
  })
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data } = await supabase.from("instructor_profiles").select("*").eq("id", user.id).maybeSingle()

      if (data) {
        setProfile(data)
        setSocialLinks(data.social_links || {})
      }
    }
    loadProfile()
  }, [router])

  async function handleFileUpload(file: File, type: "cv" | "insurance") {
    setUploading(true)
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", `instructor/${user.id}/documents`)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()

      // Update profile based on type
      const updateField = type === "cv" ? "cv_url" : "insurance_url"
      await supabase
        .from("instructor_profiles")
        .update({ [updateField]: url })
        .eq("id", user.id)

      alert("Upload successful!")
      window.location.reload()
    } catch (error: any) {
      console.error("Upload error:", error)
      alert("Upload failed: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveSocialLinks() {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      await supabase.from("instructor_profiles").update({ social_links: socialLinks }).eq("id", user.id)

      alert("Social links saved!")
    } catch (error: any) {
      console.error("[v0] Save error:", error)
      alert("Save failed: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your professional information, documents, and media</p>
          </div>

          <div className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Upload a professional photo</CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarUpload
                  userId={profile.id}
                  currentAvatarUrl={profile.avatar_url}
                  userType="instructor"
                  onUploadComplete={() => window.location.reload()}
                />
              </CardContent>
            </Card>

            {/* Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Documents</CardTitle>
                <CardDescription>Upload your CV, insurance, and qualifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CV Upload */}
                <div className="space-y-2">
                  <Label>Curriculum Vitae (CV)</Label>
                  {profile.cv_url ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">CV Uploaded</p>
                        <a
                          href={profile.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          View Document
                        </a>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = ".pdf,.doc,.docx"
                          input.onchange = (e: any) => {
                            const file = e.target.files[0]
                            if (file) handleFileUpload(file, "cv")
                          }
                          input.click()
                        }}
                      >
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">Upload your CV (PDF, DOC, DOCX)</p>
                      <Button
                        variant="outline"
                        disabled={uploading}
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = ".pdf,.doc,.docx"
                          input.onchange = (e: any) => {
                            const file = e.target.files[0]
                            if (file) handleFileUpload(file, "cv")
                          }
                          input.click()
                        }}
                      >
                        {uploading ? "Uploading..." : "Choose File"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Insurance Upload */}
                <div className="space-y-2">
                  <Label>Professional Indemnity Insurance</Label>
                  {profile.insurance_url ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Insurance Certificate Uploaded</p>
                        <a
                          href={profile.insurance_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          View Document
                        </a>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = ".pdf,.jpg,.jpeg,.png"
                          input.onchange = (e: any) => {
                            const file = e.target.files[0]
                            if (file) handleFileUpload(file, "insurance")
                          }
                          input.click()
                        }}
                      >
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">Upload insurance certificate (PDF, JPG, PNG)</p>
                      <Button
                        variant="outline"
                        disabled={uploading}
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = ".pdf,.jpg,.jpeg,.png"
                          input.onchange = (e: any) => {
                            const file = e.target.files[0]
                            if (file) handleFileUpload(file, "insurance")
                          }
                          input.click()
                        }}
                      >
                        {uploading ? "Uploading..." : "Choose File"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Media Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Media Gallery</CardTitle>
                <CardDescription>Showcase your teaching style with videos and images</CardDescription>
              </CardHeader>
              <CardContent>
                <GalleryUpload
                  userId={profile.id}
                  userType="instructor"
                  currentImages={profile.image_gallery || []}
                  currentVideos={profile.video_urls || []}
                  onUpdate={() => window.location.reload()}
                />
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/yourusername"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/yourusername"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourusername"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={socialLinks.website}
                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  />
                </div>

                <Button onClick={handleSaveSocialLinks} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Social Links"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
