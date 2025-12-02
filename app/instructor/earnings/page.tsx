"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign, TrendingUp, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function EarningsPage() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    completedBookings: 0,
  })
  const [stripeConnected, setStripeConnected] = useState(false)

  useEffect(() => {
    loadEarnings()
  }, [])

  async function loadEarnings() {
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Check Stripe connection
      const { data: profile } = await supabase
        .from("instructor_profiles")
        .select("stripe_charges_enabled")
        .eq("id", user.id)
        .single()

      setStripeConnected(profile?.stripe_charges_enabled || false)

      // Load payments
      const { data: paymentsData, error } = await supabase
        .from("payments")
        .select(`
          *,
          studio:studio_id (
            display_name,
            email
          )
        `)
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setPayments(paymentsData || [])

      // Calculate stats
      const total = paymentsData?.reduce((sum, p) => sum + (p.instructor_amount || 0), 0) || 0
      const pending =
        paymentsData?.filter((p) => p.status === "pending").reduce((sum, p) => sum + (p.instructor_amount || 0), 0) || 0
      const completed = paymentsData?.filter((p) => p.status === "succeeded").length || 0

      setStats({
        totalEarnings: total / 100,
        pendingEarnings: pending / 100,
        completedBookings: completed,
      })
    } catch (error) {
      console.error("Error loading earnings:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!stripeConnected) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Dashboard</CardTitle>
            <CardDescription>Connect your Stripe account to start receiving payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/instructor/connect-stripe">Connect Stripe Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">Track your payments and bookings</p>
        </div>
        <Button variant="outline" asChild>
          <a href="https://dashboard.stripe.com/express/dashboard" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Stripe Dashboard
          </a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">After 5% platform fee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <span className="text-3xl font-bold">${stats.pendingEarnings.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-3xl font-bold">{stats.completedBookings}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Successful classes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your payment history and booking details</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet. Start accepting bookings to see your earnings here.
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{payment.studio?.display_name || "Studio"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.booking_date || payment.created_at).toLocaleDateString("en-AU", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${(payment.instructor_amount / 100).toFixed(2)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === "succeeded"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
