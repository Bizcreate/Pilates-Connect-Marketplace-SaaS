import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Plus, MessageSquare, Users, Briefcase, TrendingUp, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function StudioDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, display_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile?.user_type !== "studio") {
    redirect("/instructor/dashboard")
  }

  // Fetch studio's jobs
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("studio_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch applications for studio's jobs
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      instructor:profiles!applications_instructor_id_fkey(display_name, email),
      job:jobs(title)
    `)
    .in("job_id", jobs?.map((j) => j.id) || [])
    .order("created_at", { ascending: false })
    .limit(10)

  const activeJobs = jobs?.filter((j) => j.status === "open") || []
  const totalApplications = applications?.length || 0
  const newApplications = applications?.filter((a) => a.status === "pending") || []

  const stats = {
    activeJobs: activeJobs.length,
    totalApplications,
    unreadMessages: 0, // Will be implemented with messaging system
    profileViews: 0, // Will be implemented with analytics
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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {profile?.display_name}!</h1>
              <p className="text-muted-foreground mt-1">Manage your job postings and applications</p>
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

          {/* Stats Grid */}
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
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all jobs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unreadMessages}</div>
                <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.profileViews}</div>
                <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="jobs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="jobs">Active Jobs ({activeJobs.length})</TabsTrigger>
              <TabsTrigger value="applications">Recent Applications ({newApplications.length})</TabsTrigger>
            </TabsList>

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
