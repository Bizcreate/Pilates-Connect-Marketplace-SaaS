"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ReferralWidget } from "@/components/referral-widget"
import { CoverRequestDialog } from "@/components/cover-request-dialog"
import { Search, Briefcase, Calendar, CheckCircle2, Clock, XCircle, User, AlertCircle, CalendarDays, MapPin, MessageSquare } from 'lucide-react'
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
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

  const pendingApplications = applications.filter((a) => a.status === "pending")
  const interviewApplications = applications.filter((a) => a.status === "interview")
  const acceptedApplications = applications.filter((a) => a.status === "accepted")

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
              <Link href="#availability" onClick={(e) => {
                e.preventDefault();
                const tabTrigger = document.querySelector('[value="availability"]') as HTMLElement;
                tabTrigger?.click();
              }}>
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

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cover-requests">Cover Requests ({coverRequests.length})</TabsTrigger>
              <TabsTrigger value="availability">My Availability ({availabilitySlots.length})</TabsTrigger>
              <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
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

            <TabsContent value="cover-requests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Cover Requests</CardTitle>
                  <CardDescription>Studios looking for immediate cover - respond quickly!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {coverRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No cover requests available</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Check back later for urgent cover opportunities from studios
                      </p>
                    </div>
                  ) : (
                    coverRequests.map((request) => (
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCoverRequest(request)
                              setCoverDialogOpen(true)
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCoverRequest(request)
                              setCoverDialogOpen(true)
                            }}
                          >
                            Accept Cover
                          </Button>
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
                  {availabilitySlots.length === 0 ? (
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
                    availabilitySlots.map((slot) => {
                      let metadata: any = {}
                      try {
                        metadata = typeof slot.notes === 'string' ? JSON.parse(slot.notes) : slot.notes || {}
                      } catch (e) {
                        console.error('[v0] Failed to parse slot metadata:', e)
                      }

                      return (
                        <div
                          key={slot.id}
                          className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="space-y-3 flex-1">
                            {/* Date and Time */}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">{formatDateTime(slot.start_time)}</span>
                              <span className="text-muted-foreground">to</span>
                              <span className="font-semibold">{formatDateTime(slot.end_time)}</span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                              {metadata.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">Location:</span>
                                  <span className="font-medium capitalize">{metadata.location}</span>
                                </div>
                              )}
                              
                              {metadata.pilates_level && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Level:</span>
                                  <span className="font-medium capitalize">{metadata.pilates_level.replace('-', ' ')}</span>
                                </div>
                              )}

                              {metadata.rate_min && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Rate:</span>
                                  <span className="font-medium">
                                    ${metadata.rate_min}
                                    {metadata.rate_unit === 'per_class' ? '/class' : '/hour'}
                                  </span>
                                </div>
                              )}

                              {metadata.equipment && Array.isArray(metadata.equipment) && metadata.equipment.length > 0 && (
                                <div className="flex items-start gap-2 col-span-2">
                                  <span className="text-muted-foreground">Equipment:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {metadata.equipment.map((eq: string, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {eq}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {metadata.availability_type && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Type:</span>
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {metadata.availability_type}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/instructor/availability/${slot.id}/edit`}>Edit</Link>
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRemoveAvailability(slot.id)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      )
                    })
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
                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No applications yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Start applying to jobs to see them here</p>
                      <Button asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                      </Button>
                    </div>
                  ) : (
                    applications.map((application) => (
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
                                {application.job?.hourly_rate_min && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      ${application.job.hourly_rate_min}
                                      {application.job.hourly_rate_max && `-$${application.job.hourly_rate_max}`}/hour
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
                    <div className="text-2xl font-bold">$0</div>
                    <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Last Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0</div>
                    <p className="text-xs text-muted-foreground mt-1">To be paid</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Earnings History</CardTitle>
                  <CardDescription>Your monthly earnings over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">{/* Placeholder for earnings history */}</div>
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
