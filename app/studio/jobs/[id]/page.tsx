"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  Mail,
  Phone,
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function StudioJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadJobDetails() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Load job details
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("studio_id", user.id)
        .maybeSingle()

      if (jobError || !jobData) {
        console.error("[v0] Error loading job:", jobError)
        toast({
          title: "Error",
          description: "Job not found or you don't have permission to view it",
          variant: "destructive",
        })
        router.push("/studio/dashboard")
        return
      }

      setJob(jobData)

      // Load applications for this job
      const { data: applicationsData } = await supabase
        .from("job_applications")
        .select(
          `
          *,
          instructor:profiles!job_applications_instructor_id_fkey(
            id,
            display_name,
            email,
            phone,
            location,
            bio
          ),
          instructor_profile:instructor_profiles!job_applications_instructor_id_fkey(
            certifications,
            specializations,
            equipment,
            years_experience,
            hourly_rate_min,
            hourly_rate_max
          )
        `,
        )
        .eq("job_id", id)
        .order("created_at", { ascending: false })

      setApplications(applicationsData || [])
      setLoading(false)
    }

    loadJobDetails()
  }, [id, router, supabase, toast])

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    const { error } = await supabase.from("job_applications").update({ status: newStatus }).eq("id", applicationId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
      return
    }

    setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))

    toast({
      title: "Status updated",
      description: `Application marked as ${newStatus}`,
    })
  }

  const handleCloseJob = async () => {
    const { error } = await supabase.from("jobs").update({ status: "closed" }).eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to close job",
        variant: "destructive",
      })
      return
    }

    setJob({ ...job, status: "closed" })
    toast({
      title: "Job closed",
      description: "This job is no longer accepting applications",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading job details...</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (!job) {
    return null
  }

  const pendingApplications = applications.filter((a) => a.status === "pending")
  const reviewedApplications = applications.filter((a) => a.status === "reviewed")
  const acceptedApplications = applications.filter((a) => a.status === "accepted")
  const rejectedApplications = applications.filter((a) => a.status === "rejected")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-6xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/studio/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Job Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-3xl">{job.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                        <span>•</span>
                        <Briefcase className="h-4 w-4" />
                        <span className="capitalize">{job.job_type}</span>
                      </div>
                    </div>
                    <Badge variant={job.status === "open" ? "default" : "secondary"} className="capitalize">
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-4">
                    {job.compensation_min && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          ${job.compensation_min}
                          {job.compensation_max && `-$${job.compensation_max}`}/{job.compensation_type}
                        </span>
                      </div>
                    )}
                    {job.start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Start: {new Date(job.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Posted {formatRelativeTime(job.created_at)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                  </div>

                  {job.schedule_details && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Schedule</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{job.schedule_details}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Requirements</h3>
                    <div className="space-y-3">
                      {job.equipment && job.equipment.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Equipment:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.equipment.map((item: string) => (
                              <Badge key={item} variant="outline">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {job.certifications_required && job.certifications_required.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Certifications:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.certifications_required.map((item: string) => (
                              <Badge key={item} variant="secondary">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/jobs/${id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Public Listing
                      </Link>
                    </Button>
                    {job.status === "open" && (
                      <Button variant="destructive" onClick={handleCloseJob}>
                        Close Job
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Applications</span>
                    <span className="text-2xl font-bold">{applications.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Review</span>
                    <span className="text-xl font-semibold">{pendingApplications.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Accepted</span>
                    <span className="text-xl font-semibold text-green-600">{acceptedApplications.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rejected</span>
                    <span className="text-xl font-semibold text-red-600">{rejectedApplications.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Applications */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Review and manage instructor applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList>
                  <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
                  <TabsTrigger value="reviewed">Reviewed ({reviewedApplications.length})</TabsTrigger>
                  <TabsTrigger value="accepted">Accepted ({acceptedApplications.length})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({rejectedApplications.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4 mt-4">
                  {pendingApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending applications</p>
                    </div>
                  ) : (
                    pendingApplications.map((app) => (
                      <ApplicationCard key={app.id} application={app} onUpdateStatus={handleUpdateApplicationStatus} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="reviewed" className="space-y-4 mt-4">
                  {reviewedApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No reviewed applications</p>
                    </div>
                  ) : (
                    reviewedApplications.map((app) => (
                      <ApplicationCard key={app.id} application={app} onUpdateStatus={handleUpdateApplicationStatus} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="accepted" className="space-y-4 mt-4">
                  {acceptedApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No accepted applications</p>
                    </div>
                  ) : (
                    acceptedApplications.map((app) => (
                      <ApplicationCard key={app.id} application={app} onUpdateStatus={handleUpdateApplicationStatus} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4 mt-4">
                  {rejectedApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No rejected applications</p>
                    </div>
                  ) : (
                    rejectedApplications.map((app) => (
                      <ApplicationCard key={app.id} application={app} onUpdateStatus={handleUpdateApplicationStatus} />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function ApplicationCard({
  application,
  onUpdateStatus,
}: {
  application: any
  onUpdateStatus: (id: string, status: string) => void
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{application.instructor?.display_name}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                {application.instructor?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{application.instructor.location}</span>
                  </div>
                )}
                {application.instructor?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{application.instructor.email}</span>
                  </div>
                )}
                {application.instructor?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{application.instructor.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {application.instructor?.bio && (
              <p className="text-sm text-muted-foreground">{application.instructor.bio}</p>
            )}

            {application.instructor_profile && (
              <div className="space-y-2">
                {application.instructor_profile.years_experience && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Experience:</span>
                    <span className="text-muted-foreground">
                      {application.instructor_profile.years_experience} years
                    </span>
                  </div>
                )}
                {application.instructor_profile.hourly_rate_min && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Rate:</span>
                    <span className="text-muted-foreground">
                      ${application.instructor_profile.hourly_rate_min}-$
                      {application.instructor_profile.hourly_rate_max}/hour
                    </span>
                  </div>
                )}
                {application.instructor_profile.certifications &&
                  application.instructor_profile.certifications.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Certifications:</p>
                      <div className="flex flex-wrap gap-1">
                        {application.instructor_profile.certifications.map((cert: string) => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {application.cover_letter && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Cover Letter:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.cover_letter}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">Applied {formatRelativeTime(application.created_at)}</p>
          </div>

          <div className="flex md:flex-col gap-2">
            <Button variant="outline" size="sm" asChild className="flex-1 md:flex-initial bg-transparent">
              <Link href={`/instructors/${application.instructor?.id}`}>View Profile</Link>
            </Button>
            {application.status === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onUpdateStatus(application.id, "accepted")}
                  className="flex-1 md:flex-initial"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onUpdateStatus(application.id, "rejected")}
                  className="flex-1 md:flex-initial"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
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
