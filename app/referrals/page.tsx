"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Copy, Gift, Users, DollarSign, CheckCircle } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ReferralsPage() {
  const { toast } = useToast()
  const [referralCode, setReferralCode] = useState("")
  const [referralLink, setReferralLink] = useState("")
  const [stats, setStats] = useState({ pending: 0, completed: 0, earnings: 0 })
  const [referrals, setReferrals] = useState<any[]>([])

  useEffect(() => {
    async function loadReferralData() {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get user's referral code
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code, referral_earnings")
        .eq("id", user.id)
        .single()

      if (profile) {
        setReferralCode(profile.referral_code)
        setReferralLink(`${window.location.origin}/auth/sign-up?ref=${profile.referral_code}`)
        setStats((prev) => ({ ...prev, earnings: profile.referral_earnings || 0 }))
      }

      // Get referral stats
      const { data: referralData } = await supabase.from("referrals").select("*").eq("referrer_id", user.id)

      if (referralData) {
        setReferrals(referralData)
        setStats({
          pending: referralData.filter((r) => r.status === "pending").length,
          completed: referralData.filter((r) => r.status === "completed" || r.status === "rewarded").length,
          earnings: profile?.referral_earnings || 0,
        })
      }
    }
    loadReferralData()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
            <p className="text-muted-foreground">
              Earn rewards by referring studios and instructors to Pilates Connect
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Referrals</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Referrals</p>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">${stats.earnings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Your Referral Link
              </CardTitle>
              <CardDescription>Share this link to earn $50 for each successful referral</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="font-mono text-sm" />
                <Button onClick={() => copyToClipboard(referralLink)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Share your unique referral link with studios or instructors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>They sign up and subscribe to a paid plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>You earn $50 credit after their first month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Your referral gets 10% off their first 3 months</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Referral History */}
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
              <CardDescription>Track your referrals and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length > 0 ? (
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{referral.referred_email || "Pending signup"}</p>
                        <p className="text-sm text-muted-foreground">
                          Referred {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          referral.status === "completed" || referral.status === "rewarded" ? "default" : "secondary"
                        }
                      >
                        {referral.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No referrals yet. Start sharing your link!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
