"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Search, MapPin, Filter, Briefcase, Clock, DollarSign, Building2, Bookmark, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { acceptCoverRequest } from "@/app/actions/dashboard"
import { CoverRequestDialog } from "@/components/cover-request-dialog"

type Job = {
  id: string
  title: string
  location: string
  job_type: string
  hourly_rate_min: number | null
  hourly_rate_max: number | null
  created_at: string
  equipment_provided: string[]
  required_certifications: string[]
  description: string
  studio: {
    display_name: string
    location: string
    studio_profiles: {
      studio_name: string
    } | null
  } | null
  is_saved?: boolean
}

type CoverRequest = {
  id: string
  date: string
  start_time: string
  end_time: string
  class_type: string
  notes: string | null
  status: string
  created_at: string
  studio: {
    display_name: string
    location: string
    studio_profiles: {
      studio_name: string
    } | null
  } | null
}

export default function JobsPage() {
  const [showFilters, setShowFilters] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [coverRequests, setCoverRequests] = useState<CoverRequest[]>([])
  const [activeTab, setActiveTab] = useState<"jobs" | "covers">("jobs")
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [selectedCoverRequest, setSelectedCoverRequest] = useState<CoverRequest | null>(null)
  const [showCoverDialog, setShowCoverDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const supabase = createClient()

      console.log("[v0] Jobs page: Starting data fetch...")

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        console.log("[v0] Jobs page: User:", user ? `Logged in as ${user.id}` : "Not logged in")

        setUserId(user?.id || null)

        if (user) {
          const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()
          setUserType(profile?.user_type || null)
          console.log("[v0] Jobs page: User type:", profile?.user_type)
        }

        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select(
            `
            *,
            studio:profiles!jobs_studio_id_fkey(
              display_name,
              location,
              studio_profiles!inner(studio_name)
            )
          `,
          )
          .order("created_at", { ascending: false })

        console.log("[v0] Jobs page: Jobs query result:", {
          count: jobsData?.length || 0,
          error: jobsError?.message,
          sample: jobsData?.[0],
        })

        if (jobsError) {
          console.error("[v0] Error fetching jobs:", jobsError)
          setJobs([])
        } else {
          let jobsToDisplay: Job[] = jobsData || []

          if (user && userType === "instructor") {
            const { data: savedJobs } = await supabase.from("saved_jobs").select("job_id").eq("user_id", user.id)
            const savedJobIds = new Set(savedJobs?.map((sj) => sj.job_id) || [])
            jobsToDisplay = jobsData.map((job) => ({
              ...job,
              is_saved: savedJobIds.has(job.id),
            }))
          }

          setJobs(jobsToDisplay)
        }

        const { data: coversData, error: coversError } = await supabase
          .from("cover_requests")
          .select(
            `
            *,
            studio:profiles!cover_requests_studio_id_fkey(
              display_name,
              location,
              studio_profiles!inner(studio_name)
            )
          `,
          )
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(20)

        console.log("[v0] Jobs page: Cover requests query result:", {
          count: coversData?.length || 0,
          error: coversError?.message,
          sample: coversData?.[0],
        })

        if (coversError) {
          console.error("[v0] Error fetching covers:", coversError)
          setCoverRequests([])
        } else {
          setCoverRequests(coversData || [])
        }
      } catch (error) {
        console.error("[v0] Error in fetchData:", error)
        setJobs([])
        setCoverRequests([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSaveJob = async (jobId: string, currentlySaved: boolean) => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    if (userType !== "instructor") {
      toast({
        title: "Studios cannot save jobs",
        description: "Only instructors can save jobs. Studios can post jobs from their dashboard.",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()

    try {
      if (currentlySaved) {
        const { error } = await supabase.from("saved_jobs").delete().eq("user_id", userId).eq("job_id", jobId)
        if (error) throw error
      } else {
        const { error } = await supabase.from("saved_jobs").insert({ user_id: userId, job_id: jobId })
        if (error) throw error
      }

      setJobs(jobs.map((job) => (job.id === jobId ? { ...job, is_saved: !currentlySaved } : job)))

      toast({
        title: currentlySaved ? "Job unsaved" : "Job saved!",
        description: currentlySaved ? "Job removed from your saved list" : "Job added to your saved list",
      })
    } catch (error) {
      console.error("Error saving job:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save job",
        variant: "destructive",
      })
    }
  }

  const handleAcceptCover = async () => {
    if (!selectedCoverRequest || !userId) return

    if (userType !== "instructor") {
      toast({
        title: "Studios cannot accept covers",
        description: "Only instructors can accept cover requests.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await acceptCoverRequest(selectedCoverRequest.id)
      if (result.success) {
        toast({
          title: "Cover request accepted!",
          description: "The studio will be notified. Check your dashboard for details.",
        })
        // Refresh cover requests
        const supabase = createClient()
        const { data } = await supabase
          .from("cover_requests")
          .select(
            `
            *,
            studio:profiles!cover_requests_studio_id_fkey(
              display_name,
              location,
              studio_profiles!inner(studio_name)
            )
          `,
          )
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(20)
        setCoverRequests(data || [])
        setShowCoverDialog(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to accept cover request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error accepting cover:", error)
      toast({
        title: "Error",
        description: "Failed to accept cover request",
        variant: "destructive",
      })
    }
  }

  const jobTypes = ["Full-time", "Part-time", "Casual", "Contract"]
  const equipment = ["Reformer", "Cadillac", "Chair", "Tower", "Mat", "Barrel"]

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse Opportunities</h1>
            <p className="text-muted-foreground">Find permanent positions and urgent cover requests</p>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "jobs" ? "default" : "outline"}
              onClick={() => setActiveTab("jobs")}
              className="flex-1 sm:flex-initial"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Permanent Jobs ({jobs.length})
            </Button>
            <Button
              variant={activeTab === "covers" ? "default" : "outline"}
              onClick={() => setActiveTab("covers")}
              className="flex-1 sm:flex-initial"
            >
              <Clock className="h-4 w-4 mr-2" />
              Urgent Covers ({coverRequests.length})
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 border rounded-md">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by job title, studio, or keyword..."
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 border rounded-md">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Location" className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                </div>
                <Button size="lg">Search</Button>
                <Button size="lg" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-4 gap-6">
            {showFilters && (
              <aside className="lg:col-span-1 space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-base mb-4">Job Type</h3>
                      <div className="space-y-3">
                        {jobTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox id={`type-${type}`} />
                            <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Equipment Required</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {equipment.map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`equipment-${item}`} />
                            <Label htmlFor={`equipment-${item}`} className="font-normal cursor-pointer text-sm">
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Posted Within</h3>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any time</SelectItem>
                          <SelectItem value="24h">Last 24 hours</SelectItem>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" className="w-full bg-transparent">
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </aside>
            )}

            <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {isLoading
                    ? "Loading..."
                    : activeTab === "jobs"
                      ? `${jobs.length} jobs found`
                      : `${coverRequests.length} cover requests found`}
                </p>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="rate-high">Highest Rate</SelectItem>
                    <SelectItem value="rate-low">Lowest Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : activeTab === "jobs" ? (
                jobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No jobs found. Check back soon!</p>
                      {userType === "studio" && (
                        <Button asChild>
                          <Link href="/studio/post-job">Post a Job</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => {
                      const studioName =
                        job.studio?.studio_profiles?.studio_name || job.studio?.display_name || "Studio"
                      const rate = job.hourly_rate_min
                        ? `$${job.hourly_rate_min}${job.hourly_rate_max ? `-$${job.hourly_rate_max}` : ""}/hour`
                        : "Rate TBD"

                      return (
                        <Card key={job.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Building2 className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                                    <p className="text-muted-foreground font-medium">{studioName}</p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{job.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
                                    <span className="capitalize">{job.job_type}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="font-medium text-foreground">{rate}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>Posted {formatRelativeTime(job.created_at)}</span>
                                  </div>
                                </div>

                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

                                <div className="space-y-2">
                                  {job.equipment_provided && job.equipment_provided.length > 0 && (
                                    <div>
                                      <span className="text-xs text-muted-foreground mr-2">Equipment:</span>
                                      <div className="inline-flex flex-wrap gap-1">
                                        {job.equipment_provided.map((item) => (
                                          <Badge key={item} variant="outline" className="text-xs">
                                            {item}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {job.required_certifications && job.required_certifications.length > 0 && (
                                    <div>
                                      <span className="text-xs text-muted-foreground mr-2">Required:</span>
                                      <div className="inline-flex flex-wrap gap-1">
                                        {job.required_certifications.map((cert) => (
                                          <Badge key={cert} variant="secondary" className="text-xs">
                                            {cert}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex md:flex-col gap-2">
                                <Button className="flex-1 md:flex-initial" asChild>
                                  <Link href={`/jobs/${job.id}`}>View Details</Link>
                                </Button>
                                {userType === "instructor" && (
                                  <Button
                                    variant="outline"
                                    className="flex-1 md:flex-initial bg-transparent"
                                    onClick={() => handleSaveJob(job.id, job.is_saved || false)}
                                  >
                                    <Bookmark className={`h-4 w-4 mr-2 ${job.is_saved ? "fill-current" : ""}`} />
                                    {job.is_saved ? "Saved" : "Save"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )
              ) : coverRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No urgent cover requests available</p>
                    {userType === "studio" && (
                      <Button asChild>
                        <Link href="/studio/request-cover">Request Cover</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {coverRequests.map((cover) => {
                    const studioName =
                      cover.studio?.studio_profiles?.studio_name || cover.studio?.display_name || "Studio"
                    const coverDate = new Date(cover.date).toLocaleDateString("en-AU", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                    const isUrgent = new Date(cover.date).getTime() - new Date().getTime() < 48 * 60 * 60 * 1000

                    return (
                      <Card key={cover.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <Clock className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">{cover.class_type} Class Cover</h3>
                                    {isUrgent && (
                                      <Badge variant="destructive" className="text-xs">
                                        Urgent
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground font-medium">{studioName}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-medium text-foreground">{coverDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {cover.start_time} - {cover.end_time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{cover.studio?.location || "Location TBD"}</span>
                                </div>
                              </div>

                              {cover.notes && (
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{cover.notes}</p>
                              )}
                            </div>

                            <div className="flex md:flex-col gap-2">
                              {userType === "instructor" ? (
                                <Button
                                  className="flex-1 md:flex-initial"
                                  onClick={() => {
                                    setSelectedCoverRequest(cover)
                                    setShowCoverDialog(true)
                                  }}
                                >
                                  Accept Cover
                                </Button>
                              ) : (
                                <Button className="flex-1 md:flex-initial" asChild>
                                  <Link href="/auth/sign-up">Sign Up to Accept</Link>
                                </Button>
                              )}
                              <Button variant="outline" className="flex-1 md:flex-initial bg-transparent">
                                <Bookmark className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedCoverRequest && (
        <CoverRequestDialog
          request={selectedCoverRequest}
          open={showCoverDialog}
          onOpenChange={setShowCoverDialog}
          onAccept={handleAcceptCover}
        />
      )}

      <SiteFooter />
    </div>
  )
}
