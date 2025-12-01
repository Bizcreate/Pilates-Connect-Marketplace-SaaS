"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Upload, CheckCircle, Instagram, Facebook, Linkedin, Globe } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { AvatarUpload } from "@/components/avatar-upload"

export default function InstructorProfilePage() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [insuranceUrl, setInsuranceUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    location: "",
    phone: "",
    years_experience: 0,
    hourly_rate_min: 60,
    hourly_rate_max: 80,
    certifications: "",
    equipment: "",
    availability_status: "available",
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

      console.log("[v0] Loading profile for user:", user.id)
      setUserId(user.id)

      const { data: baseProfile, error: baseError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      console.log("[v0] Base profile loaded:", baseProfile)
      if (baseError) console.error("[v0] Base profile error:", baseError)

      const { data: instructorProfile, error: instructorError } = await supabase
        .from("instructor_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      console.log("[v0] Instructor profile loaded:", instructorProfile)
      if (instructorError) console.error("[v0] Instructor profile error:", instructorError)

      if (baseProfile) {
        setAvatarUrl(baseProfile.avatar_url)
        setFormData((prev) => ({
          ...prev,
          display_name: baseProfile.display_name || "",
          bio: baseProfile.bio || "",
          location: baseProfile.location || "",
          phone: baseProfile.phone || "",
        }))
      }

      if (instructorProfile) {
        setCvUrl(instructorProfile.cv_url)
        setInsuranceUrl(instructorProfile.insurance_url)

        const socialLinks = instructorProfile.social_links || {}

        setFormData((prev) => ({
          ...prev,
          years_experience: instructorProfile.years_experience || 0,
          hourly_rate_min: instructorProfile.hourly_rate_min || 60,
          hourly_rate_max: instructorProfile.hourly_rate_max || 80,
          availability_status: instructorProfile.availability_status || "available",
          certifications: Array.isArray(instructorProfile.certifications)
            ? instructorProfile.certifications.join(", ")
            : "",
          equipment: Array.isArray(instructorProfile.equipment) ? instructorProfile.equipment.join(", ") : "",
          instagram: socialLinks.instagram || "",
          facebook: socialLinks.facebook || "",
          linkedin: socialLinks.linkedin || "",
          website: socialLinks.website || "",
        }))
      }

      setInitialLoading(false)
    }
    loadProfile()
  }, [router])

  async function handleSaveProfile() {
    setLoading(true)
    console.log("[v0] ===== STARTING PROFILE SAVE =====")
    console.log("[v0] Form data to save:", formData)
    console.log("[v0] User ID:", userId)

    const timeoutId = setTimeout(() => {
      console.error("[v0] ⏱️ SAVE TIMEOUT - Save took longer than 30 seconds")
      setLoading(false)
      alert("Save timed out. Please check your internet connection and try again.")
    }, 30000)

    try {
      const supabase = createBrowserClient()
      if (!userId) throw new Error("Not authenticated")

      const { data: sessionData, error: sessionError } = await supabase.auth.getUser()
      console.log("[v0] Current session:", sessionData)
      if (sessionError) {
        console.error("[v0] Session error:", sessionError)
      }

      const { data: testRead, error: testReadError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      console.log("[v0] Test read from profiles:", testRead)
      if (testReadError) {
        console.error("[v0] ❌ Cannot read profiles table:", testReadError)
        throw new Error(`Permission error: ${testReadError.message}`)
      }

      const profilesData = {
        display_name: formData.display_name,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      }
      console.log("[v0] Step 1: Updating profiles table with data:", profilesData)

      const { data: profilesResult, error: baseError } = await supabase
        .from("profiles")
        .update(profilesData)
        .eq("id", userId)
        .select()

      if (baseError) {
        console.error("[v0] ❌ Profiles update FAILED:", {
          error: baseError,
          message: baseError.message,
          details: baseError.details,
          hint: baseError.hint,
          code: baseError.code,
        })
        throw baseError
      }

      console.log("[v0] ✅ Profiles updated successfully:", profilesResult)

      const certificationsArray = formData.certifications
        ? formData.certifications
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c.length > 0)
        : []

      const equipmentArray = formData.equipment
        ? formData.equipment
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e.length > 0)
        : []

      const socialLinksObj = {
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        linkedin: formData.linkedin || null,
        website: formData.website || null,
      }

      const instructorData = {
        id: userId,
        bio: formData.bio,
        years_experience: formData.years_experience ? Number.parseInt(formData.years_experience.toString()) : 0,
        hourly_rate_min: formData.hourly_rate_min ? Number.parseInt(formData.hourly_rate_min.toString()) : 0,
        hourly_rate_max: formData.hourly_rate_max ? Number.parseInt(formData.hourly_rate_max.toString()) : 0,
        certifications: certificationsArray,
        equipment: equipmentArray,
        availability_status: formData.availability_status || "unavailable",
        social_links: socialLinksObj,
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Step 2: Upserting instructor_profiles with data:", instructorData)
      console.log("[v0] Certifications array:", certificationsArray)
      console.log("[v0] Equipment array:", equipmentArray)
      console.log("[v0] Social links object:", socialLinksObj)

      const { data: instructorResult, error: instructorError } = await supabase
        .from("instructor_profiles")
        .upsert(instructorData, { onConflict: "id" })
        .select()

      if (instructorError) {
        console.error("[v0] ❌ Instructor profiles update FAILED:", {
          error: instructorError,
          message: instructorError.message,
          details: instructorError.details,
          hint: instructorError.hint,
          code: instructorError.code,
        })
        throw instructorError
      }

      console.log("[v0] ✅ Instructor profiles updated successfully:", instructorResult)
      console.log("[v0] ===== PROFILE SAVE COMPLETE =====")

      clearTimeout(timeoutId)

      setFormData({
        ...formData,
        ...profilesData,
        certifications: formData.certifications,
        equipment: formData.equipment,
      })

      alert("Profile saved successfully!")
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error("[v0] ❌ SAVE FAILED:", error)
      alert(`Save failed: ${error.message}\n\nCheck the browser console for detailed error information.`)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(file: File, type: "cv" | "insurance") {
    setUploading(true)
    try {
      const supabase = createBrowserClient()
      if (!userId) throw new Error("Not authenticated")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", `instructor/${userId}/documents`)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()

      const updateField = type === "cv" ? "cv_url" : "insurance_url"
      const { error } = await supabase
        .from("instructor_profiles")
        .upsert({ id: userId, [updateField]: url, updated_at: new Date().toISOString() }, { onConflict: "id" })

      if (error) throw error

      if (type === "cv") {
        setCvUrl(url)
      } else {
        setInsuranceUrl(url)
      }

      alert("Upload successful!")
    } catch (error: any) {
      console.error("[v0] Upload error:", error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
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
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your professional information and documents</p>
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
                  userId={userId}
                  currentAvatarUrl={avatarUrl}
                  userType="instructor"
                  onUploadComplete={(url) => setAvatarUrl(url)}
                />
              </CardContent>
            </Card>

            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your personal details and teaching experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell studios about your experience and teaching style..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Sydney CBD"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+61 400 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={formData.years_experience}
                      onChange={(e) =>
                        setFormData({ ...formData, years_experience: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_rate">Min Rate ($)</Label>
                    <Input
                      id="min_rate"
                      type="number"
                      min="0"
                      value={formData.hourly_rate_min}
                      onChange={(e) =>
                        setFormData({ ...formData, hourly_rate_min: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_rate">Max Rate ($)</Label>
                    <Input
                      id="max_rate"
                      type="number"
                      min="0"
                      value={formData.hourly_rate_max}
                      onChange={(e) =>
                        setFormData({ ...formData, hourly_rate_max: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certifications">Certifications</Label>
                    <Input
                      id="certifications"
                      placeholder="Mat Pilates, Reformer, Cadillac"
                      value={formData.certifications}
                      onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Separate with commas</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipment</Label>
                    <Input
                      id="equipment"
                      placeholder="Reformer, Mat, Cadillac"
                      value={formData.equipment}
                      onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Separate with commas</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Social Links</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="flex items-center gap-2">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        placeholder="https://instagram.com/username"
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
                        placeholder="https://facebook.com/username"
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
                        placeholder="https://linkedin.com/in/username"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
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
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>

            {/* Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Documents</CardTitle>
                <CardDescription>Upload your CV and insurance certificate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CV Upload */}
                <div className="space-y-2">
                  <Label>Curriculum Vitae (CV)</Label>
                  {cvUrl ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">CV Uploaded</p>
                        <a
                          href={cvUrl}
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
                            const file = e.target.files?.[0]
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
                            const file = e.target.files?.[0]
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
                  {insuranceUrl ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Insurance Certificate Uploaded</p>
                        <a
                          href={insuranceUrl}
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
                            const file = e.target.files?.[0]
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
                            const file = e.target.files?.[0]
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
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
