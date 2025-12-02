"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Receipt, DollarSign, Calendar } from "lucide-react"

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingPayments: 0,
    completedBookings: 0,
  })

  useEffect(() => {
    loadTransactions()
  }, [])

  async function loadTransactions() {
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: paymentsData, error } = await supabase
        .from("payments")
        .select(`
          *,
          instructor:instructor_id (
            display_name,
            email
          )
        `)
        .eq("studio_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setPayments(paymentsData || [])

      const total = paymentsData?.reduce((sum, p) => sum + (p.amount_total || 0), 0) || 0
      const pending =
        paymentsData?.filter((p) => p.status === "pending").reduce((sum, p) => sum + (p.amount_total || 0), 0) || 0
      const completed = paymentsData?.filter((p) => p.status === "succeeded").length || 0

      setStats({
        totalSpent: total / 100,
        pendingPayments: pending / 100,
        completedBookings: completed,
      })
    } catch (error) {
      console.error("Error loading transactions:", error)
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

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">View all your booking payments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-3xl font-bold">${stats.totalSpent.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-600" />
              <span className="text-3xl font-bold">${stats.pendingPayments.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-3xl font-bold">{stats.completedBookings}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Complete payment history with receipts</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet. Book an instructor to see payments here.
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{payment.instructor?.display_name || "Instructor"}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>
                        {new Date(payment.booking_date || payment.created_at).toLocaleDateString("en-AU", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="capitalize">{payment.booking_type}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-lg">${(payment.amount_total / 100).toFixed(2)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === "succeeded"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : payment.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
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
