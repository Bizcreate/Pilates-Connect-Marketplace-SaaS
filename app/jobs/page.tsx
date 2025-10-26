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
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { mockCoverRequests } from "@/lib/mock-data"

type Job = {
  id: string
  title: string
  location: string
  job_type: string
  compensation_min: number | null
  compensation_max: number | null
  compensation_type: string | null
  created_at: string
  equipment: string[]
  certifications_required: string[]
  description: string
  studio: {
    display_name: string
    studio_profiles: {
      studio_name: string
    } | null
  } | null
  is_saved?: boolean
  is_mock?: boolean
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
    studio_profiles: {
      studio_name: string
    } | null
  } | null
}

const MOCK_JOBS: Job[] = [
  {
    id: "mock-1",
    title: "Senior Reformer Instructor - Full Time",
    location: "Melbourne CBD, VIC",
    job_type: "full-time",
    compensation_min: 65000,
    compensation_max: 75000,
    compensation_type: "salary",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    equipment: ["Reformer", "Mat"],
    certifications_required: ["Comprehensive Pilates Certification", "First Aid", "Insurance"],
    description:
      "We are seeking an experienced and passionate Senior Pilates Instructor to join our growing team. This full-time position offers the opportunity to work with a diverse clientele in our state-of-the-art studio located in the heart of Melbourne CBD.",
    studio: {
      display_name: "Elite Pilates Melbourne",
      studio_profiles: {
        studio_name: "Elite Pilates Melbourne",
      },
    },
    is_mock: true,
  },
  {
    id: "mock-2",
    title: "Part-Time Pilates Instructor - Evenings & Weekends",
    location: "Melbourne CBD, VIC",
    job_type: "part-time",
    compensation_min: 45,
    compensation_max: 60,
    compensation_type: "hourly",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    equipment: ["Reformer", "Mat", "Chair"],
    certifications_required: ["Mat Certification", "Reformer Certification", "Insurance"],
    description:
      "Elite Pilates Melbourne is looking for a qualified Pilates Instructor to teach evening and weekend classes. This is a perfect opportunity for someone looking to build their teaching hours or supplement their current schedule.",
    studio: {
      display_name: "Elite Pilates Melbourne",
      studio_profiles: {
        studio_name: "Elite Pilates Melbourne",
      },
    },
    is_mock: true,
  },
  {
    id: "mock-3",
    title: "Casual Instructor - Immediate Start",
    location: "Melbourne CBD, VIC",
    job_type: "casual",
    compensation_min: 50,
    compensation_max: 70,
    compensation_type: "per-class",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    equipment: ["Reformer", "Cadillac", "Chair", "Tower", "Mat"],
    certifications_required: ["Comprehensive Pilates Certification", "Insurance"],
    description:
      "We are building our casual instructor pool for class coverage and special workshops. This is an excellent opportunity for experienced instructors who want flexibility or are looking to gain more teaching experience.",
    studio: {
      display_name: "Elite Pilates Melbourne",
      studio_profiles: {
        studio_name: "Elite Pilates Melbourne",
      },
    },
    is_mock: true,
  },
  {
    id: "mock-4",
    title: "Temporary Instructor - 6 Month Maternity Cover",
    location: "Melbourne CBD, VIC",
    job_type: "temp",
    compensation_min: 50,
    compensation_max: 65,
    compensation_type: "hourly",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    equipment: ["Reformer", "Cadillac", "Chair", "Mat", "Barrel"],
    certifications_required: ["Comprehensive Pilates Certification", "First Aid", "Insurance"],
    description:
      "Elite Pilates Melbourne is seeking a qualified instructor for a 6-month temporary position to cover maternity leave. This is a fantastic opportunity to work in a premium studio with an established client base.",
    studio: {
      display_name: "Elite Pilates Melbourne",
      studio_profiles: {
        studio_name: "Elite Pilates Melbourne",
      },
    },
    is_mock: true,
  },
]

const MOCK_COVER_REQUESTS: CoverRequest[] = mockCoverRequests.map((cover) => ({
  id: cover.id,
  date: cover.date,
  start_time: cover.time,
  end_time: new Date(new Date(`${cover.date} ${cover.time}`).getTime() + 55 * 60 * 1000).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  class_type: cover.class_type,
  notes: cover.description,
  status: cover.status,
  created_at: cover.created_at,
  studio: {
    display_name: cover.studio_name,
    studio_profiles: {
      studio_name: cover.studio_name,
    },
  },
}))

export default function JobsPage() {
  const [showFilters, setShowFilters] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [coverRequests, setCoverRequests] = useState<CoverRequest[]>([])
  const [activeTab, setActiveTab] = useState<"jobs" | "covers">("jobs")
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const supabase = createBrowserClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)

      const [jobsResult, coversResult] = await Promise.all([
        supabase
          .from("jobs")
          .select(
            `
          *,
          studio:profiles!jobs_studio_id_fkey(
            display_name,
            studio_profiles(studio_name)
          )
        `,
          )
          .eq("status", "open")
          .order("created_at", { ascending: false }),
        supabase
          .from("cover_requests")
          .select(
            `
          *,
          studio:profiles!cover_requests_studio_id_fkey(
            display_name,
            studio_profiles(studio_name)
          )
        `,
          )
          .eq("status", "open")
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(20),
      ])

      let jobsToDisplay: Job[] = []

      if (jobsResult.error) {
        console.error("[v0] Error fetching jobs:", jobsResult.error)
        jobsToDisplay = MOCK_JOBS
      } else if (jobsResult.data && jobsResult.data.length > 0) {
        if (user) {
          const { data: savedJobs } = await supabase.from("saved_jobs").select("job_id").eq("user_id", user.id)

          const savedJobIds = new Set(savedJobs?.map((sj) => sj.job_id) || [])
          jobsToDisplay = jobsResult.data.map((job) => ({
            ...job,
            is_saved: savedJobIds.has(job.id),
          }))
        } else {
          jobsToDisplay = jobsResult.data
        }
      } else {
        jobsToDisplay = MOCK_JOBS
      }

      setJobs(jobsToDisplay)

      if (coversResult.error || !coversResult.data || coversResult.data.length === 0) {
        setCoverRequests(MOCK_COVER_REQUESTS)
      } else if (coversResult.data && coversResult.data.length > 0) {
        setCoverRequests(coversResult.data)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handleSaveJob = async (jobId: string, currentlySaved: boolean) => {
    const job = jobs.find((j) => j.id === jobId)
    if (job?.is_mock) {
      alert("Please sign up to save jobs and apply!")
      router.push("/auth/sign-up")
      return
    }

    if (!userId) {
      router.push("/auth/login")
      return
    }

    const supabase = createBrowserClient()

    if (currentlySaved) {
      await supabase.from("saved_jobs").delete().eq("user_id", userId).eq("job_id", jobId)
    } else {
      await supabase.from("saved_jobs").insert({ user_id: userId, job_id: jobId })
    }

    setJobs(jobs.map((job) => (job.id === jobId ? { ...job, is_saved: !currentlySaved } : job)))
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
                  {isLoading ? "Loading..." : `${jobs.length} jobs found`}
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
                  <p className="text-muted-foreground">Loading jobs...</p>
                </div>
              ) : activeTab === "jobs" ? (
                jobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground mb-4">No jobs found. Check back soon!</p>
                      <Button asChild>
                        <Link href="/studio/post-job">Post a Job</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => {
                      const studioName =
                        job.studio?.studio_profiles?.studio_name || job.studio?.display_name || "Studio"
                      const rate =
                        job.compensation_min && job.compensation_type
                          ? `$${job.compensation_min}${job.compensation_max ? `-$${job.compensation_max}` : ""}/${job.compensation_type}`
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
                                  {job.equipment && job.equipment.length > 0 && (
                                    <div>
                                      <span className="text-xs text-muted-foreground mr-2">Equipment:</span>
                                      <div className="inline-flex flex-wrap gap-1">
                                        {job.equipment.map((item) => (
                                          <Badge key={item} variant="outline" className="text-xs">
                                            {item}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {job.certifications_required && job.certifications_required.length > 0 && (
                                    <div>
                                      <span className="text-xs text-muted-foreground mr-2">Required:</span>
                                      <div className="inline-flex flex-wrap gap-1">
                                        {job.certifications_required.map((cert) => (
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
                                {job.is_mock ? (
                                  <Button className="flex-1 md:flex-initial" asChild>
                                    <Link href="/auth/sign-up">View Details</Link>
                                  </Button>
                                ) : (
                                  <Button className="flex-1 md:flex-initial" asChild>
                                    <Link href={`/jobs/${job.id}`}>View Details</Link>
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  className="flex-1 md:flex-initial bg-transparent"
                                  onClick={() => handleSaveJob(job.id, job.is_saved || false)}
                                >
                                  <Bookmark className={`h-4 w-4 mr-2 ${job.is_saved ? "fill-current" : ""}`} />
                                  {job.is_saved ? "Saved" : "Save"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )
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
                                  <span>{cover.studio?.display_name || "Location TBD"}</span>
                                </div>
                              </div>

                              {cover.notes && (
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{cover.notes}</p>
                              )}
                            </div>

                            <div className="flex md:flex-col gap-2">
                              <Button className="flex-1 md:flex-initial" asChild>
                                <Link href={`/cover-requests/${cover.id}`}>Accept Cover</Link>
                              </Button>
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

      <SiteFooter />
    </div>
  )
}
