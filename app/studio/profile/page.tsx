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
import { Instagram, Facebook, Linkedin, Globe, Phone, Mail } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

export default function StudioProfilePage() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    studio_name: "",
    description: "",
    address: "",
    suburb: "",
    state: "",
    postcode: "",
    phone: "",
    email: "",
    website: "",
    studio_size: "",
    equipment_available: "",
    instagram: "",
    facebook: "",
    linkedin: "",
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

      setUserId(user.id)

      const { data: baseProfile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

      const { data: studioProfile } = await supabase.from("studio_profiles").select("*").eq("id", user.id).maybeSingle()

      if (baseProfile) {
        setAvatarUrl(baseProfile.avatar_url)
        setFormData((prev) => ({
          ...prev,
          phone: baseProfile.phone || "",
        }))
      }

      if (studioProfile) {
        const socialLinks = studioProfile.social_links || {}

        setFormData((prev) => ({
          ...prev,
          studio_name: studioProfile.studio_name || "",
          description: studioProfile.description || "",
          address: studioProfile.address || "",
          suburb: studioProfile.suburb || "",
          state: studioProfile.state || "",
          postcode: studioProfile.postcode || "",
          email: studioProfile.email || "",
          website: studioProfile.website || "",
          studio_size: studioProfile.studio_size || "",
          equipment_available: Array.isArray(studioProfile.equipment_available)
            ? studioProfile.equipment_available.join(", ")
            : "",
          instagram: socialLinks.instagram || "",
          facebook: socialLinks.facebook || "",
          linkedin: socialLinks.linkedin || "",
        }))
      }

      setInitialLoading(false)
    }
    loadProfile()
  }, [router])

  async function handleSaveProfile() {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      if (!userId) throw new Error("Not authenticated")

      console.log("[v0] Saving studio profile for user:", userId)

      const { error: baseError } = await supabase
        .from("profiles")
        .update({
          display_name: formData.studio_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (baseError) {
        console.error("[v0] Profiles update error:", baseError)
        throw baseError
      }

      const equipmentArray = formData.equipment_available
        ? formData.equipment_available
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e.length > 0)
        : []

      const socialLinksObj = {
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        linkedin: formData.linkedin || null,
      }

      const { error: studioError } = await supabase.from("studio_profiles").upsert(
        {
          id: userId,
          studio_name: formData.studio_name,
          description: formData.description,
          address: formData.address,
          suburb: formData.suburb,
          state: formData.state,
          postcode: formData.postcode,
          email: formData.email,
          website: formData.website,
          studio_size: formData.studio_size,
          equipment_available: equipmentArray,
          social_links: socialLinksObj,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      if (studioError) {
        console.error("[v0] Studio profiles update error:", studioError)
        throw studioError
      }

      alert("Profile saved successfully!")
    } catch (error: any) {
      console.error("[v0] Save error:", error)
      alert(`Save failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
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
                  userId={userId}
                  currentAvatarUrl={avatarUrl}
                  userType="studio"
                  onUploadComplete={(url) => setAvatarUrl(url)}
                />
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Studio Information</CardTitle>
                <CardDescription>Your studio's core details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studio_name">Studio Name</Label>
                  <Input
                    id="studio_name"
                    value={formData.studio_name}
                    onChange={(e) => setFormData({ ...formData, studio_name: e.target.value })}
                    placeholder="Pilates Studio Sydney"
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

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb</Label>
                    <Input
                      id="suburb"
                      value={formData.suburb}
                      onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                      placeholder="Sydney CBD"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="NSW"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="studio_size">Studio Size</Label>
                    <Input
                      id="studio_size"
                      value={formData.studio_size}
                      onChange={(e) => setFormData({ ...formData, studio_size: e.target.value })}
                      placeholder="Small, Medium, Large"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment Available</Label>
                  <Input
                    id="equipment"
                    value={formData.equipment_available}
                    onChange={(e) => setFormData({ ...formData, equipment_available: e.target.value })}
                    placeholder="Reformer, Cadillac, Chair, Barrel"
                  />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Social Media</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="flex items-center gap-2">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        placeholder="https://instagram.com/yourstudio"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
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
                        value={formData.facebook}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
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
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={loading} className="w-full" size="lg">
                  {loading ? "Saving..." : "Save Profile"}
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
