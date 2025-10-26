"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  Search,
  Briefcase,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  AlertCircle,
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useState } from "react"

export default function InstructorDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [availableJobs, setAvailableJobs] = useState<any[]>([])

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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.interviews}</div>
                <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
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
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unreadMessages}</div>
                <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="applications" className="space-y-4">
            <TabsList>
              <TabsTrigger value="applications">My Applications ({applications.length})</TabsTrigger>
              <TabsTrigger value="recommended">Recommended Jobs ({availableJobs.length})</TabsTrigger>
            </TabsList>

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

            <TabsContent value="recommended" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Jobs</CardTitle>
                  <CardDescription>New opportunities matching your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No new jobs available</h3>
                      <p className="text-sm text-muted-foreground mb-4">Check back later for new opportunities</p>
                      <Button asChild>
                        <Link href="/jobs">Browse All Jobs</Link>
                      </Button>
                    </div>
                  ) : (
                    availableJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <p className="text-sm text-muted-foreground">{job.studio?.display_name}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span className="capitalize">{job.job_type}</span>
                                <span>•</span>
                                <span>{job.location}</span>
                                {job.compensation_min && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      ${job.compensation_min}
                                      {job.compensation_max && `-$${job.compensation_max}`}/{job.compensation_type}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">Posted {formatRelativeTime(job.created_at)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/jobs/${job.id}`}>View Details</Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/jobs/${job.id}/apply`}>Apply Now</Link>
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
