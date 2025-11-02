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
      console.log("[v0] Starting cover request submission...")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("[v0] User:", user?.id)

      if (!user) throw new Error("Not authenticated")

      const coverData = {
        studio_id: user.id,
        date: formData.get("date-from") as string, // Single date field
        start_time: formData.get("start-time") as string,
        end_time: formData.get("end-time") as string,
        class_type: formData.get("pilates-level") as string,
        notes: formData.get("description") as string,
        status: "open",
      }

      console.log("[v0] Cover request data:", coverData)

      const { data, error } = await supabase.from("cover_requests").insert(coverData).select()

      console.log("[v0] Insert result:", { data, error })

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
                  <Label htmlFor="date-from">Date *</Label>
                  <Input id="date-from" name="date-from" type="date" required />
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
                  <Label htmlFor="pilates-level">Class Type *</Label>
                  <Select name="pilates-level" required>
                    <SelectTrigger id="pilates-level">
                      <SelectValue placeholder="Select class type" />
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

                <div className="space-y-2">
                  <Label htmlFor="description">Notes</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Additional details about the class, studio, or requirements..."
                    rows={4}
                  />
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
