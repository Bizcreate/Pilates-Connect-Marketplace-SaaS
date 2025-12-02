"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, CreditCard } from "lucide-react"

type Invoice = {
  id: string
  period_start: string
  period_end: string
  subscription_fee: number
  total_bookings_amount: number
  platform_fee: number
  total_due: number
  platform_fee_rate: number
  status: string
  due_date: string
  paid_at: string | null
}

export default function StudioInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("studio_invoices")
        .select("*")
        .eq("studio_id", user.id)
        .order("period_start", { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error("[v0] Error fetching invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "paid":
        return "default"
      case "sent":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Invoices</h1>
          <p className="text-muted-foreground">View and manage your monthly billing statements</p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invoices yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your first invoice will be generated at the end of your billing period
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {new Date(invoice.period_start).toLocaleDateString()} -{" "}
                        {new Date(invoice.period_end).toLocaleDateString()}
                      </CardTitle>
                      <CardDescription>Due: {new Date(invoice.due_date).toLocaleDateString()}</CardDescription>
                    </div>
                    <Badge variant={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subscription Fee</span>
                      <span>${invoice.subscription_fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Instructor Bookings</span>
                      <span>${invoice.total_bookings_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee ({invoice.platform_fee_rate}%)</span>
                      <span>${invoice.platform_fee.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Due</span>
                      <span>${invoice.total_due.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {invoice.status !== "paid" && (
                      <Button className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Pay Now
                      </Button>
                    )}
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
