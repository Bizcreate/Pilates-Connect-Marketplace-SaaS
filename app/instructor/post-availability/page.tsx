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
import { createBrowserClient } from "@/lib/supabase/client"
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
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const availabilityData = slots.map((slot) => ({
        instructor_id: user.id,
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
        status: "available",
      }))

      const { error } = await supabase.from("availability_slots").insert(availabilityData)

      if (error) throw error

      toast({
        title: "Availability posted!",
        description: `${slots.length} availability slot(s) have been posted successfully.`,
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
                  {slots[0] && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{slots[0].availabilityType}</Badge>
                        <Badge variant="outline">{slots[0].pilatesLevel}</Badge>
                        {slots[0].equipment.map((eq) => (
                          <Badge key={eq} variant="secondary">
                            {eq}
                          </Badge>
                        ))}
                      </div>

                      {slots[0].dateFrom && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Date range</p>
                          <p className="text-sm font-medium">
                            {new Date(slots[0].dateFrom).toLocaleDateString()}
                            {slots[0].dateTo && ` - ${new Date(slots[0].dateTo).toLocaleDateString()}`}
                          </p>
                        </div>
                      )}

                      {slots[0].repeatDays.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Days</p>
                          <p className="text-sm font-medium">{slots[0].repeatDays.join(", ")}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Time</p>
                        <p className="text-sm font-medium">
                          {slots[0].startTime} - {slots[0].endTime}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total slots</p>
                        <p className="text-2xl font-bold text-primary">{slots.length}</p>
                      </div>

                      <p className="text-xs text-muted-foreground">Your generated slots will appear here.</p>
                    </>
                  )}
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
