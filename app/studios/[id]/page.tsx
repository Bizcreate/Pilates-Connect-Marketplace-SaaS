"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { StartConversationButton } from "@/components/start-conversation-button"
import { MapPin, Phone, Mail, Globe, Briefcase, Calendar } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import Image from "next/image"

export default function StudioPublicProfilePage() {
  const params = useParams()
  const studioId = params.id as string
  const [studio, setStudio] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadStudio() {
      console.log("[v0] Loading studio profile:", studioId)

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", studioId)
        .eq("user_type", "studio")
        .maybeSingle()

      if (!profileData) {
        console.log("[v0] Studio not found")
        setLoading(false)
        return
      }

      const { data: studioData } = await supabase.from("studio_profiles").select("*").eq("id", studioId).maybeSingle()

      const mergedStudio = {
        ...profileData,
        studio_name: studioData?.studio_name || profileData.display_name,
        description: studioData?.description || profileData.bio,
        address: studioData?.address,
        suburb: studioData?.suburb,
        state: studioData?.state,
        postcode: studioData?.postcode,
        equipment: studioData?.equipment,
        social_links: studioData?.social_links,
      }

      console.log("[v0] Loaded studio:", mergedStudio)
      setStudio(mergedStudio)

      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("studio_id", studioId)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(5)

      console.log("[v0] Found open jobs:", jobsData?.length || 0)
      setJobs(jobsData || [])
      setLoading(false)
    }

    if (studioId) {
      loadStudio()
    }
  }, [studioId, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading studio profile...</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (!studio) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Studio Not Found</h1>
            <p className="text-muted-foreground">This studio profile does not exist.</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        {/* Hero Section */}
        <div className="bg-primary/5 border-b">
          <div className="container py-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                {studio.avatar_url ? (
                  <Image
                    src={studio.avatar_url || "/placeholder.svg"}
                    alt={studio.studio_name || studio.display_name}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-[120px] w-[120px] rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{studio.studio_name || studio.display_name}</h1>
                {studio.location && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{studio.location}</span>
                  </div>
                )}
                <p className="text-lg mb-6">{studio.description || "No description provided"}</p>
                <StartConversationButton userId={studioId} />
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              {studio.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>About {studio.studio_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{studio.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Equipment Available */}
              {studio.equipment && studio.equipment.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Available</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {studio.equipment.map((item: string, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Job Openings */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Job Openings</CardTitle>
                  <CardDescription>Available positions at this studio</CardDescription>
                </CardHeader>
                <CardContent>
                  {jobs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No active job postings</p>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <Badge variant="secondary" className="capitalize">
                              {job.job_type}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            {job.start_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Start: {new Date(job.start_date).toLocaleDateString()}
                              </div>
                            )}
                            {job.hourly_rate_min && (
                              <span className="font-medium">
                                ${job.hourly_rate_min}
                                {job.hourly_rate_max && `-$${job.hourly_rate_max}`}/hr
                              </span>
                            )}
                          </div>
                          <p className="text-sm line-clamp-2 mb-3">{job.description}</p>
                          <Button size="sm" asChild>
                            <a href={`/jobs/${job.id}`}>View Details & Apply</a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {studio.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        <div>{studio.address}</div>
                        <div>
                          {studio.suburb}, {studio.state} {studio.postcode}
                        </div>
                      </div>
                    </div>
                  )}
                  {studio.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${studio.phone}`} className="text-sm hover:underline">
                        {studio.phone}
                      </a>
                    </div>
                  )}
                  {studio.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${studio.email}`} className="text-sm hover:underline">
                        {studio.email}
                      </a>
                    </div>
                  )}
                  {studio.social_links?.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={studio.social_links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Jobs</span>
                    <Badge variant="secondary">{jobs.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="text-sm font-medium">{studio.suburb || studio.location || "Not specified"}</span>
                  </div>
                  {studio.equipment && studio.equipment.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Equipment</span>
                      <span className="text-sm font-medium">{studio.equipment.length} types</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Interested in working here?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send a message to introduce yourself or apply for one of their open positions.
                  </p>
                  <StartConversationButton userId={studioId} className="w-full" />
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
