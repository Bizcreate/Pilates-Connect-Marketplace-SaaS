import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Check, Zap, Star, Crown } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="container py-16 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your Pilates studio workflow. Paid plans include filters for equipment type
            (Reformer, Cadillac, Chair, Tower), class length, and certification requirements.
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            14-day free trial on paid plans
          </div>
        </section>

        {/* Studio Pricing */}
        <section className="container py-12">
          <h2 className="text-3xl font-bold text-center mb-12">For Fitness Studios</h2>
          <p className="text-center text-muted-foreground mb-8">
            Find and hire qualified Pilates instructors with ease
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Basic */}
            <Card className="border-2">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">Basic</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Free</span>
                </div>
                <CardDescription className="mt-2">Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Create studio profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Post up to 2 jobs per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Browse instructor profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Basic applicant management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Email support</span>
                  </li>
                </ul>

                <div className="pt-4 space-y-2">
                  <p className="text-sm font-medium">Limitations:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Limited to 2 active job postings</li>
                    <li>• Basic search filters only</li>
                    <li>• No featured job listings</li>
                  </ul>
                </div>

                <Button className="w-full mt-6 bg-transparent" variant="outline" asChild>
                  <Link href="/auth/sign-up?plan=basic">Get Started Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Professional - Most Popular */}
            <Card className="border-2 border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center pb-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Professional</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/per month</span>
                </div>
                <CardDescription className="mt-2">Most popular for growing Pilates studios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Everything in Basic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited job postings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced search (equipment, certifications)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Applicant tracking system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Direct messaging with instructors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Featured job listings (2/month)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Analytics dashboard</span>
                  </li>
                </ul>

                <Button className="w-full mt-6" asChild>
                  <Link href="/auth/sign-up?plan=professional">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border-2">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Crown className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$149</span>
                  <span className="text-muted-foreground">/per month</span>
                </div>
                <CardDescription className="mt-2">For multi-location Pilates chains</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Everything in Professional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited featured job listings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Multi-location management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Team collaboration tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Custom branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced reporting</span>
                  </li>
                </ul>

                <Button className="w-full mt-6 bg-transparent" variant="outline" asChild>
                  <Link href="/auth/sign-up?plan=enterprise">Start Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Instructor Pricing */}
        <section className="container py-20 border-t border-border/40 bg-muted/30">
          <h2 className="text-3xl font-bold text-center mb-12">For Fitness Instructors</h2>
          <p className="text-center text-muted-foreground mb-8">Always free to create your profile and apply to jobs</p>

          <Card className="max-w-xl mx-auto border-2">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Free Forever</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              <CardDescription className="mt-2">
                Everything you need to find your next Pilates opportunity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Create detailed instructor profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Apply to unlimited jobs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Direct messaging with studios</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Availability calendar management</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Application tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Career resources & tips</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Mobile app access</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Email notifications</span>
                </li>
              </ul>

              <Button className="w-full mt-6" asChild>
                <Link href="/auth/sign-up?type=instructor">Create Your Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
