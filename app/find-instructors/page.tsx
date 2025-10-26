"use client"

import { useState, useEffect } from "react"
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
import { Search, MapPin, Filter, Award, Calendar, Lock, DollarSign } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

type Instructor = {
  id: string
  display_name: string
  location: string | null
  bio: string | null
  avatar_url: string | null
  instructor_profile: {
    years_experience: number | null
    certifications: string[]
    equipment: string[]
    specializations: string[]
    hourly_rate_min: number | null
    hourly_rate_max: number | null
    availability_status: string | null
  } | null
  availability_slots: {
    id: string
    start_time: string
    end_time: string
    is_available: boolean
  }[]
}

export default function FindInstructorsPage() {
  const [showFilters, setShowFilters] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isStudio, setIsStudio] = useState(false)
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()
        setIsSignedIn(true)
        setIsStudio(profile?.user_type === "studio")
      }

      const { data: instructorsData, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          instructor_profile:instructor_profiles(*),
          availability_slots(
            id,
            start_time,
            end_time,
            is_available
          )
        `,
        )
        .eq("user_type", "instructor")
        .order("created_at", { ascending: false })
        .limit(20)

      if (instructorsData && !error) {
        setInstructors(instructorsData)
      }

      setIsLoading(false)
    }
    fetchData()
  }, [])

  // Mock data - will be replaced with real data from database
  const equipment = ["Reformer", "Cadillac", "Chair", "Tower", "Mat", "Barrel"]
  const certificationLevels = ["Mat Certified", "Reformer Certified", "Comprehensive Certified"]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Pilates Instructors</h1>
            <p className="text-muted-foreground">
              Browse certified instructors and find the perfect match for your studio
            </p>
            {!isStudio && (
              <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm">
                  <strong>Sign in as a studio</strong> to view full instructor profiles and contact details.{" "}
                  <Link href="/auth/sign-up" className="underline font-medium">
                    Create an account
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 border rounded-md">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, certification, or specialty..."
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
            {/* Filters Sidebar */}
            {showFilters && (
              <aside className="lg:col-span-1 space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-base mb-4">Availability</h3>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="available">Available Now</SelectItem>
                          <SelectItem value="limited">Limited Availability</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Experience Level</h3>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="entry">Entry Level (0-1 years)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                          <SelectItem value="experienced">Experienced (3-5 years)</SelectItem>
                          <SelectItem value="senior">Senior (5+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Equipment Experience</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {equipment.map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <Label htmlFor={`filter-${item}`} className="font-normal cursor-pointer text-sm">
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Certification Level</h3>
                      <div className="space-y-3">
                        {certificationLevels.map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`cert-filter-${item}`} />
                            <Label htmlFor={`cert-filter-${item}`} className="font-normal cursor-pointer">
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-base mb-4">Hourly Rate</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Min:</span>
                          <span className="font-medium">$0</span>
                        </div>
                        <Input type="range" min="0" max="100" step="5" className="w-full" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Max:</span>
                          <span className="font-medium">$100+</span>
                        </div>
                        <Input type="range" min="0" max="100" step="5" className="w-full" />
                      </div>
                    </div>

                    <Button variant="outline" className="w-full bg-transparent">
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </aside>
            )}

            {/* Instructor Grid */}
            <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Loading..." : `${instructors.length} instructors found`}
                </p>
                <Select defaultValue="rating">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                    <SelectItem value="rate-low">Rate: Low to High</SelectItem>
                    <SelectItem value="rate-high">Rate: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading instructors...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {instructors.map((instructor) => {
                    const profile = instructor.instructor_profile
                    const rateRange =
                      profile?.hourly_rate_min && profile?.hourly_rate_max
                        ? `$${profile.hourly_rate_min}-${profile.hourly_rate_max}/class`
                        : "Rate TBD"
                    const availabilityStatus = profile?.availability_status || "Unknown"
                    const upcomingSlots = instructor.availability_slots
                      ?.filter((slot) => slot.is_available && new Date(slot.start_time) > new Date())
                      .slice(0, 3)

                    return (
                      <Card key={instructor.id} className="hover:shadow-lg transition-shadow relative">
                        {!isStudio && (
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/80 backdrop-blur-[2px] z-10 rounded-lg flex items-end justify-center pb-8">
                            <div className="text-center p-6 bg-background/95 rounded-lg border shadow-lg max-w-sm">
                              <Lock className="h-10 w-10 text-primary mx-auto mb-3" />
                              <h3 className="font-semibold mb-2">Unlock Full Access</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Sign in as a studio to view contact details and message instructors
                              </p>
                              <Button asChild className="w-full">
                                <Link href="/auth/sign-up">Create Studio Account</Link>
                              </Button>
                            </div>
                          </div>
                        )}
                        <CardContent className="p-6">
                          <div className="flex gap-4 mb-4">
                            <img
                              src={instructor.avatar_url || "/placeholder.svg?height=80&width=80"}
                              alt={instructor.display_name}
                              className="h-20 w-20 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h3 className="font-semibold text-lg">{instructor.display_name}</h3>
                                <Badge
                                  variant={availabilityStatus === "available" ? "default" : "secondary"}
                                  className="text-xs capitalize"
                                >
                                  {availabilityStatus}
                                </Badge>
                              </div>
                              {instructor.location && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <MapPin className="h-3 w-3" />
                                  <span>{instructor.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {instructor.bio && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{instructor.bio}</p>
                          )}

                          {upcomingSlots && upcomingSlots.length > 0 && (
                            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Next Available:</p>
                              <div className="space-y-1">
                                {upcomingSlots.map((slot) => (
                                  <div key={slot.id} className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-3 w-3 text-primary" />
                                    <span>
                                      {new Date(slot.start_time).toLocaleDateString("en-AU", {
                                        month: "short",
                                        day: "numeric",
                                      })}{" "}
                                      at{" "}
                                      {new Date(slot.start_time).toLocaleTimeString("en-AU", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-3 mb-4">
                            {profile?.years_experience && (
                              <div className="flex items-center gap-2 text-sm">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Experience:</span>
                                <span className="font-medium">{profile.years_experience}+ years</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Rate:</span>
                              <span className="font-medium">{rateRange}</span>
                            </div>
                          </div>

                          {profile?.certifications && profile.certifications.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs text-muted-foreground mb-2">Certifications:</p>
                              <div className="flex flex-wrap gap-1">
                                {profile.certifications.map((cert) => (
                                  <Badge key={cert} variant="outline" className="text-xs">
                                    {cert}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {profile?.specializations && profile.specializations.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs text-muted-foreground mb-2">Specialties:</p>
                              <div className="flex flex-wrap gap-1">
                                {profile.specializations.map((specialty) => (
                                  <Badge key={specialty} variant="secondary" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <Button className="w-full" asChild>
                            <Link href={`/instructors/${instructor.id}`}>View Profile</Link>
                          </Button>
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
