"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AvatarUpload } from "@/components/avatar-upload"
import { GalleryUpload } from "@/components/gallery-upload"
import { Instagram, Facebook, Linkedin, Globe, MapPin, Phone, Mail } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

export default function StudioProfilePage() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    studio_name: "",
    description: "",
    location: "",
    phone: "",
    email: "",
    website: "",
  })
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

      const { data } = await supabase.from("studio_profiles").select("*").eq("id", user.id).maybeSingle()

      if (data) {
        setProfile(data)
        setFormData({
          studio_name: data.studio_name || "",
          description: data.description || "",
          location: data.location || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
        })
        setSocialLinks(data.social_links || {})
      }
    }
    loadProfile()
  }, [router])

  async function handleSaveProfile() {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      console.log("[v0] Saving studio profile for user:", user.id)
      console.log("[v0] Profile data:", formData)

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: formData.studio_name,
          location: formData.location,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      console.log("[v0] Profiles table update:", { error: profileError?.message })

      if (profileError) throw profileError

      const { data, error } = await supabase
        .from("studio_profiles")
        .upsert(
          {
            id: user.id,
            studio_name: formData.studio_name,
            website: formData.website,
            description: formData.description,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        )
        .select()

      console.log("[v0] Save result:", { success: !!data, error: error?.message, data })

      if (error) throw error

      alert("Profile saved successfully!")
      window.location.reload()
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
            <h1 className="text-3xl font-bold mb-2">Studio Profile</h1>
            <p className="text-muted-foreground">Manage your studio information and showcase your space</p>
          </div>

          <div className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle>Studio Logo</CardTitle>
                <CardDescription>Upload your studio logo or brand image</CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarUpload
                  userId={profile.id}
                  currentAvatarUrl={profile.avatar_url}
                  userType="studio"
                  onUploadComplete={() => window.location.reload()}
                />
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your studio's core details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studio_name">Studio Name</Label>
                  <Input
                    id="studio_name"
                    value={formData.studio_name}
                    onChange={(e) => setFormData({ ...formData, studio_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell instructors about your studio..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Sydney, NSW"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+61 400 000 000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="studio@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourstudio.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Studio Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Studio Gallery</CardTitle>
                <CardDescription>Showcase your studio space, equipment, and classes</CardDescription>
              </CardHeader>
              <CardContent>
                <GalleryUpload
                  userId={profile.id}
                  userType="studio"
                  currentImages={profile.image_gallery || []}
                  currentVideos={profile.video_urls || []}
                  onUpdate={() => window.location.reload()}
                />
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
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
                    placeholder="https://instagram.com/yourstudio"
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
                    placeholder="https://facebook.com/yourstudio"
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
                    placeholder="https://linkedin.com/company/yourstudio"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveProfile} disabled={loading} className="w-full" size="lg">
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
