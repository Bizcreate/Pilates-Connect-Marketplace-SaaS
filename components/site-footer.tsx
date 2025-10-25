import Link from "next/link"
import { Activity } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-semibold">Pilates Connect</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Australia's marketplace for Pilates Instructors & Studios
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">For Studios</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/post-job" className="hover:text-foreground transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/find-instructors" className="hover:text-foreground transition-colors">
                  Find Instructors
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">For Instructors</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/jobs" className="hover:text-foreground transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/create-profile" className="hover:text-foreground transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-foreground transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Reformer Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
