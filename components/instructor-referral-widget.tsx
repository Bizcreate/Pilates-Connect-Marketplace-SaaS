"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, Gift, Users, DollarSign, CheckCircle, ExternalLink } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function InstructorReferralWidget() {
  const { toast } = useToast()
  const [referralCode, setReferralCode] = useState("DEMO2025")
  const [referralLink, setReferralLink] = useState("")
  const [stats, setStats] = useState({ pending: 0, completed: 0, earnings: 0 })
  const [referrals, setReferrals] = useState<any[]>([])

  useEffect(() => {
    setReferralLink(`${window.location.origin}/auth/sign-up?ref=${referralCode}`)

    async function loadReferralData() {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("referral_code, referral_earnings")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("[v0] InstructorReferralWidget: Error fetching profile:", profileError)
        // Don't break - use default values
        return
      }

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code)
        setReferralLink(`${window.location.origin}/auth/sign-up?ref=${profile.referral_code}`)
        setStats((prev) => ({ ...prev, earnings: profile.referral_earnings || 0 }))
      }

      const { data: referralData, error: referralError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)

      if (referralError) {
        console.error("[v0] InstructorReferralWidget: Error fetching referrals:", referralError)
        return
      }

      if (referralData && referralData.length > 0) {
        setReferrals(referralData.slice(0, 3))
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Instructor Referral Program
            </CardTitle>
            <CardDescription>Earn $50 for each instructor you refer who completes their first job</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/referrals">
              Learn More
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <Users className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <DollarSign className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold">${stats.earnings}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Referral Link</label>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-xs" />
            <Button onClick={() => copyToClipboard(referralLink)} size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link with other Pilates instructors. You'll earn $50 when they complete their first job!
          </p>
        </div>

        {/* Recent Referrals */}
        {referrals.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recent Referrals</label>
            <div className="space-y-2">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-2 border rounded-lg text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{referral.referred_name || "New Instructor"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={referral.status === "completed" ? "default" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {referral.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
