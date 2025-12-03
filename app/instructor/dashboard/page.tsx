"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ReferralWidget } from "@/components/referral-widget"
import { CoverRequestDialog } from "@/components/cover-request-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  CalendarDays,
  MessageSquare,
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { acceptCoverRequest } from "@/app/actions/dashboard"

export default function InstructorDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [availableJobs, setAvailableJobs] = useState<any[]>([])
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([])
  const [coverRequests, setCoverRequests] = useState<any[]>([])
  const [selectedCoverRequest, setSelectedCoverRequest] = useState<any>(null)
  const [coverDialogOpen, setCoverDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserClient()

      console.log("[v0] Instructor Dashboard: Checking auth...")

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      console.log("[v0] Instructor Dashboard: User result:", user ? `Found user ${user.id}` : "No user found")

      if (userError || !user) {
        router.replace("/auth/login")
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_type, display_name")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("[v0] Instructor Dashboard: Profile error:", profileError)
      }

      if (profileData?.user_type !== "instructor") {
        router.replace("/studio/dashboard")
        return
      }

      setProfile(profileData)

      console.log("[v0] Instructor Dashboard: Fetching availability slots...")
      const { data: slotsData, error: slotsError } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("instructor_id", user.id)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(10)

      console.log("[v0] Instructor Dashboard: Availability result:", {
        count: slotsData?.length || 0,
        error: slotsError?.message,
        sample: slotsData?.[0],
      })

      setAvailabilitySlots(slotsData || [])

      console.log("[v0] Instructor Dashboard: Fetching cover requests...")
      const { data: coverRequestsData, error: coverError } = await supabase
        .from("cover_requests")
        .select(`
          *,
          studio:profiles!cover_requests_studio_id_fkey(display_name, location)
        `)
        .eq("status", "open")
        .is("instructor_id", null)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(10)

      console.log("[v0] Instructor Dashboard: Cover requests result:", {
        count: coverRequestsData?.length || 0,
        error: coverError?.message,
        sample: coverRequestsData?.[0],
      })

      setCoverRequests(coverRequestsData || [])

      console.log("[v0] Instructor Dashboard: Fetching applications...")
      const { data: appsData, error: appsError } = await supabase
        .from("job_applications")
        .select(`
          *,
          job:jobs(
            id,
            title,
            job_type,
            location,
            hourly_rate_min,
            hourly_rate_max,
            studio:profiles!jobs_studio_id_fkey(display_name)
          )
        `)
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false })

      console.log("[v0] Instructor Dashboard: Applications result:", {
        count: appsData?.length || 0,
        error: appsError?.message,
      })

      setApplications(appsData || [])

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleAcceptCover = async () => {
    if (!selectedCoverRequest) return

    const result = await acceptCoverRequest(selectedCoverRequest.id)

    if (result.success) {
      alert("Cover request accepted! The studio will be notified.")
      setCoverDialogOpen(false)
      window.location.reload()
    } else {
      alert("Failed to accept cover request: " + result.error)
    }
  }

  const handleRemoveAvailability = async (slotId: string) => {
    if (!confirm("Are you sure you want to remove this availability slot?")) return

    const result = await removeAvailability(slotId)

    if (result.success) {
      setAvailabilitySlots(availabilitySlots.filter((slot) => slot.id !== slotId))
    } else {
      alert("Failed to remove availability: " + result.error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const isProfileIncomplete = !profile?.display_name

  const openApplications = applications.filter((a) => a.job?.status === "open")
  const closedApplications = applications.filter((a) => a.job?.status === "closed")

  const pendingApplications = openApplications.filter((a) => a.status === "pending")
  const interviewApplications = openApplications.filter((a) => a.status === "interview")
  const acceptedApplications = openApplications.filter((a) => a.status === "accepted")

  const stats = {
    activeApplications: pendingApplications.length,
    interviews: interviewApplications.length,
    jobsAccepted: acceptedApplications.length,
    availabilitySlots: availabilitySlots.length,
    coverRequests: coverRequests.length,
    unreadMessages: 0,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="border-b bg-background">
          <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.display_name || "Instructor"}!</h1>
                <p className="text-muted-foreground">Track your applications and find new opportunities</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/instructor/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button onClick={() => router.push("/instructor/availability")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Post Availability
                </Button>
                <Button onClick={() => router.push("/jobs")}>
                  <Search className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8">
          {isProfileIncomplete && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Complete Your Profile</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>Add your name and details to get the most out of Pilates Connect</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/instructor/profile">Edit Profile</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeApplications}</div>
                <p className="text-xs text-muted-foreground mt-1">Pending review</p>
              </CardContent>
            </Card>

            <Card>
              <Link
                href="#availability"
                onClick={(e) => {
                  e.preventDefault()
                  const tabTrigger = document.querySelector('[value="availability"]') as HTMLElement
                  tabTrigger?.click()
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                  <CardTitle className="text-sm font-medium">My Availability</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="cursor-pointer">
                  <div className="text-2xl font-bold">{stats.availabilitySlots}</div>
                  <p className="text-xs text-muted-foreground mt-1">Upcoming slots</p>
                </CardContent>
              </Link>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cover Requests</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.coverRequests}</div>
                <p className="text-xs text-muted-foreground mt-1">Available now</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jobs Accepted</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.jobsAccepted}</div>
                <p className="text-xs text-muted-foreground mt-1">Confirmed positions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unreadMessages}</div>
                <p className="text-xs text-muted-foreground mt-1">Messages waiting for your response</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cover-requests">Cover Requests ({stats.coverRequests})</TabsTrigger>
              <TabsTrigger value="availability">My Availability ({stats.availabilitySlots})</TabsTrigger>
              <TabsTrigger value="applications">Applications ({stats.activeApplications})</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                      <Link href="/instructor/post-availability">
                        <Calendar className="h-4 w-4 mr-2" />
                        Post New Availability
                      </Link>
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                      <Link href="/jobs">
                        <Search className="h-4 w-4 mr-2" />
                        Browse All Jobs
                      </Link>
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                      <Link href="/messages">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">{/* Placeholder for recent messages */}</CardContent>
                </Card>
              </div>
              <ReferralWidget />
            </TabsContent>

            <TabsContent value="cover-requests">
              <Card>
                <CardHeader>
                  <CardTitle>Available Cover Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">Cover requests content coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>My Availability Slots</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">Availability management coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>My Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">Applications tracking coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Media Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">Manage your portfolio images and videos</p>
                  <Button asChild>
                    <Link href="/instructor/media">Go to Media Upload</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="earnings">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings & Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">Earnings tracking coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">Calendar integration coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrals">
              <ReferralWidget />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {selectedCoverRequest && (
        <CoverRequestDialog
          request={selectedCoverRequest}
          open={coverDialogOpen}
          onOpenChange={setCoverDialogOpen}
          onAccept={handleAcceptCover}
        />
      )}

      <SiteFooter />
    </div>
  )
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" })
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-AU", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })
}

// Function to remove availability
async function removeAvailability(slotId: string) {
  // Implementation for removing availability
}
