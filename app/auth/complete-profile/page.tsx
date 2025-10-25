"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createBrowserClient } from "@/lib/supabase/client"
import { Activity } from "lucide-react"
import Link from "next/link"

export default function CompleteProfilePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userType, setUserType] = useState<"studio" | "instructor">("instructor")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const displayName = formData.get("displayName") as string
    const location = formData.get("location") as string
    const bio = formData.get("bio") as string

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Not authenticated")
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email!,
        display_name: displayName,
        location,
        bio,
        user_type: userType,
      })

      if (profileError) throw profileError

      // Create type-specific profile
      if (userType === "studio") {
        const { error: studioError } = await supabase.from("studio_profiles").insert({
          id: user.id,
          studio_name: displayName,
        })
        if (studioError) throw studioError
      } else {
        const { error: instructorError } = await supabase.from("instructor_profiles").insert({
          id: user.id,
        })
        if (instructorError) throw instructorError
      }

      // Redirect to appropriate dashboard
      router.push(userType === "studio" ? "/studio/dashboard" : "/instructor/dashboard")
    } catch (err: any) {
      console.error("[v0] Profile creation error:", err)
      setError(err.message || "Failed to create profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Activity className="h-6 w-6 text-primary" />
        <span className="text-xl font-semibold">Pilates Connect</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Tell us a bit about yourself to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>I am a...</Label>
              <RadioGroup value={userType} onValueChange={(value) => setUserType(value as "studio" | "instructor")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="studio" id="studio" />
                  <Label htmlFor="studio" className="font-normal cursor-pointer">
                    Studio Owner / Manager
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instructor" id="instructor" />
                  <Label htmlFor="instructor" className="font-normal cursor-pointer">
                    Pilates Instructor
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">{userType === "studio" ? "Studio Name" : "Your Name"}</Label>
              <Input id="displayName" name="displayName" required placeholder="Enter your name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" required placeholder="e.g., Bondi, NSW" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" placeholder="Tell us about yourself..." rows={4} className="resize-none" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Profile..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
