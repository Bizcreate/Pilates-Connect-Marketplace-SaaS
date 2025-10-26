"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"

const EQUIPMENT_OPTIONS = ["Reformer", "Cadillac", "Chair", "Tower", "Mat", "Wunda", "Barrels"]
const CERTIFICATION_OPTIONS = [
  "Mat Pilates",
  "Reformer",
  "Comprehensive",
  "Pre/Postnatal",
  "Rehabilitation",
  "Sports Performance",
]

export default function InstructorSignUpPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const displayName = formData.get("displayName") as string
    const location = formData.get("location") as string
    const phone = formData.get("phone") as string
    const bio = formData.get("bio") as string
    const yearsExperience = formData.get("yearsExperience") as string
    const rateMin = formData.get("rateMin") as string
    const rateMax = formData.get("rateMax") as string

    if (equipment.length === 0) {
      setError("Please select at least one equipment type you can teach")
      setLoading(false)
      return
    }

    if (certifications.length === 0) {
      setError("Please select at least one certification")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            user_type: "instructor",
            display_name: displayName,
            location,
            phone: phone || null,
            bio: bio || null,
            equipment,
            certifications,
            years_experience: Number.parseInt(yearsExperience) || 0,
            hourly_rate_min: rateMin ? Number.parseInt(rateMin) : null,
            hourly_rate_max: rateMax ? Number.parseInt(rateMax) : null,
          },
        },
      })

      if (signUpError) {
        console.error("[v0] Signup error:", signUpError)
        setError(signUpError.message)
        setLoading(false)
        return
      }

      window.location.href = "/auth/sign-up-success"
    } catch (err: any) {
      console.error("[v0] Instructor signup error:", err)
      setError(err.message || "Failed to create account. Please try again.")
      setLoading(false)
    }
  }

  const toggleEquipment = (item: string) => {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]))
  }

  const toggleCertification = (item: string) => {
    setCertifications((prev) => (prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]))
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">Pilates Connect</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Join as an Instructor</CardTitle>
            <CardDescription>
              Create your professional profile and connect with studios across Australia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Account Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" name="password" type="password" required minLength={6} />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Full Name *</Label>
                    <Input id="displayName" name="displayName" required placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+61 4XX XXX XXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" name="location" required placeholder="e.g., Bondi, NSW" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    placeholder="Tell studios about your experience, teaching style, and what makes you unique..."
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Professional Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input id="yearsExperience" name="yearsExperience" type="number" min="0" placeholder="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Hourly Rate Range (AUD)</Label>
                    <div className="flex gap-2 items-center">
                      <Input id="rateMin" name="rateMin" type="number" min="0" placeholder="80" />
                      <span className="text-muted-foreground">-</span>
                      <Input id="rateMax" name="rateMax" type="number" min="0" placeholder="120" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Equipment You Can Teach *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {EQUIPMENT_OPTIONS.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`equipment-${item}`}
                          checked={equipment.includes(item)}
                          onCheckedChange={() => toggleEquipment(item)}
                        />
                        <Label htmlFor={`equipment-${item}`} className="font-normal cursor-pointer">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Certifications *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CERTIFICATION_OPTIONS.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cert-${item}`}
                          checked={certifications.includes(item)}
                          onCheckedChange={() => toggleCertification(item)}
                        />
                        <Label htmlFor={`cert-${item}`} className="font-normal cursor-pointer">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

              <div className="flex flex-col gap-4">
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Instructor Account"}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
                <p className="text-sm text-center text-muted-foreground">
                  Are you a studio?{" "}
                  <Link href="/auth/sign-up/studio" className="text-primary hover:underline">
                    Sign up as a studio
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
