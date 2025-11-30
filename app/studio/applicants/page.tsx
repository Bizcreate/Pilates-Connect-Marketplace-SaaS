import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/server"
import { FileDown, Eye, Check, X, Briefcase, MapPin, Calendar } from "lucide-react"
import Link from "next/link"

export default async function ApplicantsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all applications for this studio's jobs
  const { data: applications, error } = await supabase
    .from("job_applications")
    .select(`
      *,
      instructor:profiles!job_applications_instructor_id_fkey(
        id,
        display_name,
        avatar_url,
        location
      ),
      instructor_profile:instructor_profiles!job_applications_instructor_id_fkey(
        years_experience,
        hourly_rate_min,
        hourly_rate_max,
        certifications,
        equipment
      ),
      job:jobs!job_applications_job_id_fkey(
        id,
        title,
        job_type,
        location,
        status,
        studio_id
      )
    `)
    .eq("job.studio_id", user.id)
    .order("created_at", { ascending: false })

  console.log("[v0] Fetched applications:", applications?.length || 0)
  console.log("[v0] Applications error:", error)

  const pendingApplications = applications?.filter((app) => app.status === "pending") || []
  const reviewedApplications = applications?.filter((app) => app.status === "reviewed") || []
  const acceptedApplications = applications?.filter((app) => app.status === "accepted") || []
  const rejectedApplications = applications?.filter((app) => app.status === "rejected") || []

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Job Applicants</h1>
            <p className="text-muted-foreground mt-1">Review and manage instructor applications</p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed ({reviewedApplications.length})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({acceptedApplications.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedApplications.length})</TabsTrigger>
            </TabsList>

            {["pending", "reviewed", "accepted", "rejected"].map((status) => {
              const apps =
                status === "pending"
                  ? pendingApplications
                  : status === "reviewed"
                    ? reviewedApplications
                    : status === "accepted"
                      ? acceptedApplications
                      : rejectedApplications

              return (
                <TabsContent key={status} value={status} className="space-y-4">
                  {apps.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No {status} applications</p>
                      </CardContent>
                    </Card>
                  ) : (
                    apps.map((app) => (
                      <Card key={app.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={app.instructor?.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>{app.instructor?.display_name?.[0] || "I"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-xl">{app.instructor?.display_name}</CardTitle>
                                <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {app.instructor?.location || "Location not specified"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
                                    {app.instructor_profile?.years_experience || 0}+ years exp
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Applied {new Date(app.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                app.status === "accepted"
                                  ? "default"
                                  : app.status === "rejected"
                                    ? "destructive"
                                    : app.status === "reviewed"
                                      ? "secondary"
                                      : "outline"
                              }
                            >
                              {app.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Applied for:</h4>
                            <p className="text-sm text-muted-foreground">
                              {app.job?.title} • {app.job?.job_type} • {app.job?.location}
                            </p>
                          </div>

                          {app.cover_letter && (
                            <div>
                              <h4 className="font-semibold mb-2">Cover Letter:</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.cover_letter}</p>
                            </div>
                          )}

                          {(app.cv_url || app.demo_files) && (
                            <div>
                              <h4 className="font-semibold mb-2">Attachments:</h4>
                              <div className="flex flex-wrap gap-2">
                                {app.cv_url && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={app.cv_url} target="_blank" rel="noopener noreferrer">
                                      <FileDown className="h-4 w-4 mr-2" />
                                      Download CV
                                    </a>
                                  </Button>
                                )}
                                {app.demo_files &&
                                  Array.isArray(app.demo_files) &&
                                  app.demo_files.length > 0 &&
                                  app.demo_files.map((file: string, idx: number) => (
                                    <Button key={idx} variant="outline" size="sm" asChild>
                                      <a href={file} target="_blank" rel="noopener noreferrer">
                                        <Eye className="h-4 w-4 mr-2" />
                                        Demo {idx + 1}
                                      </a>
                                    </Button>
                                  ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-4 border-t">
                            <Button asChild variant="outline">
                              <Link href={`/find-instructors/${app.instructor_id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Full Profile
                              </Link>
                            </Button>

                            {app.status === "pending" && (
                              <>
                                <form action={`/api/applications/${app.id}/update-status`} method="POST">
                                  <input type="hidden" name="status" value="accepted" />
                                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                    <Check className="h-4 w-4 mr-2" />
                                    Accept
                                  </Button>
                                </form>
                                <form action={`/api/applications/${app.id}/update-status`} method="POST">
                                  <input type="hidden" name="status" value="rejected" />
                                  <Button type="submit" variant="destructive">
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </form>
                              </>
                            )}

                            <Button asChild>
                              <Link href={`/messages?conversation=${app.instructor_id}`}>Contact Instructor</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
