"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MapPin, Star, Award, Lock, Calendar, Clock, DollarSign } from "lucide-react"

const MOCK_INSTRUCTORS = [
  {
    id: "1",
    name: "S...l",
    location: "Bondi, NSW",
    rating: 4.9,
    reviewCount: 28,
    bio: "Passionate Pilates instructor with comprehensive certifications and specializations in prenatal care.",
    experience: "10 years",
    hourlyRate: 80,
    image: "/woman-instructor.png",
    certifications: ["Reformer", "Mat", "Prenatal"],
    availability: "Next available: Tomorrow",
  },
  {
    id: "2",
    name: "J...n",
    location: "Surry Hills, NSW",
    rating: 4.8,
    reviewCount: 35,
    bio: "Former athlete turned Pilates instructor, focusing on performance enhancement and injury prevention.",
    experience: "8 years",
    hourlyRate: 75,
    image: "/man-instructor.png",
    certifications: ["Reformer", "Cadillac", "Sports"],
    availability: "Next available: Today",
  },
  {
    id: "3",
    name: "E...r",
    location: "Paddington, NSW",
    rating: 5.0,
    reviewCount: 42,
    bio: "Specialized in rehabilitation and therapeutic Pilates with a focus on chronic pain management.",
    experience: "12 years",
    hourlyRate: 90,
    image: "/woman-pilates.jpg",
    certifications: ["Reformer", "Mat", "Rehabilitation"],
    availability: "Next available: This week",
  },
  {
    id: "4",
    name: "M...z",
    location: "Newtown, NSW",
    rating: 4.7,
    reviewCount: 19,
    bio: "Dynamic instructor specializing in contemporary Pilates and functional movement patterns.",
    experience: "6 years",
    hourlyRate: 70,
    image: "/fit-man-gym.png",
    certifications: ["Reformer", "Mat", "Functional"],
    availability: "Next available: Tomorrow",
  },
]

const MOCK_COVER_REQUESTS = [
  {
    id: "1",
    studio: "P...s S...o",
    location: "Bondi Beach, NSW",
    date: "Tomorrow",
    time: "9:00 AM - 10:00 AM",
    classType: "Reformer Pilates",
    rate: "$85/hour",
    urgency: "Urgent",
    requirements: ["Reformer Certified", "Mat Certified"],
    image: "/bright-pilates-studio.png",
  },
  {
    id: "2",
    studio: "C...e W...s",
    location: "Surry Hills, NSW",
    date: "Today",
    time: "6:00 PM - 7:00 PM",
    classType: "Mat Pilates",
    rate: "$75/hour",
    urgency: "Very Urgent",
    requirements: ["Mat Certified"],
    image: "/modern-studio.jpg",
  },
  {
    id: "3",
    studio: "F...w P...s",
    location: "Paddington, NSW",
    date: "This Week",
    time: "10:00 AM - 11:00 AM",
    classType: "Prenatal Pilates",
    rate: "$90/hour",
    urgency: "Moderate",
    requirements: ["Prenatal Certified", "Reformer Certified"],
    image: "/bright-pilates-studio.png",
  },
  {
    id: "4",
    studio: "M...n M...t",
    location: "Manly, NSW",
    date: "Tomorrow",
    time: "7:00 AM - 8:00 AM",
    classType: "Athletic Pilates",
    rate: "$80/hour",
    urgency: "Urgent",
    requirements: ["Sports Certified", "Reformer Certified"],
    image: "/modern-studio.jpg",
  },
]

export default function FindInstructorsPage() {
  const [sortBy, setSortBy] = useState("rating")
  const [maxRate, setMaxRate] = useState([100])
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {activeTab === "covers" ? "Available Cover Requests" : "Find Pilates Instructors"}
            </h1>
            <p className="text-muted-foreground">
              {activeTab === "covers"
                ? "Browse urgent cover requests from studios needing instructors"
                : "Browse certified instructors available for classes and cover work"}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-6">
                <h2 className="font-semibold mb-4">Filters</h2>

                <div className="space-y-6">
                  <div>
                    <Label>Location</Label>
                    <Input placeholder="Enter suburb..." className="mt-2" />
                  </div>

                  {activeTab === "all" && (
                    <>
                      <div>
                        <Label>Experience Level</Label>
                        <Select>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Any experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">0-3 years</SelectItem>
                            <SelectItem value="intermediate">4-7 years</SelectItem>
                            <SelectItem value="advanced">8-12 years</SelectItem>
                            <SelectItem value="expert">12+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Availability</Label>
                        <Select>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Any time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Available Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {activeTab === "covers" && (
                    <div>
                      <Label>Urgency</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="All urgencies" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Very Urgent</SelectItem>
                          <SelectItem value="moderate">Urgent</SelectItem>
                          <SelectItem value="low">Moderate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label className="mb-3 block">Certifications</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="reformer" />
                        <label htmlFor="reformer" className="text-sm cursor-pointer">
                          Reformer
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="mat" />
                        <label htmlFor="mat" className="text-sm cursor-pointer">
                          Mat
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cadillac" />
                        <label htmlFor="cadillac" className="text-sm cursor-pointer">
                          Cadillac
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="prenatal" />
                        <label htmlFor="prenatal" className="text-sm cursor-pointer">
                          Prenatal
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="sports" />
                        <label htmlFor="sports" className="text-sm cursor-pointer">
                          Sports
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Specializations</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="rehab" />
                        <label htmlFor="rehab" className="text-sm cursor-pointer">
                          Rehabilitation
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="classical" />
                        <label htmlFor="classical" className="text-sm cursor-pointer">
                          Classical
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="athletic" />
                        <label htmlFor="athletic" className="text-sm cursor-pointer">
                          Athletic
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Max Rate: ${maxRate[0]}+</Label>
                    <Slider value={maxRate} onValueChange={setMaxRate} max={150} step={5} className="mt-4" />
                  </div>

                  <Button variant="outline" className="w-full bg-transparent">
                    Clear Filters
                  </Button>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="all">All Instructors</TabsTrigger>
                  <TabsTrigger value="covers">Available Covers</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {activeTab === "covers"
                    ? `${MOCK_COVER_REQUESTS.length} cover requests found`
                    : `${MOCK_INSTRUCTORS.length} instructors found`}
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTab === "all" ? (
                      <>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="experience">Most Experience</SelectItem>
                        <SelectItem value="rate">Lowest Rate</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="urgency">Most Urgent</SelectItem>
                        <SelectItem value="rate">Highest Rate</SelectItem>
                        <SelectItem value="date">Soonest Date</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {activeTab === "all" ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {MOCK_INSTRUCTORS.map((instructor) => (
                    <Card key={instructor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex gap-4 mb-4">
                            <img
                              src={instructor.image || "/placeholder.svg"}
                              alt={instructor.name}
                              className="h-20 w-20 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h3 className="font-semibold text-lg">{instructor.name}</h3>
                                <Badge variant="secondary">Available</Badge>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                <MapPin className="h-3 w-3" />
                                {instructor.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="font-semibold text-sm">{instructor.rating}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({instructor.reviewCount} reviews)
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 blur-sm select-none">
                            {instructor.bio}
                          </p>

                          <div className="flex items-center gap-2 text-sm mb-3">
                            <Award className="h-4 w-4 text-primary" />
                            <span className="font-medium">Experience:</span>
                            <span className="text-muted-foreground">{instructor.experience}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {instructor.certifications.map((cert) => (
                              <Badge key={cert} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="bg-muted/95 backdrop-blur-sm p-6 border-t">
                          <div className="text-center">
                            <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
                            <h4 className="font-semibold mb-2">Unlock Full Access</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Sign in as a studio to view contact details and message instructors
                            </p>
                            <Button asChild className="w-full">
                              <Link href="/auth/sign-up/studio">Create Studio Account</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {MOCK_COVER_REQUESTS.map((cover) => (
                    <Card key={cover.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="relative h-32">
                          <img
                            src={cover.image || "/placeholder.svg"}
                            alt={cover.studio}
                            className="w-full h-full object-cover"
                          />
                          <Badge
                            className="absolute top-3 right-3"
                            variant={cover.urgency === "Very Urgent" ? "destructive" : "secondary"}
                          >
                            {cover.urgency}
                          </Badge>
                        </div>

                        <div className="p-6">
                          <div className="mb-4">
                            <h3 className="font-semibold text-lg mb-1">{cover.studio}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {cover.location}
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="font-medium">{cover.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">{cover.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-primary" />
                              <span className="font-semibold text-primary">{cover.rate}</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Class Type:</p>
                            <Badge variant="outline">{cover.classType}</Badge>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Requirements:</p>
                            <div className="flex flex-wrap gap-1">
                              {cover.requirements.map((req) => (
                                <Badge key={req} variant="secondary" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/95 backdrop-blur-sm p-6 border-t">
                          <div className="text-center">
                            <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
                            <h4 className="font-semibold mb-2">Unlock Full Access</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Sign in as an instructor to apply for cover requests
                            </p>
                            <Button asChild className="w-full">
                              <Link href="/auth/sign-up/instructor">Create Instructor Account</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
