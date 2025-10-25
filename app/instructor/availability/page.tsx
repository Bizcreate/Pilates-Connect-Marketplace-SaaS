"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowLeft, Save, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const TIME_SLOTS = [
  "6:00 AM - 9:00 AM",
  "9:00 AM - 12:00 PM",
  "12:00 PM - 3:00 PM",
  "3:00 PM - 6:00 PM",
  "6:00 PM - 9:00 PM",
]

interface Availability {
  [key: string]: string[]
}

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("instructor_profiles")
        .select("availability")
        .eq("id", user.id)
        .single()

      if (profile?.availability) {
        setAvailability(profile.availability as Availability)
      }
    } catch (error) {
      console.error("[v0] Error loading availability:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTimeSlot = (day: string, timeSlot: string) => {
    setAvailability((prev) => {
      const daySlots = prev[day] || []
      const newSlots = daySlots.includes(timeSlot)
        ? daySlots.filter((slot) => slot !== timeSlot)
        : [...daySlots, timeSlot]

      return {
        ...prev,
        [day]: newSlots,
      }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("instructor_profiles").update({ availability }).eq("id", user.id)

      if (error) throw error

      toast({
        title: "Availability saved!",
        description: "Your weekly availability has been updated.",
      })
    } catch (error) {
      console.error("[v0] Error saving availability:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save availability",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-5xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/instructor/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Manage Availability</h1>
            <p className="text-muted-foreground mt-1">Set your weekly availability to help studios find you</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Select the times you're available to teach classes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {DAYS.map((day) => (
                <div key={day} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-base font-semibold">{day}</Label>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-6">
                    {TIME_SLOTS.map((timeSlot) => {
                      const isChecked = availability[day]?.includes(timeSlot) || false

                      return (
                        <div key={timeSlot} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${day}-${timeSlot}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleTimeSlot(day, timeSlot)}
                          />
                          <Label htmlFor={`${day}-${timeSlot}`} className="font-normal cursor-pointer text-sm">
                            {timeSlot}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={isSaving} size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Availability"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
