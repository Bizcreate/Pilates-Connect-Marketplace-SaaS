"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ReferralWidget } from "@/components/referral-widget"
import {
  Search,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  AlertCircle,
  CalendarDays,
  MapPin,
  MessageSquare,
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import {
  mockCoverRequests,
  mockAvailability,
  mockJobs,
  mockEarnings,
  mockApplications,
  mockMessages,
} from "@/lib/mock-data"

export default function InstructorDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [availableJobs, setAvailableJobs] = useState<any[]>([])
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([])
  const [coverRequests, setCoverRequests] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserClient()

      console.log("[v0] Dashboard: Checking auth...")

      const storedSession = localStorage.getItem("supabase.auth.token")
      console.log("[v0] Dashboard: Session in localStorage:", !!storedSession)

      // Check auth
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("[v0] Dashboard: User result:", user ? `Found user ${user.id}` : "No user found")

      if (!user) {
        console.log("[v0] Dashboard: No user, redirecting to login")
        router.replace("/auth/login")
        return
      }

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_type, display_name, email")
        .eq("id", user.id)
        .maybeSingle()

      console.log(
        "[v0] Dashboard: Profile result:",
        profileData ? `Found profile, type: ${profileData.user_type}` : "No profile found",
      )

      if (!profileData) {
        console.log("[v0] Dashboard: No profile, redirecting to login")
        router.replace("/auth/login")
        return
      }

      if (profileData.user_type !== "instructor") {
        console.log("[v0] Dashboard: Wrong user type, redirecting to studio dashboard")
        router.replace("/studio/dashboard")
        return
      }

      setProfile(profileData)

      const { data: slotsData } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("instructor_id", user.id)
        .eq("is_available", true)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(10)

      setAvailabilitySlots(slotsData || [])

      const { data: coverRequestsData } = await supabase
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

      setCoverRequests(coverRequestsData || [])

      // Load applications
      const { data: appsData } = await supabase
        .from("applications")
        .select(`
          *,
          job:jobs(
            id,
            title,
            job_type,
            location,
            compensation_min,
            compensation_max,
            compensation_type,
            studio:profiles!jobs_studio_id_fkey(display_name)
          )
        `)
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false })

      setApplications(appsData || [])

      // Load available jobs
      const appliedJobIds = appsData?.map((a) => a.job_id) || []
      const { data: jobsData } = await supabase
        .from("jobs")
        .select(`
          *,
          studio:profiles!jobs_studio_id_fkey(display_name)
        `)
        .eq("status", "open")
        .not("id", "in", `(${appliedJobIds.join(",") || "null"})`)
        .order("created_at", { ascending: false })
        .limit(5)

      setAvailableJobs(jobsData || [])
      setLoading(false)
    }

    loadData()
  }, [router])

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

  const pendingApplications = applications.filter((a) => a.status === "pending")
  const interviewApplications = applications.filter((a) => a.status === "interview")
  const acceptedApplications = applications.filter((a) => a.status === "accepted")

  const stats = {
    activeApplications: pendingApplications.length,
    interviews: interviewApplications.length,
    jobsAccepted: acceptedApplications.length,
    availabilitySlots: availabilitySlots.length,
    coverRequests: coverRequests.length,
    unreadMessages: mockMessages.filter((m) => m.unread).length,
  }

  const displayCoverRequests =
    coverRequests.length > 0
      ? coverRequests
      : mockCoverRequests.map((req) => ({
          id: req.id,
          class_type: req.class_type,
          date: req.date,
          start_time: req.time,
          end_time: req.time,
          notes: req.description,
          status: req.status,
          studio: { display_name: req.studio_name, location: req.location },
        }))

  const displayAvailability =
    availabilitySlots.length > 0
      ? availabilitySlots
      : mockAvailability.map((avail) => ({
          id: avail.id,
          start_time: `${avail.date}T${avail.start_time}`,
          end_time: `${avail.date}T${avail.end_time}`,
          notes: `Available for ${avail.equipment.join(", ")}`,
        }))

  const displayApplications =
    applications.length > 0
      ? applications
      : mockApplications.map((app) => ({
          id: app.id,
          status: app.status,
          created_at: app.applied_date,
          job_id: app.id,
          job: {
            title: app.job_title,
            job_type: app.type,
            location: "Sydney, NSW",
            compensation_min: 75,
            compensation_max: 95,
            compensation_type: "hour",
            studio: { display_name: app.studio_name },
          },
        }))

  const displayJobs =
    availableJobs.length > 0
      ? availableJobs
      : mockJobs.map((job) => ({
          id: job.id,
          title: job.title,
          job_type: job.type,
          location: job.location,
          compensation_min: 75,
          compensation_max: 95,
          compensation_type: "hour",
          created_at: job.posted_date,
          studio: { display_name: job.studio_name },
        }))

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
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

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}!
              </h1>
              <p className="text-muted-foreground mt-1">Track your applications and find new opportunities</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" asChild>
                <Link href="/instructor/profile">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/instructor/post-availability">
                  <Calendar className="h-4 w-4 mr-2" />
                  Post Availability
                </Link>
              </Button>
              <Button size="lg" asChild>
                <Link href="/jobs">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Link>
              </Button>
            </div>
          </div>

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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Availability</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.availabilitySlots}</div>
                <p className="text-xs text-muted-foreground mt-1">Upcoming slots</p>
              </CardContent>
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

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cover-requests">Cover Requests ({displayCoverRequests.length})</TabsTrigger>
              <TabsTrigger value="availability">My Availability ({displayAvailability.length})</TabsTrigger>
              <TabsTrigger value="applications">Applications ({displayApplications.length})</TabsTrigger>
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
                        Messages ({mockMessages.filter((m) => m.unread).length})
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockMessages.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{msg.from}</p>
                            {msg.unread && <div className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{msg.preview}</p>
                          <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <ReferralWidget />
            </TabsContent>

            <TabsContent value="cover-requests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Cover Requests</CardTitle>
                  <CardDescription>Studios looking for immediate cover - respond quickly!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayCoverRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No cover requests available</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Check back later for urgent cover opportunities
                      </p>
                    </div>
                  ) : (
                    displayCoverRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{request.class_type || "Pilates Class"}</h3>
                                <Badge variant="destructive" className="text-xs">
                                  Urgent
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{request.studio?.display_name}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(request.date)}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>
                                  {request.start_time} - {request.end_time}
                                </span>
                                {request.studio?.location && (
                                  <>
                                    <span>•</span>
                                    <MapPin className="h-3 w-3" />
                                    <span>{request.studio.location}</span>
                                  </>
                                )}
                              </div>
                              {request.notes && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{request.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm">Accept Cover</Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Availability Slots</CardTitle>
                  <CardDescription>Manage when you're available for work</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayAvailability.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No availability posted</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Post your availability to let studios know when you're free
                      </p>
                      <Button asChild>
                        <Link href="/instructor/post-availability">Post Availability</Link>
                      </Button>
                    </div>
                  ) : (
                    displayAvailability.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{formatDateTime(slot.start_time)}</span>
                            <span className="text-muted-foreground">to</span>
                            <span className="font-semibold">{formatTime(slot.end_time)}</span>
                          </div>
                          {slot.notes && <p className="text-sm text-muted-foreground">{slot.notes}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Applications</CardTitle>
                  <CardDescription>Track the status of your job applications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No applications yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Start applying to jobs to see them here</p>
                      <Button asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                      </Button>
                    </div>
                  ) : (
                    displayApplications.map((application) => (
                      <div
                        key={application.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{application.job?.title}</h3>
                              <p className="text-sm text-muted-foreground">{application.job?.studio?.display_name}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span className="capitalize">{application.job?.job_type}</span>
                                <span>•</span>
                                <span>{application.job?.location}</span>
                                {application.job?.compensation_min && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      ${application.job.compensation_min}
                                      {application.job.compensation_max && `-$${application.job.compensation_max}`}/
                                      {application.job.compensation_type}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant={
                                application.status === "accepted"
                                  ? "default"
                                  : application.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="capitalize"
                            >
                              {application.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                              {application.status === "accepted" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {application.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                              {application.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Applied {formatRelativeTime(application.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/jobs/${application.job_id}`}>View Job</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${mockEarnings.thisMonth.toLocaleString()}</div>
                    <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Last Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${mockEarnings.lastMonth.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${mockEarnings.pending.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">To be paid</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${mockEarnings.total.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Earnings History</CardTitle>
                  <CardDescription>Your monthly earnings over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEarnings.breakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.month} 2025</span>
                        <span className="text-sm font-bold">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Schedule</CardTitle>
                  <CardDescription>Upcoming classes, covers, and availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Calendar View Coming Soon</h3>
                    <p className="text-sm text-muted-foreground">
                      Full calendar integration with your schedule, availability, and bookings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrals" className="space-y-4">
              <ReferralWidget />
            </TabsContent>
          </Tabs>
        </div>
      </main>

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
