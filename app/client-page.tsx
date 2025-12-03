"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  Search,
  MapPin,
  MessageSquare,
  Calendar,
  ImageIcon,
  Award,
  Gift,
  BarChart3,
  CheckCircle2,
  Users,
} from "lucide-react"

export default function ClientPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (location) params.set("location", location)
    router.push(`/find-instructors?${params.toString()}`)
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Pilates AU
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Australia's marketplace for <span className="text-muted-foreground">Pilates Instructors & Studios</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Find certified Reformer/Cadillac/Mat instructors, manage class covers and hiring, and collaborate with a
              Pilates-specific talent pool.
            </p>

            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardContent className="p-2">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by level, equipment, suburb..."
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 px-3 border-t md:border-t-0 md:border-l pt-2 md:pt-0">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Location"
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="lg" className="md:w-auto">
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
              <div>
                <div className="text-3xl md:text-4xl font-bold">250+</div>
                <div className="text-sm text-muted-foreground">Pilates Instructors</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">90+</div>
                <div className="text-sm text-muted-foreground">Pilates Studios</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">600+</div>
                <div className="text-sm text-muted-foreground">Successful Matches</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Core Features - Equipment & Matching */}
        <section className="border-t border-border/40 bg-muted/30 py-20">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Why Pilates Connect</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Purpose-built for classical + contemporary Pilates hiring.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Equipment-aware search</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Filter by Reformer, Cadillac, Chair, Tower, Mat—plus certification level.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Real-time messaging</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Studios and instructors chat in-app to confirm details fast.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Availability & scheduling</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Recurring classes, one-off covers, privates—clear and simple.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Professional Features */}
        <section className="container py-20">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Built for Pilates Professionals</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools to showcase your expertise and manage your career.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Media Portfolios</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload photos and videos of your teaching style, studio environment, and class experiences to stand
                  out.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Certification Management</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload and display your Reformer, Mat, STOTT, Basi, or custom certifications with document
                  verification.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Comprehensive Dashboard</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track active applications, manage availability, view cover requests, and monitor earnings all in one
                  place.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Referral Program</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Earn $50 for every instructor or studio you refer who completes their first job or booking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Application Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  See all your job applications, cover requests, and confirmed positions with real-time status updates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Direct Communication</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Message studios directly, negotiate rates, and coordinate schedules without leaving the platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* For Studios & Instructors */}
        <section className="border-t border-border/40 bg-muted/30 py-20">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* For Studios */}
              <div className="space-y-6">
                <Badge className="text-sm">For Studios</Badge>
                <h2 className="text-3xl font-bold">Find the perfect instructor</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Post jobs, browse verified instructors with media portfolios and certifications, and manage your
                  hiring pipeline efficiently.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      View instructor portfolios with photos, videos, and verified certifications
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Post one-off covers or permanent positions with equipment requirements
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Message qualified candidates directly and schedule interviews
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Track applications and manage your hiring dashboard</span>
                  </li>
                </ul>
                <Button size="lg" asChild>
                  <Link href="/auth/sign-up?type=studio">Get Started as Studio</Link>
                </Button>
              </div>

              {/* For Instructors */}
              <div className="space-y-6">
                <Badge className="text-sm">For Instructors</Badge>
                <h2 className="text-3xl font-bold">Grow your Pilates career</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Create a professional profile, showcase your certifications and teaching style, and get discovered by
                  top studios.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Build a portfolio with photos and videos of your teaching
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Upload and verify your certifications (Reformer, Mat, STOTT, Basi, etc.)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Post your availability and get matched with studios looking for coverage
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Earn $50 for each successful referral you make</span>
                  </li>
                </ul>
                <Button size="lg" asChild>
                  <Link href="/auth/sign-up?type=instructor">Get Started as Instructor</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container py-20">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">How are rates handled?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Studios usually pay per class; you can show min/max and unit. Negotiation happens in chat.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Do I need comprehensive certification?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Studios can request specific levels; many roles welcome Mat/Reformer certifications.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Can I book trial classes?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Yes. Use 'Schedule Interview' or 'Book Class' on a listing to coordinate times.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">How does the referral program work?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Share your unique referral link with other instructors or studios. When they sign up and complete
                    their first job or booking, you earn $50. Track all your referrals in your dashboard.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">How do I upload my certifications?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Go to your dashboard and navigate to the Certifications tab. You can add predefined certifications
                    (Reformer, Mat, STOTT, Basi) or create custom ones, then upload supporting documents (PDFs or
                    images) for verification.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Can studios view my media portfolio?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Yes! When studios browse instructors, they can view all photos and videos you've uploaded to your
                    media gallery. This helps them understand your teaching style and studio environment before reaching
                    out.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
