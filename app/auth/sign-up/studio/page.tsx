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

export default function StudioSignUpPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const studioName = formData.get("studioName") as string
    const contactName = formData.get("contactName") as string
    const location = formData.get("location") as string
    const phone = formData.get("phone") as string
    const website = formData.get("website") as string
    const instagram = formData.get("instagram") as string
    const bio = formData.get("bio") as string

    if (equipment.length === 0) {
      setError("Please select at least one equipment type your studio has")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      console.log("[v0] Starting studio signup for:", email)
      console.log("[v0] Form data:", {
        email,
        studioName,
        contactName,
        location,
        phone,
        website,
        instagram,
        bio,
        equipment,
      })

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            user_type: "studio",
            display_name: contactName,
            location,
            phone: phone || null,
            bio: bio || null,
            studio_name: studioName,
            equipment,
            website: website || null,
            instagram: instagram || null,
          },
        },
      })

      if (signUpError) {
        console.error("[v0] Signup error details:", {
          message: signUpError.message,
          status: signUpError.status,
          name: signUpError.name,
          fullError: signUpError,
        })
        setError(`Signup failed: ${signUpError.message}`)
        setLoading(false)
        return
      }

      console.log("[v0] Signup successful:", data)
      console.log("[v0] User created:", data.user?.id)
      console.log("[v0] Email confirmation required:", data.user?.identities?.length === 0)

      window.location.href = "/auth/sign-up-success"
    } catch (err: any) {
      console.error("[v0] Studio signup exception:", {
        message: err.message,
        stack: err.stack,
        fullError: err,
      })
      setError(`Database error saving new user: ${err.message || "Unknown error"}`)
      setLoading(false)
    }
  }

  const toggleEquipment = (item: string) => {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]))
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
            <CardTitle className="text-2xl">Join as a Studio</CardTitle>
            <CardDescription>
              Find qualified instructors and manage your staffing needs all in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Account Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Studio Email *</Label>
                    <Input id="email" name="email" type="email" required placeholder="studio@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" name="password" type="password" required minLength={6} />
                  </div>
                </div>
              </div>

              {/* Studio Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Studio Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studioName">Studio Name *</Label>
                    <Input id="studioName" name="studioName" required placeholder="Your Studio Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Person *</Label>
                    <Input id="contactName" name="contactName" required placeholder="Your Name" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+61 2 XXXX XXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" name="location" required placeholder="e.g., Bondi, NSW" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" type="url" placeholder="https://yourstudio.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram Handle</Label>
                    <Input id="instagram" name="instagram" placeholder="@yourstudio" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">About Your Studio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    placeholder="Tell instructors about your studio, teaching philosophy, and what makes your team special..."
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Equipment */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Studio Equipment</h3>
                <div className="space-y-2">
                  <Label>What equipment does your studio have? *</Label>
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
              </div>

              {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

              <div className="flex flex-col gap-4">
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Studio Account"}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
                <p className="text-sm text-center text-muted-foreground">
                  Are you an instructor?{" "}
                  <Link href="/auth/sign-up/instructor" className="text-primary hover:underline">
                    Sign up as an instructor
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
