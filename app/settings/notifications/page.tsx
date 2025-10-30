"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@/lib/supabase/client"
import { Bell, Mail, MessageSquare } from "lucide-react"

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    email_job_applications: true,
    email_cover_requests: true,
    email_messages: true,
    email_job_matches: true,
    email_referrals: true,
    email_marketing: false,
    push_job_applications: true,
    push_cover_requests: true,
    push_messages: true,
    sms_urgent_covers: false,
  })

  useEffect(() => {
    async function loadSettings() {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Load notification preferences from database
      const { data } = await supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle()

      if (data) {
        setSettings(data)
      }

      setLoading(false)
    }

    loadSettings()
  }, [router])

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      alert("Notification settings saved!")
    } catch (error: any) {
      console.error("[v0] Save settings error:", error)
      alert("Failed to save settings: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-12 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
            <p className="text-muted-foreground">Manage how and when you receive notifications</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Email Notifications</CardTitle>
                </div>
                <CardDescription>Receive updates via email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_job_applications">Job Applications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone applies to your jobs</p>
                  </div>
                  <Switch
                    id="email_job_applications"
                    checked={settings.email_job_applications}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_job_applications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_cover_requests">Cover Requests</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new cover opportunities</p>
                  </div>
                  <Switch
                    id="email_cover_requests"
                    checked={settings.email_cover_requests}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_cover_requests: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_messages">Messages</Label>
                    <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
                  </div>
                  <Switch
                    id="email_messages"
                    checked={settings.email_messages}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_messages: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_job_matches">Job Matches</Label>
                    <p className="text-sm text-muted-foreground">Get notified about jobs that match your profile</p>
                  </div>
                  <Switch
                    id="email_job_matches"
                    checked={settings.email_job_matches}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_job_matches: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_referrals">Referral Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about your referral earnings</p>
                  </div>
                  <Switch
                    id="email_referrals"
                    checked={settings.email_referrals}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_referrals: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_marketing">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive tips, updates, and special offers</p>
                  </div>
                  <Switch
                    id="email_marketing"
                    checked={settings.email_marketing}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_marketing: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Push Notifications</CardTitle>
                </div>
                <CardDescription>Receive instant notifications in your browser</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push_job_applications">Job Applications</Label>
                    <p className="text-sm text-muted-foreground">Instant alerts for new applications</p>
                  </div>
                  <Switch
                    id="push_job_applications"
                    checked={settings.push_job_applications}
                    onCheckedChange={(checked) => setSettings({ ...settings, push_job_applications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push_cover_requests">Cover Requests</Label>
                    <p className="text-sm text-muted-foreground">Instant alerts for urgent cover needs</p>
                  </div>
                  <Switch
                    id="push_cover_requests"
                    checked={settings.push_cover_requests}
                    onCheckedChange={(checked) => setSettings({ ...settings, push_cover_requests: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push_messages">Messages</Label>
                    <p className="text-sm text-muted-foreground">Instant alerts for new messages</p>
                  </div>
                  <Switch
                    id="push_messages"
                    checked={settings.push_messages}
                    onCheckedChange={(checked) => setSettings({ ...settings, push_messages: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle>SMS Notifications</CardTitle>
                </div>
                <CardDescription>Receive text messages for urgent updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms_urgent_covers">Urgent Cover Requests</Label>
                    <p className="text-sm text-muted-foreground">Get SMS for last-minute cover opportunities</p>
                  </div>
                  <Switch
                    id="sms_urgent_covers"
                    checked={settings.sms_urgent_covers}
                    onCheckedChange={(checked) => setSettings({ ...settings, sms_urgent_covers: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Saving..." : "Save Settings"}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
