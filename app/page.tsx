import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Search, MapPin, MessageSquare, Calendar } from "lucide-react"

export default function HomePage() {
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

            {/* Search Bar */}
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardContent className="p-2">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by level, equipment, suburb..."
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-3 border-t md:border-t-0 md:border-l pt-2 md:pt-0">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Location"
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <Button size="lg" className="md:w-auto">
                    Search
                  </Button>
                </div>
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
                <Link href="/create-account">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Pilates Connect */}
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
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
