"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"

export default function StripeSuccessPage() {
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    verifyAccount()
  }, [])

  async function verifyAccount() {
    try {
      // Call API to refresh account status from Stripe
      const response = await fetch("/api/stripe/refresh-account-status", {
        method: "POST",
      })

      if (response.ok) {
        // Wait a moment then redirect to dashboard
        setTimeout(() => {
          router.push("/instructor/dashboard")
        }, 3000)
      }
    } catch (error) {
      console.error("Error verifying account:", error)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {checking ? (
              <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
            ) : (
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            )}
          </div>
          <CardTitle>{checking ? "Verifying Your Account..." : "All Set!"}</CardTitle>
          <CardDescription>
            {checking
              ? "Please wait while we verify your Stripe account setup"
              : "Your Stripe account has been successfully connected"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {!checking && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You can now receive payments from studio bookings. You'll be redirected to your dashboard shortly.
              </p>
              <Button onClick={() => router.push("/instructor/dashboard")}>Go to Dashboard Now</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
