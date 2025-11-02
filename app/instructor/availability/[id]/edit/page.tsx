"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowLeft, Calendar, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type AvailabilitySlot = {
  dateFrom: string
  dateTo: string
  repeatDays: string[]
  startTime: string
  endTime: string
  availabilityType: string
  pilatesLevel: string
  equipment: string[]
  rateMin: string
  rateUnit: string
  location: string
}

export default function EditAvailabilityPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [slot, setSlot] = useState<AvailabilitySlot>({
    dateFrom: "",
    dateTo: "",
    repeatDays: [],
    startTime: "09:00",
    endTime: "17:00",
    availabilityType: "cover",
    pilatesLevel: "mat-beginner",
    equipment: ["Reformer"],
    rateMin: "80",
    rateUnit: "per_class",
    location: "",
  })

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const equipment = ["Reformer", "Cadillac", "Chair", "Tower", "Mat", "Barrel"]

  useEffect(() => {
    async function loadSlot() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.replace("/auth/login")
          return
        }

        const { data, error } = await supabase
          .from("availability_slots")
          .select("*")
          .eq("id", params.id)
          .eq("instructor_id", user.id)
          .single()

        if (error) throw error

        if (!data) {
          toast({
            title: "Not found",
            description: "Availability slot not found",
            variant: "destructive",
          })
          router.push("/instructor/dashboard")
          return
        }

        // Convert database format to form format
        setSlot({
          dateFrom: data.date_from?.split("T")[0] || "",
          dateTo: data.date_to?.split("T")[0] || "",
          repeatDays: data.repeat_days || [],
          startTime: data.start_time || "09:00",
          endTime: data.end_time || "17:00",
          availabilityType: data.availability_type || "cover",
          pilatesLevel: data.pilates_level || "mat-beginner",
          equipment: data.equipment || ["Reformer"],
          rateMin: data.rate_min?.toString() || "80",
          rateUnit: data.rate_unit || "per_class",
          location: data.location || "",
        })
      } catch (error) {
        console.error("[v0] Error loading availability slot:", error)
        toast({
          title: "Error",
          description: "Failed to load availability slot",
          variant: "destructive",
        })
        router.push("/instructor/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    loadSlot()
  }, [params.id, router, toast])

  const updateSlot = (field: keyof AvailabilitySlot, value: any) => {
    setSlot({ ...slot, [field]: value })
  }

  const toggleDay = (day: string) => {
    const newDays = slot.repeatDays.includes(day) ? slot.repeatDays.filter((d) => d !== day) : [...slot.repeatDays, day]

    updateSlot("repeatDays", newDays)
  }

  const toggleEquipment = (item: string) => {
    const newEquipment = slot.equipment.includes(item)
      ? slot.equipment.filter((e) => e !== item)
      : [...slot.equipment, item]

    updateSlot("equipment", newEquipment)
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      console.log("[v0] Starting availability update...")

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("[v0] User:", user?.id)

      if (!user) throw new Error("Not authenticated")

      const updateData = {
        availability_type: slot.availabilityType,
        date_from: slot.dateFrom,
        date_to: slot.dateTo || null,
        repeat_days: slot.repeatDays,
        start_time: slot.startTime,
        end_time: slot.endTime,
        location: slot.location,
        pilates_level: slot.pilatesLevel,
        equipment: slot.equipment,
        rate_min: Number.parseInt(slot.rateMin) || null,
        rate_unit: slot.rateUnit,
      }

      console.log("[v0] Update data:", updateData)

      const { error } = await supabase
        .from("availability_slots")
        .update(updateData)
        .eq("id", params.id)
        .eq("instructor_id", user.id)

      console.log("[v0] Update result:", { error })

      if (error) throw error

      toast({
        title: "Availability updated!",
        description: "Your availability slot has been updated successfully.",
      })

      router.push("/instructor/dashboard")
    } catch (error) {
      console.error("[v0] Error updating availability:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update availability",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading availability slot...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-6xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/instructor/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Edit Availability</h1>
            <p className="text-muted-foreground">Update your availability slot details.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Availability Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Range */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date range - From *</Label>
                      <Input
                        type="date"
                        value={slot.dateFrom}
                        onChange={(e) => updateSlot("dateFrom", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date range - To</Label>
                      <Input type="date" value={slot.dateTo} onChange={(e) => updateSlot("dateTo", e.target.value)} />
                    </div>
                  </div>

                  {/* Repeat Days */}
                  <div className="space-y-2">
                    <Label>Repeat on</Label>
                    <div className="flex gap-2">
                      {weekDays.map((day) => (
                        <Button
                          key={day}
                          type="button"
                          variant={slot.repeatDays.includes(day) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDay(day)}
                          className="flex-1"
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We'll generate one slot on each selected weekday within your date range.
                    </p>
                  </div>

                  {/* Time Range */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start time *</Label>
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot("startTime", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End time *</Label>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlot("endTime", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Availability Type & Rate */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Availability type *</Label>
                      <Select
                        value={slot.availabilityType}
                        onValueChange={(value) => updateSlot("availabilityType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Cover</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="temp">Temp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Rate (min) *</Label>
                      <Input
                        type="number"
                        placeholder="80"
                        value={slot.rateMin}
                        onChange={(e) => updateSlot("rateMin", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rate unit *</Label>
                      <Select value={slot.rateUnit} onValueChange={(value) => updateSlot("rateUnit", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per_class">per class</SelectItem>
                          <SelectItem value="per_hour">per hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input
                      placeholder="e.g., Melbourne CBD, VIC"
                      value={slot.location}
                      onChange={(e) => updateSlot("location", e.target.value)}
                      required
                    />
                  </div>

                  {/* Pilates Level */}
                  <div className="space-y-2">
                    <Label>Pilates Level *</Label>
                    <Select value={slot.pilatesLevel} onValueChange={(value) => updateSlot("pilatesLevel", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mat-beginner">Mat — Beginner</SelectItem>
                        <SelectItem value="mat-intermediate">Mat — Intermediate</SelectItem>
                        <SelectItem value="mat-advanced">Mat — Advanced</SelectItem>
                        <SelectItem value="reformer-beginner">Reformer — Beginner</SelectItem>
                        <SelectItem value="reformer-intermediate">Reformer — Intermediate</SelectItem>
                        <SelectItem value="reformer-advanced">Reformer — Advanced</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive (All Apparatus)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Equipment */}
                  <div className="space-y-2">
                    <Label>Apparatus *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {equipment.map((item) => (
                        <Button
                          key={item}
                          type="button"
                          variant={slot.equipment.includes(item) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleEquipment(item)}
                        >
                          {item}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="/instructor/dashboard">Cancel</Link>
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving} size="lg" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{slot.availabilityType}</Badge>
                    <Badge variant="outline">{slot.pilatesLevel}</Badge>
                    {slot.equipment.map((eq) => (
                      <Badge key={eq} variant="secondary">
                        {eq}
                      </Badge>
                    ))}
                  </div>

                  {slot.dateFrom && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date range</p>
                      <p className="text-sm font-medium">
                        {new Date(slot.dateFrom).toLocaleDateString()}
                        {slot.dateTo && ` - ${new Date(slot.dateTo).toLocaleDateString()}`}
                      </p>
                    </div>
                  )}

                  {slot.repeatDays.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Days</p>
                      <p className="text-sm font-medium">{slot.repeatDays.join(", ")}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time</p>
                    <p className="text-sm font-medium">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>

                  {slot.location && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Location</p>
                      <p className="text-sm font-medium">{slot.location}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rate</p>
                    <p className="text-sm font-medium">
                      ${slot.rateMin} {slot.rateUnit.replace("_", " ")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
