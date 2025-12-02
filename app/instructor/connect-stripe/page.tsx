"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, AlertCircle, DollarSign, TrendingUp, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ConnectStripePage() {
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("instructor_profiles")
        .select("stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled, stripe_payouts_enabled")
        .eq("id", user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function createConnectAccount() {
    setCreating(true)
    setError("")

    try {
      const response = await fetch("/api/stripe/create-connect-account", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      // Redirect to Stripe onboarding
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setCreating(false)
    }
  }

  async function continueOnboarding() {
    setCreating(true)
    setError("")

    try {
      const response = await fetch("/api/stripe/create-account-link", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create onboarding link")
      }

      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Account fully set up
  if (profile?.stripe_onboarding_complete && profile?.stripe_charges_enabled && profile?.stripe_payouts_enabled) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <CardTitle>Stripe Account Connected</CardTitle>
            </div>
            <CardDescription>Your Stripe account is fully set up and ready to receive payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Payment Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Enabled</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Payouts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Enabled</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" />
                    <span>Payout Schedule</span>
                  </div>
                  <span className="font-medium">2-7 business days</span>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertDescription>
                Studios can now book your availability slots. You'll receive payments automatically after each completed
                class, minus a 10% platform fee.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button onClick={() => router.push("/instructor/dashboard")}>Go to Dashboard</Button>
              <Button variant="outline" onClick={() => router.push("/instructor/earnings")}>
                View Earnings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Onboarding incomplete
  if (profile?.stripe_account_id) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <CardTitle>Complete Stripe Onboarding</CardTitle>
            </div>
            <CardDescription>Finish setting up your Stripe account to start receiving payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription>
                You started the onboarding process but haven't completed it yet. Continue where you left off to start
                accepting payments.
              </AlertDescription>
            </Alert>

            <Button onClick={continueOnboarding} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No Stripe account yet
  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Stripe Account</CardTitle>
          <CardDescription>Set up payments to receive earnings from your bookings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">How it works:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>Studios book your availability and pay through Pilates Connect</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>Platform automatically takes a 10% service fee</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>You receive the remaining 90% in your bank account within 2-7 business days</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>Stripe handles all tax reporting (1099s, etc.)</span>
              </li>
            </ul>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Quick setup:</strong> The onboarding process takes about 5 minutes. You'll need your bank account
              details and tax information.
            </AlertDescription>
          </Alert>

          <Button onClick={createConnectAccount} disabled={creating} size="lg">
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect with Stripe
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
