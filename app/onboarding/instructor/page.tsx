"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { AvatarUpload } from "@/components/avatar-upload"
import { createBrowserClient } from "@/lib/supabase/client"
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

const STEPS = [
  { id: 1, title: "Profile Photo", description: "Add a professional photo" },
  { id: 2, title: "Basic Info", description: "Tell us about yourself" },
  { id: 3, title: "Experience", description: "Your qualifications" },
  { id: 4, title: "Preferences", description: "Job preferences" },
]

const EQUIPMENT_OPTIONS = ["Reformer", "Cadillac", "Chair", "Tower", "Mat", "Barrel", "Spine Corrector"]
const CERTIFICATION_OPTIONS = [
  "Mat Certification",
  "Reformer Certification",
  "Comprehensive Certification",
  "Pre/Postnatal",
  "Rehabilitation",
  "First Aid",
]

export default function InstructorOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    years_experience: "",
    hourly_rate_min: "",
    hourly_rate_max: "",
    equipment: [] as string[],
    certifications: [] as string[],
    location: "",
    willing_to_travel: false,
  })

  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)

      // Check if already onboarded
      const { data: profile } = await supabase
        .from("instructor_profiles")
        .select("years_experience")
        .eq("id", user.id)
        .single()

      if (profile?.years_experience !== null) {
        router.push("/instructor/dashboard")
      }
    }

    checkAuth()
  }, [router])

  const progress = (currentStep / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)

    try {
      const supabase = createBrowserClient()

      // First update the profile display_name, bio, location
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location,
        })
        .eq("id", userId)

      if (profileError) {
        console.error("[v0] Profile update error:", profileError)
        throw profileError
      }

      // Then upsert the instructor_profiles with correct columns
      const { error: instructorError } = await supabase
        .from("instructor_profiles")
        .upsert({
          id: userId,
          years_experience: Number.parseInt(formData.years_experience) || 0,
          hourly_rate_min: Number.parseInt(formData.hourly_rate_min) || null,
          hourly_rate_max: Number.parseInt(formData.hourly_rate_max) || null,
          equipment: formData.equipment,
          certifications: formData.certifications,
          specializations: [],
          availability_status: "available",
        })

      if (instructorError) {
        console.error("[v0] Instructor profile error:", instructorError)
        throw instructorError
      }

      console.log("[v0] Onboarding completed successfully")
      router.push("/instructor/dashboard")
    } catch (error) {
      console.error("[v0] Onboarding error:", error)
      alert("Failed to complete onboarding. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item)
    }
    return [...array, item]
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Welcome to Pilates Connect!</CardTitle>
              <CardDescription>
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
              </CardDescription>
            </div>
            <div className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Profile Photo */}
          {currentStep === 1 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <AvatarUpload userId={userId} userType="instructor" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Add Your Profile Photo</h3>
                <p className="text-sm text-muted-foreground">
                  A professional photo helps studios recognize you and builds trust
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  placeholder="How you'd like to be known"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell studios about your teaching philosophy and experience..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Melbourne CBD, VIC"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="willing_to_travel"
                  checked={formData.willing_to_travel}
                  onCheckedChange={(checked) => setFormData({ ...formData, willing_to_travel: checked as boolean })}
                />
                <Label htmlFor="willing_to_travel" className="font-normal cursor-pointer">
                  I'm willing to travel to nearby locations
                </Label>
              </div>
            </div>
          )}

          {/* Step 3: Experience */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="years_experience">Years of Experience *</Label>
                <Input
                  id="years_experience"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Equipment Experience *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {EQUIPMENT_OPTIONS.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`equipment-${item}`}
                        checked={formData.equipment.includes(item)}
                        onCheckedChange={() =>
                          setFormData({ ...formData, equipment: toggleArrayItem(formData.equipment, item) })
                        }
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
                <div className="grid grid-cols-2 gap-3">
                  {CERTIFICATION_OPTIONS.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${cert}`}
                        checked={formData.certifications.includes(cert)}
                        onCheckedChange={() =>
                          setFormData({ ...formData, certifications: toggleArrayItem(formData.certifications, cert) })
                        }
                      />
                      <Label htmlFor={`cert-${cert}`} className="font-normal cursor-pointer text-sm">
                        {cert}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hourly Rate Range (AUD) *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      placeholder="Min"
                      value={formData.hourly_rate_min}
                      onChange={(e) => setFormData({ ...formData, hourly_rate_min: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={formData.hourly_rate_max}
                      onChange={(e) => setFormData({ ...formData, hourly_rate_max: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">This helps studios find instructors in their budget</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">You're all set!</p>
                    <p className="text-sm text-muted-foreground">
                      Complete your profile to start receiving job opportunities
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || loading}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} disabled={loading}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading}>
                {loading ? "Completing..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
