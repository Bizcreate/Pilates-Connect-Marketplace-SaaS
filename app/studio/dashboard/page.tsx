"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ReferralWidget } from "@/components/referral-widget"
import { Plus, MessageSquare, Users, Briefcase, TrendingUp, Calendar, Clock, MapPin, CalendarDays, AlertCircle, Search } from 'lucide-react'
import { createBrowserClient } from "@/lib/supabase/client"

export default function StudioDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [coverRequests, setCoverRequests] = useState<any[]>([])
  const [availableInstructors, setAvailableInstructors] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadDashboard() {
      console.log("[v0] Loading studio dashboard...")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("[v0] User:", user?.id)

      if (!user) {
        console.log("[v0] No user found, redirecting to login")
        router.push("/auth/login")
        return
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_type, display_name")
        .eq("id", user.id)
        .maybeSingle()

      console.log("[v0] Profile data:", profileData)

      if (!profileData) {
        console.log("[v0] No profile found, redirecting to login")
        router.push("/auth/login")
        return
      }

      if (profileData.user_type !== "studio") {
        console.log("[v0] User is not a studio, redirecting to instructor dashboard")
        router.push("/instructor/dashboard")
        return
      }

      setProfile(profileData)

      const { data: coverRequestsData, error: coverError } = await supabase
        .from("cover_requests")
        .select(`
          *,
          instructor:profiles!cover_requests_instructor_id_fkey(display_name)
        `)
        .eq("studio_id", user.id)
        .order("date", { ascending: true })

      console.log("[v0] Cover requests:", { count: coverRequestsData?.length, error: coverError })
      setCoverRequests(coverRequestsData || [])

      const { data: instructorsData, error: instructorsError } = await supabase
        .from("profiles")
        .select(`
          id,
          display_name,
          location,
          avatar_url,
          instructor_profile:instructor_profiles!instructor_profiles_id_fkey(
            years_experience,
            hourly_rate_min,
            hourly_rate_max,
            availability_status,
            specializations,
            certifications,
            equipment
          )
        `)
        .eq("user_type", "instructor")
        .not("instructor_profile", "is", null)
        .limit(20)

      console.log("[v0] Available instructors:", { count: instructorsData?.length, error: instructorsError, sample: instructorsData?.[0] })
      
      // Filter for only available instructors
      const availableInstructorsData = instructorsData?.filter(
        (instructor) => instructor.instructor_profile?.availability_status === "available"
      ) || []
      
      setAvailableInstructors(availableInstructorsData)

      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("studio_id", user.id)
        .order("created_at", { ascending: false })

      console.log("[v0] Jobs:", { count: jobsData?.length, error: jobsError })
      setJobs(jobsData || [])

      if (jobsData && jobsData.length > 0) {
        const { data: applicationsData, error: appsError } = await supabase
          .from("job_applications")
          .select(`
            *,
            instructor:profiles!job_applications_instructor_id_fkey(display_name, email),
            job:jobs(title)
          `)
          .in(
            "job_id",
            jobsData.map((j) => j.id),
          )
          .order("created_at", { ascending: false })
          .limit(10)

        console.log("[v0] Applications:", { count: applicationsData?.length, error: appsError })
        setApplications(applicationsData || [])
      }

      console.log("[v0] Dashboard loaded successfully")
      setLoading(false)
    }

    loadDashboard()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const activeJobs = jobs.filter((j) => j.status === "open")
  const totalApplications = applications.length
  const newApplications = applications.filter((a) => a.status === "pending")
  const activeCoverRequests = coverRequests.filter((r) => r.status === "open")
  const upcomingCoverRequests = coverRequests.filter((r) => r.status === "open" && new Date(r.date) >= new Date())

  const stats = {
    activeJobs: activeJobs.length,
    totalApplications,
    coverRequests: activeCoverRequests.length,
    availableInstructors: availableInstructors.length,
    unreadMessages: 0,
    profileViews: 0,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {profile?.display_name}!</h1>
              <p className="text-muted-foreground mt-1">Manage your job postings and find instructors</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" asChild>
                <Link href="/studio/request-cover">
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Cover
                </Link>
              </Button>
              <Button size="lg" asChild>
                <Link href="/studio/post-job">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab("jobs")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently hiring</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setActiveTab("cover-requests")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cover Requests</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.coverRequests}</div>
                <p className="text-xs text-muted-foreground mt-1">Active requests</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setActiveTab("instructors")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Instructors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.availableInstructors}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready to work</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab("hiring")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all jobs</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cover-requests">Cover Requests ({coverRequests.length})</TabsTrigger>
              <TabsTrigger value="instructors">Available Instructors ({availableInstructors.length})</TabsTrigger>
              <TabsTrigger value="jobs">Active Jobs ({jobs.length})</TabsTrigger>
              <TabsTrigger value="hiring">Hiring Pipeline</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                      <Link href="/studio/request-cover">
                        <Calendar className="h-4 w-4 mr-2" />
                        Request Urgent Cover
                      </Link>
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                      <Link href="/studio/post-job">
                        <Plus className="h-4 w-4 mr-2" />
                        Post New Job
                      </Link>
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                      <Link href="/find-instructors">
                        <Search className="h-4 w-4 mr-2" />
                        Browse Instructors
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Displaying mock messages for now */}
                    {/* Replace with actual message fetching logic */}
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">Alex Johnson</p>
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          Can you confirm the class schedule for tomorrow?
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">Maria Garcia</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          Regarding the recent job application...
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <ReferralWidget />
            </TabsContent>

            <TabsContent value="cover-requests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Cover Requests</CardTitle>
                  <CardDescription>Manage your urgent cover needs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingCoverRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No active cover requests</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Need someone to cover a class? Post a cover request
                      </p>
                      <Button asChild>
                        <Link href="/studio/request-cover">Request Cover</Link>
                      </Button>
                    </div>
                  ) : (
                    upcomingCoverRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{request.class_type || "Pilates Class"}</h3>
                                <Badge
                                  variant={
                                    request.status === "filled"
                                      ? "default"
                                      : request.status === "cancelled"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="capitalize"
                                >
                                  {request.status}
                                </Badge>
                              </div>
                              {request.instructor && (
                                <p className="text-sm text-muted-foreground">
                                  Covered by: {request.instructor.display_name}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(request.date)}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>
                                  {request.start_time} - {request.end_time}
                                </span>
                              </div>
                              {request.notes && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{request.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/studio/cover-requests/${request.id}/edit`}>Edit</Link>
                          </Button>
                          {request.status === "open" && (
                            <Button size="sm" variant="destructive">
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Instructors</CardTitle>
                  <CardDescription>Instructors ready to work now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableInstructors.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No instructors available</h3>
                      <p className="text-sm text-muted-foreground">Check back later or browse all instructors</p>
                      <Button asChild className="mt-4">
                        <Link href="/find-instructors">Browse All Instructors</Link>
                      </Button>
                    </div>
                  ) : (
                    availableInstructors.map((instructor) => (
                      <div
                        key={instructor.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{instructor.display_name}</h3>
                              {instructor.location && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{instructor.location}</span>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {instructor.instructor_profile?.years_experience && (
                                  <Badge variant="outline" className="text-xs">
                                    {instructor.instructor_profile.years_experience}+ years exp
                                  </Badge>
                                )}
                                {instructor.instructor_profile?.hourly_rate_min && (
                                  <Badge variant="outline" className="text-xs">
                                    ${instructor.instructor_profile.hourly_rate_min}-${instructor.instructor_profile.hourly_rate_max}/hr
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/instructors/${instructor.id}`}>View Profile</Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/messages?userId=${instructor.id}`}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Job Postings</CardTitle>
                  <CardDescription>Manage and track your current job listings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {jobs.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No active jobs</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Post your first job to start finding qualified instructors
                      </p>
                      <Button asChild>
                        <Link href="/studio/post-job">Post a Job</Link>
                      </Button>
                    </div>
                  ) : (
                    jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span className="capitalize">{job.job_type}</span>
                                <span>•</span>
                                <span>{job.location}</span>
                                <span>•</span>
                                <span>Posted {formatRelativeTime(job.created_at)}</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {job.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {applications?.filter((a) => a.job_id === job.id).length || 0}
                              </span>
                              <span className="text-muted-foreground">applications</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/studio/jobs/${job.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hiring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hiring Pipeline</CardTitle>
                  <CardDescription>Track applicants through your hiring process</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">
                        Applied ({applications.filter((a) => a.status === "pending").length})
                      </h3>
                      <div className="space-y-2">
                        {applications
                          .filter((a) => a.status === "pending")
                          .map((app) => (
                            <Card key={app.id} className="p-3">
                              <p className="font-medium text-sm">{app.instructor.display_name}</p>
                              <p className="text-xs text-muted-foreground">{app.job.title}</p>
                            </Card>
                          ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Interview (0)</h3>
                      <p className="text-xs text-muted-foreground">No interviews scheduled</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Offer (0)</h3>
                      <p className="text-xs text-muted-foreground">No offers extended</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">
                        Hired ({applications.filter((a) => a.status === "accepted").length})
                      </h3>
                      <div className="space-y-2">
                        {applications
                          .filter((a) => a.status === "accepted")
                          .map((app) => (
                            <Card key={app.id} className="p-3">
                              <p className="font-medium text-sm">{app.instructor.display_name}</p>
                              <p className="text-xs text-muted-foreground">{app.job.title}</p>
                            </Card>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94%</div>
                    <p className="text-xs text-green-600 mt-1">+5% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Time to Fill</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2.3 days</div>
                    <p className="text-xs text-green-600 mt-1">-0.5 days faster</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Instructor Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8/5.0</div>
                    <p className="text-xs text-muted-foreground mt-1">Average rating</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Overview</CardTitle>
                  <CardDescription>Your hiring and cover statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Analytics Dashboard Coming Soon</h3>
                    <p className="text-sm text-muted-foreground">
                      Detailed insights into your hiring patterns, costs, and instructor performance
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
