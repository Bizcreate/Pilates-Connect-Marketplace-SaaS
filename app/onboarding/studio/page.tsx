"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { AvatarUpload } from "@/components/avatar-upload"
import { createBrowserClient } from "@/lib/supabase/client"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"

const STEPS = [
  { id: 1, title: "Studio Logo", description: "Add your studio branding" },
  { id: 2, title: "Studio Info", description: "Tell us about your studio" },
  { id: 3, title: "Contact Details", description: "How instructors can reach you" },
]

export default function StudioOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [formData, setFormData] = useState({
    studio_name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
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
        .from("studio_profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push("/studio/dashboard")
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

      await supabase
        .from("studio_profiles")
        .update({
          ...formData,
          onboarding_completed: true,
        })
        .eq("id", userId)

      router.push("/studio/dashboard")
    } catch (error) {
      console.error("[v0] Onboarding error:", error)
      alert("Failed to complete onboarding. Please try again.")
    } finally {
      setLoading(false)
    }
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
          {/* Step 1: Studio Logo */}
          {currentStep === 1 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <AvatarUpload userId={userId} userType="studio" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Add Your Studio Logo</h3>
                <p className="text-sm text-muted-foreground">
                  A professional logo helps instructors recognize your brand
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Studio Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studio_name">Studio Name *</Label>
                <Input
                  id="studio_name"
                  placeholder="Your studio name"
                  value={formData.studio_name}
                  onChange={(e) => setFormData({ ...formData, studio_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell instructors about your studio, teaching style, and culture..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Studio Address *</Label>
                <Input
                  id="address"
                  placeholder="Full street address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(04) 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourstudio.com.au"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">You're all set!</p>
                    <p className="text-sm text-muted-foreground">
                      Start posting jobs and finding qualified instructors
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
