"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowLeft, Plus, X, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type AvailabilitySlot = {
  id: string
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

export default function PostAvailabilityPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([
    {
      id: "1",
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
    },
  ])

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const equipment = ["Reformer", "Cadillac", "Chair", "Tower", "Mat", "Barrel"]

  const addSlot = () => {
    setSlots([
      ...slots,
      {
        id: Date.now().toString(),
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
      },
    ])
  }

  const removeSlot = (id: string) => {
    setSlots(slots.filter((slot) => slot.id !== id))
  }

  const updateSlot = (id: string, field: keyof AvailabilitySlot, value: any) => {
    setSlots(slots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot)))
  }

  const toggleDay = (slotId: string, day: string) => {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return

    const newDays = slot.repeatDays.includes(day) ? slot.repeatDays.filter((d) => d !== day) : [...slot.repeatDays, day]

    updateSlot(slotId, "repeatDays", newDays)
  }

  const toggleEquipment = (slotId: string, item: string) => {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return

    const newEquipment = slot.equipment.includes(item)
      ? slot.equipment.filter((e) => e !== item)
      : [...slot.equipment, item]

    updateSlot(slotId, "equipment", newEquipment)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Starting availability post submission...")

      const supabase = createClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      console.log("[v0] Session:", session?.user?.id)

      if (!session?.user) {
        throw new Error("Not authenticated. Please sign in to post availability.")
      }

      const { data: instructorProfile, error: profileError } = await supabase
        .from("instructor_profiles")
        .select("id")
        .eq("id", session.user.id)
        .single()

      console.log("[v0] Instructor profile:", instructorProfile, profileError)

      if (profileError || !instructorProfile) {
        throw new Error("Instructor profile not found. Please complete your profile first.")
      }

      const generatedSlots = []

      for (const slot of slots) {
        if (!slot.dateFrom || !slot.startTime || !slot.endTime) continue

        const startDate = new Date(slot.dateFrom)
        const endDate = slot.dateTo ? new Date(slot.dateTo) : startDate

        // If no repeat days selected, create single slot for start date
        if (slot.repeatDays.length === 0) {
          const startDateTime = `${slot.dateFrom}T${slot.startTime}:00`
          const endDateTime = `${slot.dateFrom}T${slot.endTime}:00`

          generatedSlots.push({
            instructor_id: session.user.id,
            start_time: startDateTime,
            end_time: endDateTime,
            is_available: true,
            notes: JSON.stringify({
              availability_type: slot.availabilityType,
              pilates_level: slot.pilatesLevel,
              equipment: slot.equipment,
              rate_min: slot.rateMin,
              rate_unit: slot.rateUnit,
              location: slot.location,
            }),
          })
        } else {
          // Generate slots for each selected day within the date range
          const dayMap: Record<string, number> = {
            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,
          }

          const currentDate = new Date(startDate)
          while (currentDate <= endDate) {
            const dayName = Object.keys(dayMap).find((key) => dayMap[key] === currentDate.getDay())

            if (dayName && slot.repeatDays.includes(dayName)) {
              const dateStr = currentDate.toISOString().split("T")[0]
              const startDateTime = `${dateStr}T${slot.startTime}:00`
              const endDateTime = `${dateStr}T${slot.endTime}:00`

              generatedSlots.push({
                instructor_id: session.user.id,
                start_time: startDateTime,
                end_time: endDateTime,
                is_available: true,
                notes: JSON.stringify({
                  availability_type: slot.availabilityType,
                  pilates_level: slot.pilatesLevel,
                  equipment: slot.equipment,
                  rate_min: slot.rateMin,
                  rate_unit: slot.rateUnit,
                  location: slot.location,
                }),
              })
            }

            currentDate.setDate(currentDate.getDate() + 1)
          }
        }
      }

      console.log("[v0] Generated slots count:", generatedSlots.length)
      console.log("[v0] First slot sample:", generatedSlots[0])

      if (generatedSlots.length === 0) {
        throw new Error("No valid availability slots to post")
      }

      const { data, error } = await supabase.from("availability_slots").insert(generatedSlots).select()

      if (error) {
        console.error("[v0] Database error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("[v0] Insert successful, inserted count:", data?.length)

      toast({
        title: "Availability posted!",
        description: `${generatedSlots.length} availability slot(s) have been posted successfully.`,
      })

      router.push("/instructor/dashboard")
    } catch (error) {
      console.error("[v0] Error posting availability:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post availability",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotalSlots = () => {
    let total = 0
    for (const slot of slots) {
      if (!slot.dateFrom) continue

      if (slot.repeatDays.length === 0) {
        total += 1
      } else {
        const startDate = new Date(slot.dateFrom)
        const endDate = slot.dateTo ? new Date(slot.dateTo) : startDate

        const dayMap: Record<string, number> = {
          Sun: 0,
          Mon: 1,
          Tue: 2,
          Wed: 3,
          Thu: 4,
          Fri: 5,
          Sat: 6,
        }

        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          const dayName = Object.keys(dayMap).find((key) => dayMap[key] === currentDate.getDay())
          if (dayName && slot.repeatDays.includes(dayName)) {
            total += 1
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }
      }
    }
    return total
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
            <h1 className="text-3xl font-bold mb-2">Post Availability</h1>
            <p className="text-muted-foreground">
              Create one-off or recurring availability slots. Add multiple blocks to save time.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {slots.map((slot, index) => (
                <Card key={slot.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Availability Slot {index + 1}</CardTitle>
                      {slots.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeSlot(slot.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Date Range */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date range - From *</Label>
                        <Input
                          type="date"
                          value={slot.dateFrom}
                          onChange={(e) => updateSlot(slot.id, "dateFrom", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date range - To</Label>
                        <Input
                          type="date"
                          value={slot.dateTo}
                          onChange={(e) => updateSlot(slot.id, "dateTo", e.target.value)}
                        />
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
                            onClick={() => toggleDay(slot.id, day)}
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
                          onChange={(e) => updateSlot(slot.id, "startTime", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End time *</Label>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(slot.id, "endTime", e.target.value)}
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
                          onValueChange={(value) => updateSlot(slot.id, "availabilityType", value)}
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
                          onChange={(e) => updateSlot(slot.id, "rateMin", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rate unit *</Label>
                        <Select value={slot.rateUnit} onValueChange={(value) => updateSlot(slot.id, "rateUnit", value)}>
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
                        onChange={(e) => updateSlot(slot.id, "location", e.target.value)}
                        required
                      />
                    </div>

                    {/* Pilates Level */}
                    <div className="space-y-2">
                      <Label>Pilates Level *</Label>
                      <Select
                        value={slot.pilatesLevel}
                        onValueChange={(value) => updateSlot(slot.id, "pilatesLevel", value)}
                      >
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
                            onClick={() => toggleEquipment(slot.id, item)}
                          >
                            {item}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" onClick={addSlot} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Slot
              </Button>

              <div className="flex gap-3">
                <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {isLoading ? "Posting..." : `Post ${slots.length} Slot${slots.length > 1 ? "s" : ""}`}
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
                  {slots.map((slot, index) => (
                    <div key={slot.id} className="pb-4 border-b last:border-b-0 last:pb-0">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Slot {index + 1}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge>{slot.availabilityType}</Badge>
                        <Badge variant="outline">{slot.pilatesLevel}</Badge>
                        {slot.equipment.map((eq) => (
                          <Badge key={eq} variant="secondary">
                            {eq}
                          </Badge>
                        ))}
                      </div>

                      {slot.dateFrom && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground">Date range</p>
                          <p className="text-sm font-medium">
                            {new Date(slot.dateFrom).toLocaleDateString()}
                            {slot.dateTo && ` - ${new Date(slot.dateTo).toLocaleDateString()}`}
                          </p>
                        </div>
                      )}

                      {slot.repeatDays.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground">Days</p>
                          <p className="text-sm font-medium">{slot.repeatDays.join(", ")}</p>
                        </div>
                      )}

                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm font-medium">
                          {slot.startTime} - {slot.endTime}
                        </p>
                      </div>

                      {slot.location && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm font-medium">{slot.location}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-muted-foreground">Rate</p>
                        <p className="text-sm font-medium">
                          ${slot.rateMin} {slot.rateUnit.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Total generated slots</p>
                    <p className="text-3xl font-bold text-primary">{calculateTotalSlots()}</p>
                    <p className="text-xs text-muted-foreground mt-2">Based on your date ranges and repeat days</p>
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
