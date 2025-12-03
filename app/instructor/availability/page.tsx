"use client"

import { useState, useEffect } from "react"
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

export default function AvailabilityPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
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

  useEffect(() => {
    const checkAuth = async () => {
      console.log("[v0] Availability Page: Checking authentication on load...")
      const supabase = createClient()

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      console.log("[v0] Availability Page: Session check result:", {
        hasSession: !!session,
        userId: session?.user?.id,
        error: error?.message,
      })

      if (!session?.user) {
        console.log("[v0] Availability Page: No session found, redirecting to login...")
        toast({
          title: "Authentication Required",
          description: "Please sign in to post availability",
          variant: "destructive",
        })
        router.push("/auth/sign-in?redirect=/instructor/availability")
        return
      }

      setUserId(session.user.id)
      setIsCheckingAuth(false)
      console.log("[v0] Availability Page: User authenticated:", session.user.id)
    }

    checkAuth()
  }, [])

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
    console.log("[v0] Availability Submit: Button clicked, starting submission...")

    if (!userId) {
      console.log("[v0] Availability Submit: No userId available")
      toast({
        title: "Authentication Error",
        description: "Please refresh the page and try again",
        variant: "destructive",
      })
      return
    }

    const hasInvalidSlot = slots.some(
      (slot) =>
        !slot.dateFrom ||
        !slot.dateTo ||
        !slot.location ||
        !slot.rateMin ||
        slot.repeatDays.length === 0 ||
        slot.equipment.length === 0,
    )

    if (hasInvalidSlot) {
      console.log("[v0] Availability Submit: Validation failed - missing required fields")
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields for each slot",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("[v0] Availability Submit: Starting database insertion...")
      const supabase = createClient()

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, user_type")
        .eq("user_id", userId)
        .single()

      console.log("[v0] Availability Submit: Profile lookup result:", {
        hasProfile: !!profile,
        profileId: profile?.id,
        userType: profile?.user_type,
        error: profileError?.message,
      })

      if (profileError || !profile) {
        throw new Error(`Profile not found: ${profileError?.message}`)
      }

      if (profile.user_type !== "instructor") {
        throw new Error("Only instructors can post availability")
      }

      const instructorProfileId = profile.id

      console.log("[v0] Availability Submit: Generating slots for database...")
      const allSlots: any[] = []

      slots.forEach((slot, slotIndex) => {
        console.log(`[v0] Availability Submit: Processing slot ${slotIndex + 1}/${slots.length}`)

        const start = new Date(slot.dateFrom)
        const end = new Date(slot.dateTo)
        const dayMap: { [key: string]: number } = {
          Mon: 1,
          Tue: 2,
          Wed: 3,
          Thu: 4,
          Fri: 5,
          Sat: 6,
          Sun: 0,
        }

        const current = new Date(start)
        let slotCount = 0

        while (current <= end) {
          const dayOfWeek = current.getDay()
          const dayName = Object.keys(dayMap).find((key) => dayMap[key] === dayOfWeek)

          if (dayName && slot.repeatDays.includes(dayName)) {
            const dateStr = current.toISOString().split("T")[0]

            allSlots.push({
              instructor_profile_id: instructorProfileId,
              date: dateStr,
              start_time: slot.startTime,
              end_time: slot.endTime,
              availability_type: slot.availabilityType,
              pilates_level: slot.pilatesLevel,
              equipment_available: slot.equipment,
              rate_min: Number.parseFloat(slot.rateMin),
              rate_unit: slot.rateUnit,
              location: slot.location,
              is_available: true,
              created_at: new Date().toISOString(),
            })

            slotCount++
          }

          current.setDate(current.getDate() + 1)
        }

        console.log(`[v0] Availability Submit: Generated ${slotCount} slots for slot ${slotIndex + 1}`)
      })

      console.log(`[v0] Availability Submit: Total slots to insert: ${allSlots.length}`)

      if (allSlots.length === 0) {
        throw new Error("No slots generated. Please check your date range and selected days.")
      }

      const { data, error: insertError } = await supabase.from("availability_slots").insert(allSlots).select()

      console.log("[v0] Availability Submit: Database insertion result:", {
        success: !!data,
        insertedCount: data?.length,
        error: insertError?.message,
        errorDetails: insertError,
      })

      if (insertError) {
        throw insertError
      }

      console.log("[v0] Availability Submit: Successfully inserted slots:", data?.length)

      toast({
        title: "Availability Posted",
        description: `Successfully created ${allSlots.length} availability slots`,
      })

      router.push("/instructor/dashboard")
    } catch (error: any) {
      console.error("[v0] Availability Submit: Error occurred:", {
        message: error.message,
        details: error,
      })

      toast({
        title: "Error Posting Availability",
        description: error.message || "Failed to post availability. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      console.log("[v0] Availability Submit: Submission complete")
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

  if (isCheckingAuth) {
    return (
      <>
        <SiteHeader />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <SiteFooter />
      </>
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
            <h1 className="text-3xl font-bold mb-2">Manage Availability</h1>
            <p className="text-muted-foreground">Set your weekly availability to help studios find you</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
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

                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <Input
                        placeholder="e.g., Melbourne CBD, VIC"
                        value={slot.location}
                        onChange={(e) => updateSlot(slot.id, "location", e.target.value)}
                        required
                      />
                    </div>

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
                            {new Date(slot.dateFrom).toLocaleDateString("en-AU", {
                              month: "short",
                              day: "numeric",
                            })}
                            {slot.dateTo &&
                              ` - ${new Date(slot.dateTo).toLocaleDateString("en-AU", {
                                month: "short",
                                day: "numeric",
                              })}`}
                          </p>
                        </div>
                      )}

                      {slot.repeatDays.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground">Days</p>
                          <p className="text-sm">{slot.repeatDays.join(", ")}</p>
                        </div>
                      )}

                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm">
                          {slot.startTime} - {slot.endTime}
                        </p>
                      </div>

                      {slot.location && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm">{slot.location}</p>
                        </div>
                      )}

                      {slot.rateMin && (
                        <div>
                          <p className="text-xs text-muted-foreground">Rate</p>
                          <p className="text-sm font-semibold">
                            ${slot.rateMin} {slot.rateUnit.replace("_", " ")}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total slots to create:</span>
                      <span className="text-lg font-bold">{calculateTotalSlots()}</span>
                    </div>
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
