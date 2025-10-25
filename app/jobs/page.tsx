"use client"

import { useState } from "react"
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
import { Search, MapPin, Filter, Briefcase, Clock, DollarSign, Building2 } from "lucide-react"

export default function JobsPage() {
  const [showFilters, setShowFilters] = useState(true)

  // Mock data - will be replaced with real data from database
  const jobs = [
    {
      id: 1,
      title: "Reformer Pilates Instructor",
      studio: "Flow Pilates Studio",
      location: "Bondi, NSW",
      type: "Part-time",
      rate: "$60-75/class",
      posted: "2 days ago",
      equipment: ["Reformer", "Mat"],
      certifications: ["Reformer Certified"],
      description: "Seeking an experienced Reformer instructor for morning and evening classes...",
    },
    {
      id: 2,
      title: "Mat Pilates Teacher - Weekend Classes",
      studio: "Core Strength Pilates",
      location: "Surry Hills, NSW",
      type: "Casual",
      rate: "$50-65/class",
      posted: "1 week ago",
      equipment: ["Mat"],
      certifications: ["Mat Certified"],
      description: "Looking for an energetic Mat Pilates instructor for weekend group classes...",
    },
    {
      id: 3,
      title: "Senior Pilates Instructor (Comprehensive)",
      studio: "Bondi Wellness Center",
      location: "Bondi, NSW",
      type: "Full-time",
      rate: "$70-90/class",
      posted: "3 days ago",
      equipment: ["Reformer", "Cadillac", "Chair", "Tower"],
      certifications: ["Comprehensive Certified"],
      description: "Premium studio seeking comprehensive certified instructor for all apparatus...",
    },
    {
      id: 4,
      title: "Pre/Postnatal Pilates Specialist",
      studio: "Mama Movement Studio",
      location: "Manly, NSW",
      type: "Part-time",
      rate: "$65-80/class",
      posted: "5 days ago",
      equipment: ["Reformer", "Mat"],
      certifications: ["Pre/Postnatal Certified", "Reformer Certified"],
      description: "Specialized studio focused on pre and postnatal Pilates needs experienced instructor...",
    },
  ]

  const jobTypes = ["Full-time", "Part-time", "Casual", "Contract"]
  const equipment = ["Reformer", "Cadillac", "Chair", "Tower", "Mat", "Barrel"]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse Pilates Jobs</h1>
            <p className="text-muted-foreground">Find your next opportunity at top Pilates studios across Australia</p>
          </div>

          {/* Search Bar */}
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
            {/* Filters Sidebar */}
            {showFilters && (
              <aside className="lg:col-span-1 space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Job Type</h3>
                      <div className="space-y-2">
                        {jobTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox id={`type-${type}`} />
                            <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer text-sm">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Equipment Required</h3>
                      <div className="space-y-2">
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

                    <div>
                      <h3 className="font-semibold mb-3">Posted Within</h3>
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

            {/* Jobs List */}
            <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">{jobs.length} jobs found</p>
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

              <div className="space-y-4">
                {jobs.map((job) => (
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
                              <p className="text-muted-foreground font-medium">{job.studio}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{job.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium text-foreground">{job.rate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Posted {job.posted}</span>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

                          <div className="space-y-2">
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
                            <div>
                              <span className="text-xs text-muted-foreground mr-2">Required:</span>
                              <div className="inline-flex flex-wrap gap-1">
                                {job.certifications.map((cert) => (
                                  <Badge key={cert} variant="secondary" className="text-xs">
                                    {cert}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex md:flex-col gap-2">
                          <Button className="flex-1 md:flex-initial" asChild>
                            <Link href={`/jobs/${job.id}`}>View Details</Link>
                          </Button>
                          <Button variant="outline" className="flex-1 md:flex-initial bg-transparent">
                            Save
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
