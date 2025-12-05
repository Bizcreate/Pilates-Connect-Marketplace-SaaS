"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  CheckCircle2,
  Calendar,
  MessageSquare,
  Search,
  Award,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type UserType = "studio" | "instructor"

export default function MarketingClient() {
  const [userType, setUserType] = useState<UserType>("studio")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const router = useRouter()

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const supabase = createClient()

      // Insert into waitlist table
      const { error } = await supabase.from("waitlist").insert([
        {
          email,
          name,
          user_type: userType,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      setSubmitStatus("success")
      setEmail("")
      setName("")

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      console.error("[v0] Waitlist submission error:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const studioContent = {
    hero: {
      badge: "For Pilates Studios",
      title: "Find qualified instructors in minutes, not weeks",
      subtitle:
        "Stop scrambling for last-minute covers. Access Australia's largest network of certified Pilates instructors ready to fill permanent roles and urgent cover requests.",
    },
    stats: [
      { value: "250+", label: "Verified Instructors" },
      { value: "< 24hrs", label: "Average Response Time" },
      { value: "95%", label: "Fill Success Rate" },
    ],
    problems: [
      {
        icon: Clock,
        title: "Last-minute cancellations",
        description: "Instructor calls in sick and you're scrambling to find coverage before class starts.",
      },
      {
        icon: Search,
        title: "Time-consuming hiring",
        description: "Weeks of posting jobs, reviewing resumes, and coordinating interviews for one position.",
      },
      {
        icon: Shield,
        title: "Unverified qualifications",
        description: "Uncertain if candidates actually have the certifications and experience they claim.",
      },
    ],
    features: [
      {
        icon: Search,
        title: "Smart Equipment Matching",
        description:
          "Filter by Reformer, Cadillac, Chair, Tower, Mat expertise. See verified certifications and portfolios instantly.",
      },
      {
        icon: Calendar,
        title: "Instant Cover Requests",
        description:
          "Post urgent cover needs and get responses from available instructors within hours. Real-time availability matching.",
      },
      {
        icon: MessageSquare,
        title: "Direct Communication",
        description: "Message qualified candidates immediately. No waiting for email responses or playing phone tag.",
      },
      {
        icon: Award,
        title: "Verified Credentials",
        description:
          "All instructors upload certifications and insurance documents. View portfolios with teaching videos and photos.",
      },
      {
        icon: TrendingUp,
        title: "Hiring Dashboard",
        description:
          "Track all job postings, applications, and cover requests in one place. Manage your hiring pipeline efficiently.",
      },
      {
        icon: Users,
        title: "Growing Talent Pool",
        description:
          "Access hundreds of instructors actively looking for work. Post once, reach everyone automatically.",
      },
    ],
  }

  const instructorContent = {
    hero: {
      badge: "For Pilates Instructors",
      title: "Build your career with flexible, rewarding work",
      subtitle:
        "Stop chasing studios for opportunities. Get discovered by top studios, showcase your expertise, and take control of your teaching schedule.",
    },
    stats: [
      { value: "90+", label: "Active Studios" },
      { value: "$55-85", label: "Average Class Rate" },
      { value: "600+", label: "Jobs Posted Monthly" },
    ],
    problems: [
      {
        icon: Search,
        title: "Finding quality studios",
        description: "Endless searching through job boards and Facebook groups with no clear opportunity pipeline.",
      },
      {
        icon: DollarSign,
        title: "Inconsistent income",
        description: "Gaps between contracts leave you scrambling to fill your schedule and make ends meet.",
      },
      {
        icon: MessageSquare,
        title: "No direct connections",
        description: "Sending countless emails and cold messages to studios, hoping someone will respond.",
      },
    ],
    features: [
      {
        icon: Sparkles,
        title: "Professional Portfolio",
        description:
          "Upload teaching videos, studio photos, and client testimonials. Stand out with a complete media portfolio.",
      },
      {
        icon: Award,
        title: "Showcase Certifications",
        description:
          "Upload Reformer, Mat, STOTT, Basi, or custom certifications. Verified credentials build trust instantly.",
      },
      {
        icon: Calendar,
        title: "Flexible Availability",
        description:
          "Post your available time slots. Studios see when you're free and book you for covers or permanent classes.",
      },
      {
        icon: MessageSquare,
        title: "Direct Studio Access",
        description:
          "Message studios directly about opportunities. Negotiate rates and schedule interviews seamlessly.",
      },
      {
        icon: TrendingUp,
        title: "Career Dashboard",
        description:
          "Track applications, manage availability, view accepted jobs, and monitor earnings all in one place.",
      },
      {
        icon: DollarSign,
        title: "Referral Earnings",
        description:
          "Earn $50 for every instructor or studio you refer. Build passive income while helping the community.",
      },
    ],
  }

  const content = userType === "studio" ? studioContent : instructorContent

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            {/* User Type Toggle */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex rounded-full bg-muted p-1">
                <button
                  onClick={() => setUserType("studio")}
                  className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                    userType === "studio"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I'm a Studio Owner
                </button>
                <button
                  onClick={() => setUserType("instructor")}
                  className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                    userType === "instructor"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I'm an Instructor
                </button>
              </div>
            </div>

            <div className="text-center space-y-6">
              <Badge className="text-sm font-medium">{content.hero.badge}</Badge>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance leading-tight">
                {content.hero.title}
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
                {content.hero.subtitle}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8">
                {content.stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist Form */}
        <section className="container pb-16 md:pb-24">
          <Card className="max-w-2xl mx-auto shadow-xl border-2">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Join the Waitlist</h2>
                <p className="text-muted-foreground">Be among the first to access Pilates Connect when we launch</p>
              </div>

              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full h-12" disabled={isSubmitting}>
                  {isSubmitting ? "Joining..." : "Get Early Access"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>

                {submitStatus === "success" && (
                  <div className="text-center text-sm text-green-600 dark:text-green-400">
                    Success! Check your email for updates.
                  </div>
                )}
                {submitStatus === "error" && (
                  <div className="text-center text-sm text-destructive">Something went wrong. Please try again.</div>
                )}
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Problems Section */}
        <section className="border-t border-border/40 bg-muted/30 py-16 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Sound familiar?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These are the daily challenges facing {userType === "studio" ? "studio owners" : "instructors"} across
                Australia
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {content.problems.map((problem, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <problem.icon className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="text-xl font-semibold">{problem.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-16 md:py-24">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need in one platform</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built tools designed specifically for the Pilates industry
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {content.features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t border-border/40 bg-muted/30 py-16 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes, see results in hours
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">
                  {userType === "studio" ? "Post Your Need" : "Create Your Profile"}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {userType === "studio"
                    ? "List a permanent position or urgent cover request with equipment requirements and rates."
                    : "Upload certifications, teaching videos, and set your availability preferences."}
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">{userType === "studio" ? "Review Matches" : "Get Discovered"}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {userType === "studio"
                    ? "Browse qualified instructors with verified credentials, portfolios, and instant availability."
                    : "Studios find your profile when searching for instructors. Receive job alerts matching your skills."}
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">
                  {userType === "studio" ? "Book & Confirm" : "Connect & Start"}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {userType === "studio"
                    ? "Message instructors directly, coordinate details, and confirm bookings—all in-platform."
                    : "Chat with studios, negotiate rates, schedule interviews, and accept jobs seamlessly."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Trusted by Australia's Pilates community</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <CheckCircle2 key={i} className="h-5 w-5 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "Finding last-minute cover used to mean calling 10 instructors and getting rejected. Now I post once
                    and have responses within the hour. Game changer."
                  </p>
                  <div>
                    <div className="font-semibold">Sarah M.</div>
                    <div className="text-sm text-muted-foreground">Studio Owner, Sydney</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <CheckCircle2 key={i} className="h-5 w-5 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "I went from sending 50 cold emails a month to studios messaging ME about opportunities. My calendar
                    is finally full and I'm teaching where I want."
                  </p>
                  <div>
                    <div className="font-semibold">James T.</div>
                    <div className="text-sm text-muted-foreground">Certified Instructor, Melbourne</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border/40 bg-primary/5 py-16 md:py-24">
          <div className="container text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-balance">
                {userType === "studio" ? "Never scramble for coverage again" : "Take control of your Pilates career"}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground text-balance">
                Join hundreds of {userType === "studio" ? "studios" : "instructors"} already on the waitlist
              </p>
              <Button
                size="lg"
                className="h-14 px-8 text-lg"
                onClick={() => window.scrollTo({ top: 300, behavior: "smooth" })}
              >
                Get Early Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
