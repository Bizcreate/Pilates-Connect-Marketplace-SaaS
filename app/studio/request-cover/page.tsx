"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowLeft, Send } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function RequestCoverPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [repeatDays, setRepeatDays] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const equipment = ["Reformer", "Cadillac", "Chair", "Tower", "Mat", "Barrel"]
  const certifications = ["Mat", "Reformer", "Comprehensive", "Pre/Postnatal"]

  const toggleDay = (day: string) => {
    setRepeatDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  const toggleCertification = (item: string) => {
    setSelectedCertifications((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createBrowserClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const coverData = {
        studio_id: user.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        date_from: formData.get("date-from") as string,
        date_to: (formData.get("date-to") as string) || null,
        repeat_days: repeatDays,
        start_time: formData.get("start-time") as string,
        end_time: formData.get("end-time") as string,
        location: formData.get("location") as string,
        pilates_level: formData.get("pilates-level") as string,
        equipment: selectedEquipment,
        certifications_required: selectedCertifications,
        compensation_min: Number.parseInt(formData.get("rate-min") as string) || null,
        compensation_max: Number.parseInt(formData.get("rate-max") as string) || null,
        compensation_type: formData.get("rate-type") as string,
        status: "open",
      }

      const { error } = await supabase.from("cover_requests").insert(coverData)

      if (error) throw error

      toast({
        title: "Cover request posted!",
        description: "Instructors will be notified of your cover request.",
      })

      router.push("/studio/dashboard")
    } catch (error) {
      console.error("[v0] Error posting cover request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post cover request",
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
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/studio/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Request Class Cover</h1>
            <p className="text-muted-foreground">Post a cover request for one-off or recurring classes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cover Details</CardTitle>
                <CardDescription>Provide information about the classes you need covered</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" placeholder="e.g., Reformer Class Cover - Morning" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Additional details about the class, studio, or requirements..."
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-from">Date from *</Label>
                    <Input id="date-from" name="date-from" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-to">Date to</Label>
                    <Input id="date-to" name="date-to" type="date" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Repeat on</Label>
                  <div className="flex gap-2">
                    {weekDays.map((day) => (
                      <Button
                        key={day}
                        type="button"
                        variant={repeatDays.includes(day) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDay(day)}
                        className="flex-1"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start time *</Label>
                    <Input id="start-time" name="start-time" type="time" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End time *</Label>
                    <Input id="end-time" name="end-time" type="time" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" name="location" placeholder="e.g., Bondi, NSW" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pilates-level">Pilates Level *</Label>
                  <Select name="pilates-level" required>
                    <SelectTrigger id="pilates-level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mat-beginner">Mat — Beginner</SelectItem>
                      <SelectItem value="mat-intermediate">Mat — Intermediate</SelectItem>
                      <SelectItem value="reformer-beginner">Reformer — Beginner</SelectItem>
                      <SelectItem value="reformer-intermediate">Reformer — Intermediate</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Equipment Required *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {equipment.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`equipment-${item}`}
                          checked={selectedEquipment.includes(item)}
                          onCheckedChange={() => toggleEquipment(item)}
                        />
                        <Label htmlFor={`equipment-${item}`} className="font-normal cursor-pointer text-sm">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Certifications Required</Label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {certifications.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cert-${item}`}
                          checked={selectedCertifications.includes(item)}
                          onCheckedChange={() => toggleCertification(item)}
                        />
                        <Label htmlFor={`cert-${item}`} className="font-normal cursor-pointer text-sm">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Rate Type *</Label>
                  <Select name="rate-type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rate type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_class">Per Class</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate-min">Minimum Rate ($) *</Label>
                    <Input id="rate-min" name="rate-min" type="number" placeholder="60" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate-max">Maximum Rate ($)</Label>
                    <Input id="rate-max" name="rate-max" type="number" placeholder="100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isLoading}>
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Posting..." : "Post Cover Request"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
