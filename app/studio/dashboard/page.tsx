"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  Plus,
  MessageSquare,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  CalendarDays,
  AlertCircle,
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

export default function StudioDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [coverRequests, setCoverRequests] = useState<any[]>([])
  const [availableInstructors, setAvailableInstructors] = useState<any[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_type, display_name")
        .eq("id", user.id)
        .maybeSingle()

      if (!profileData) {
        router.push("/auth/login")
        return
      }

      if (profileData.user_type !== "studio") {
        router.push("/instructor/dashboard")
        return
      }

      setProfile(profileData)

      const { data: coverRequestsData } = await supabase
        .from("cover_requests")
        .select(`
          *,
          instructor:profiles!cover_requests_instructor_id_fkey(display_name)
        `)
        .eq("studio_id", user.id)
        .order("date", { ascending: true })

      setCoverRequests(coverRequestsData || [])

      const { data: instructorsData } = await supabase
        .from("availability_slots")
        .select(`
          *,
          instructor:profiles!availability_slots_instructor_id_fkey(
            id,
            display_name,
            location
          ),
          instructor_profile:instructor_profiles!availability_slots_instructor_id_fkey(
            certifications,
            specializations,
            years_experience,
            hourly_rate_min,
            hourly_rate_max
          )
        `)
        .eq("is_available", true)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(10)

      const uniqueInstructors = instructorsData?.reduce((acc, slot) => {
        if (!acc.find((i: any) => i.instructor?.id === slot.instructor?.id)) {
          acc.push(slot)
        }
        return acc
      }, [] as any[])

      setAvailableInstructors(uniqueInstructors || [])

      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("studio_id", user.id)
        .order("created_at", { ascending: false })

      setJobs(jobsData || [])

      if (jobsData && jobsData.length > 0) {
        const { data: applicationsData } = await supabase
          .from("applications")
          .select(`
            *,
            instructor:profiles!applications_instructor_id_fkey(display_name, email),
            job:jobs(title)
          `)
          .in(
            "job_id",
            jobsData.map((j) => j.id),
          )
          .order("created_at", { ascending: false })
          .limit(10)

        setApplications(applicationsData || [])
      }

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

  const recentApplications = newApplications.slice(0, 5).map((app) => ({
    id: app.id,
    instructorName: app.instructor?.display_name || "Unknown",
    jobTitle: app.job?.title || "Unknown Job",
    appliedDate: formatRelativeTime(app.created_at),
    status: app.status,
  }))

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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently hiring</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cover Requests</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.coverRequests}</div>
                <p className="text-xs text-muted-foreground mt-1">Active requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Instructors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.availableInstructors}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready to work</p>
              </CardContent>
            </Card>

            <Card>
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

          <Tabs defaultValue="cover-requests" className="space-y-4">
            <TabsList>
              <TabsTrigger value="cover-requests">Cover Requests ({activeCoverRequests.length})</TabsTrigger>
              <TabsTrigger value="instructors">Available Instructors ({availableInstructors.length})</TabsTrigger>
              <TabsTrigger value="jobs">Active Jobs ({activeJobs.length})</TabsTrigger>
              <TabsTrigger value="applications">Recent Applications ({newApplications.length})</TabsTrigger>
            </TabsList>

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
                          <Button size="sm" variant="outline">
                            Edit
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
                    availableInstructors.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{slot.instructor?.display_name}</h3>
                              {slot.instructor?.location && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{slot.instructor.location}</span>
                                </div>
                              )}
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Available: {formatDateTime(slot.start_time)}</span>
                              </div>
                              {slot.instructor_profile && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {slot.instructor_profile.years_experience && (
                                    <Badge variant="outline" className="text-xs">
                                      {slot.instructor_profile.years_experience}+ years exp
                                    </Badge>
                                  )}
                                  {slot.instructor_profile.hourly_rate_min && (
                                    <Badge variant="outline" className="text-xs">
                                      ${slot.instructor_profile.hourly_rate_min}-$
                                      {slot.instructor_profile.hourly_rate_max}/hr
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/instructors/${slot.instructor?.id}`}>View Profile</Link>
                          </Button>
                          <Button size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Contact
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
                  {activeJobs.length === 0 ? (
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
                    activeJobs.map((job) => (
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

            <TabsContent value="applications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Review and respond to instructor applications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No applications yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Applications will appear here once instructors apply to your jobs
                      </p>
                    </div>
                  ) : (
                    recentApplications.map((application) => (
                      <div
                        key={application.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold">{application.instructorName}</h3>
                              <p className="text-sm text-muted-foreground">{application.jobTitle}</p>
                            </div>
                            <Badge
                              variant={application.status === "pending" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {application.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Applied {application.appliedDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                          <Button size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
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
