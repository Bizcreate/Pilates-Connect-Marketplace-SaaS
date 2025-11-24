"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowLeft, Save, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function PostJobPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>([])
  const [scheduleBlocks, setScheduleBlocks] = useState<
    Array<{
      day: string
      startTime: string
      endTime: string
    }>
  >([{ day: "Monday", startTime: "09:00", endTime: "17:00" }])

  const equipment = ["Reformer", "Cadillac", "Chair", "Tower", "Mat", "Barrel"]
  const certifications = ["Mat", "Reformer", "Comprehensive", "Pre/Postnatal"]
  const classTypes = ["Pilates", "Yoga", "Barre"]

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  const toggleCertification = (item: string) => {
    setSelectedCertifications((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  const toggleClassType = (item: string) => {
    setSelectedClassTypes((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  const addScheduleBlock = () => {
    setScheduleBlocks([...scheduleBlocks, { day: "Monday", startTime: "09:00", endTime: "17:00" }])
  }

  const removeScheduleBlock = (index: number) => {
    setScheduleBlocks(scheduleBlocks.filter((_, i) => i !== index))
  }

  const updateScheduleBlock = (index: number, field: string, value: string) => {
    const updated = [...scheduleBlocks]
    updated[index] = { ...updated[index], [field]: value }
    setScheduleBlocks(updated)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, status: "open" | "draft" = "open") => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      console.log("[v0] Starting job post submission...")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("[v0] User:", user?.id, user?.email)

      if (!user) throw new Error("Not authenticated")

      const { data: profile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id, user_type")
        .eq("id", user.id)
        .single()

      console.log("[v0] Profile check:", { profile, profileCheckError })

      if (!profile || profile.user_type !== "studio") {
        throw new Error("You must have a studio account to post jobs. Please create a studio profile first.")
      }

      const { data: studioProfile, error: profileError } = await supabase
        .from("studio_profiles")
        .select("id, studio_name")
        .eq("id", user.id)
        .maybeSingle()

      console.log("[v0] Studio profile check:", { studioProfile, profileError })

      if (!studioProfile) {
        throw new Error("Studio profile not found. Please complete your studio profile in Settings → Profile.")
      }

      const jobData = {
        studio_id: user.id,
        title: formData.get("job-title") as string,
        description: formData.get("description") as string,
        job_type: formData.get("job-type") as string,
        location: formData.get("location") as string,
        suburb: (formData.get("suburb") as string) || null,
        state: (formData.get("state") as string) || null,
        equipment_provided: selectedEquipment,
        required_certifications: selectedCertifications,
        required_experience: Number.parseInt(formData.get("required-experience") as string) || 0,
        hourly_rate_min: Number.parseInt(formData.get("rate-min") as string) || null,
        hourly_rate_max: Number.parseInt(formData.get("rate-max") as string) || null,
        start_date: (formData.get("start-date") as string) || null,
        end_date: (formData.get("end-date") as string) || null,
        status,
      }

      console.log("[v0] Job data to insert:", JSON.stringify(jobData, null, 2))

      const { data, error } = await supabase.from("jobs").insert([jobData]).select()

      console.log("[v0] Insert result:", { success: !!data, error: error?.message, errorDetails: error })

      if (error) {
        console.error("[v0] Database error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw new Error(`Database error: ${error.message}${error.hint ? ` (Hint: ${error.hint})` : ""}`)
      }

      toast({
        title: status === "open" ? "Job published!" : "Draft saved!",
        description:
          status === "open"
            ? "Your job posting is now live and visible to instructors."
            : "Your job has been saved as a draft.",
      })

      router.push("/studio/dashboard")
    } catch (error) {
      console.error("[v0] Error posting job:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/studio/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Post a New Job</h1>
            <p className="text-muted-foreground mt-1">Fill in the details to attract qualified Pilates instructors</p>
          </div>

          <form onSubmit={(e) => handleSubmit(e, "open")} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential details about the position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title *</Label>
                  <Input id="job-title" name="job-title" placeholder="e.g., Reformer Pilates Instructor" required />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-type">Job Type *</Label>
                    <Select name="job-type" required>
                      <SelectTrigger id="job-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="temp">Temp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" name="location" placeholder="e.g., Bondi, NSW" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb</Label>
                    <Input id="suburb" name="suburb" placeholder="e.g., Bondi" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" placeholder="e.g., NSW" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the role, responsibilities, and what makes your studio unique..."
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Include details about class types, schedule, and studio culture
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Equipment & Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment & Requirements</CardTitle>
                <CardDescription>Specify the equipment and certifications needed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="required-experience">Required Experience (Years) *</Label>
                  <Input
                    id="required-experience"
                    name="required-experience"
                    type="number"
                    placeholder="e.g., 2"
                    min="0"
                    defaultValue="0"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Minimum years of teaching experience required</p>
                </div>

                <div className="space-y-3">
                  <Label>Required Equipment Experience *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {equipment.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`equipment-${item}`}
                          checked={selectedEquipment.includes(item)}
                          onCheckedChange={() => toggleEquipment(item)}
                        />
                        <Label htmlFor={`equipment-${item}`} className="font-normal cursor-pointer">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Required Certifications</Label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {certifications.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cert-${item}`}
                          checked={selectedCertifications.includes(item)}
                          onCheckedChange={() => toggleCertification(item)}
                        />
                        <Label htmlFor={`cert-${item}`} className="font-normal cursor-pointer">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Class Types</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {classTypes.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`class-${item}`}
                          checked={selectedClassTypes.includes(item)}
                          onCheckedChange={() => toggleClassType(item)}
                        />
                        <Label htmlFor={`class-${item}`} className="font-normal cursor-pointer">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader>
                <CardTitle>Compensation</CardTitle>
                <CardDescription>Salary or rate information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Rate Type *</Label>
                  <RadioGroup name="rate-type" defaultValue="per-class" required>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="per-class" id="per-class" />
                      <Label htmlFor="per-class" className="font-normal cursor-pointer">
                        Per Class
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hourly" id="hourly" />
                      <Label htmlFor="hourly" className="font-normal cursor-pointer">
                        Hourly
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="salary" id="salary" />
                      <Label htmlFor="salary" className="font-normal cursor-pointer">
                        Annual Salary
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate-min">Minimum Rate ($) *</Label>
                    <Input id="rate-min" name="rate-min" type="number" placeholder="50" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate-max">Maximum Rate ($)</Label>
                    <Input id="rate-max" name="rate-max" type="number" placeholder="80" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule & Availability</CardTitle>
                <CardDescription>When do you need the instructor?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" name="start-date" type="date" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" name="end-date" type="date" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Schedule Blocks</Label>

                  <div className="space-y-3">
                    {scheduleBlocks.map((block, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs">Day</Label>
                          <Select value={block.day} onValueChange={(value) => updateScheduleBlock(index, "day", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Monday">Monday</SelectItem>
                              <SelectItem value="Tuesday">Tuesday</SelectItem>
                              <SelectItem value="Wednesday">Wednesday</SelectItem>
                              <SelectItem value="Thursday">Thursday</SelectItem>
                              <SelectItem value="Friday">Friday</SelectItem>
                              <SelectItem value="Saturday">Saturday</SelectItem>
                              <SelectItem value="Sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs">Start Time</Label>
                          <Input
                            type="time"
                            value={block.startTime}
                            onChange={(e) => updateScheduleBlock(index, "startTime", e.target.value)}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs">End Time</Label>
                          <Input
                            type="time"
                            value={block.endTime}
                            onChange={(e) => updateScheduleBlock(index, "endTime", e.target.value)}
                          />
                        </div>
                        {scheduleBlocks.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeScheduleBlock(index)}>
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addScheduleBlock}
                    className="w-full bg-transparent"
                  >
                    Add Time Slot
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule">Additional Schedule Notes</Label>
                  <Textarea
                    id="schedule"
                    name="schedule"
                    placeholder="e.g., Flexible hours, Weekend availability preferred..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={(e) => {
                  const form = e.currentTarget.closest("form")
                  if (form) {
                    const submitEvent = new Event("submit", { bubbles: true, cancelable: true })
                    Object.defineProperty(submitEvent, "target", { value: form, enumerable: true })
                    handleSubmit(submitEvent as any, "draft")
                  }
                }}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button type="submit" size="lg" disabled={isLoading}>
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Publishing..." : "Publish Job"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
