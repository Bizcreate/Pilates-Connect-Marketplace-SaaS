import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MapPin, Briefcase, DollarSign, Calendar, Clock, CheckCircle2, Building2, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  console.log("[v0] Job detail page - ID:", id)

  const supabase = await createClient()

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(`
      *,
      studio:profiles!jobs_studio_id_fkey(
        display_name,
        location,
        studio_profiles(studio_name, website, social_links)
      )
    `)
    .eq("id", id)
    .maybeSingle()

  console.log("[v0] Job query result:", { job, error: jobError })

  if (jobError || !job) {
    console.error("[v0] Error fetching job or job not found:", jobError)
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let hasApplied = false
  let userType: string | null = null

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()
    userType = profile?.user_type || null

    if (userType === "instructor") {
      const { data: application } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", id)
        .eq("instructor_id", user.id)
        .maybeSingle()

      hasApplied = !!application
    }
  }

  const studioName = job.studio?.studio_profiles?.studio_name || job.studio?.display_name || "Unknown Studio"

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-5xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-3xl">{job.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">{studioName}</span>
                        <span>•</span>
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm capitalize">{job.job_type}</span>
                    </div>
                    {job.hourly_rate_min && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          ${job.hourly_rate_min}
                          {job.hourly_rate_max && `-$${job.hourly_rate_max}`}/hour
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

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Job Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Requirements</h3>
                    <div className="space-y-3">
                      {job.equipment_provided && job.equipment_provided.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Equipment Provided:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.equipment_provided.map((item: string) => (
                              <Badge key={item} variant="outline">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {job.required_certifications && job.required_certifications.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Required Certifications:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.required_certifications.map((cert: string) => (
                              <Badge key={cert} variant="outline">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {job.required_experience && (
                        <div>
                          <p className="text-sm font-medium mb-2">Experience Required:</p>
                          <Badge variant="secondary">{job.required_experience}+ years</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!user ? (
                    <>
                      <p className="text-sm text-muted-foreground">Sign in to apply for this job</p>
                      <Button className="w-full" asChild>
                        <Link href="/auth/login">Sign In</Link>
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href="/auth/sign-up">Create Account</Link>
                      </Button>
                    </>
                  ) : userType === "studio" ? (
                    <p className="text-sm text-muted-foreground">
                      Studio accounts cannot apply to jobs. Switch to an instructor account to apply.
                    </p>
                  ) : hasApplied ? (
                    <>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Application submitted</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You&apos;ve already applied to this position. The studio will review your application and
                        contact you if interested.
                      </p>
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href="/instructor/dashboard">View My Applications</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Submit your application to express interest in this position
                      </p>
                      <Button className="w-full" asChild>
                        <Link href={`/jobs/${id}/apply`}>Apply Now</Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About {studioName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.studio?.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{job.studio.location}</span>
                    </div>
                  )}
                  {job.studio?.studio_profiles?.website && (
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <a href={job.studio.studio_profiles.website} target="_blank" rel="noopener noreferrer">
                        Visit Website
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
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
