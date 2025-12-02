"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, DollarSign, CheckCircle } from "lucide-react"

type Booking = {
  id: string
  title: string
  description: string
  booking_date: string
  start_time: string
  end_time: string
  location: string
  instructor_rate: number
  hours_worked: number
  total_amount: number
  status: "scheduled" | "completed" | "billed" | "paid" | "cancelled"
  completed_at: string | null
  instructor: {
    display_name: string
    avatar_url: string | null
  }
}

export default function StudioBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          instructor:instructor_id (
            display_name,
            avatar_url
          )
        `,
        )
        .eq("studio_id", user.id)
        .order("booking_date", { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error("[v0] Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function markCompleted(bookingId: string) {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", bookingId)

      if (error) throw error
      fetchBookings()
    } catch (error) {
      console.error("[v0] Error marking booking as completed:", error)
      alert("Failed to mark booking as completed")
    }
  }

  const scheduledBookings = bookings.filter((b) => b.status === "scheduled")
  const completedBookings = bookings.filter((b) => ["completed", "billed", "paid"].includes(b.status))
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bookings</h1>
          <p className="text-muted-foreground">Manage your instructor bookings and mark classes as completed</p>
        </div>

        <Tabs defaultValue="scheduled" className="space-y-6">
          <TabsList>
            <TabsTrigger value="scheduled">Scheduled ({scheduledBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading bookings...</p>
            ) : scheduledBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No scheduled bookings</p>
                </CardContent>
              </Card>
            ) : (
              scheduledBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{booking.title}</CardTitle>
                        <CardDescription>with {booking.instructor.display_name}</CardDescription>
                      </div>
                      <Badge>Scheduled</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {booking.start_time} - {booking.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>
                          ${booking.instructor_rate}/hr × {booking.hours_worked}hrs = ${booking.total_amount}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => markCompleted(booking.id)} className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Mark as Completed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No completed bookings</p>
                </CardContent>
              </Card>
            ) : (
              completedBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{booking.title}</CardTitle>
                        <CardDescription>with {booking.instructor.display_name}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {booking.status === "paid" ? "Paid" : booking.status === "billed" ? "Billed" : "Completed"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${booking.total_amount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No cancelled bookings</p>
                </CardContent>
              </Card>
            ) : (
              cancelledBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{booking.title}</CardTitle>
                        <CardDescription>with {booking.instructor.display_name}</CardDescription>
                      </div>
                      <Badge variant="destructive">Cancelled</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
