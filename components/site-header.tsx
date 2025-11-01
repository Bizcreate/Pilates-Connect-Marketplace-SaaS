"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Activity, Menu } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const checkAuth = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        setUser(authUser)
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", authUser.id)
          .maybeSingle()
        setUserType(profile?.user_type || null)
      }
      setLoading(false)
    }

    checkAuth()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .maybeSingle()
        setUserType(profile?.user_type || null)
      } else {
        setUser(null)
        setUserType(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const NavLinks = () => (
    <>
      <Link
        href="/jobs"
        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Jobs
      </Link>
      <Link
        href="/find-instructors"
        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Find Instructors
      </Link>
      <Link
        href="/pricing"
        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Pricing
      </Link>
      <Link
        href="/referrals"
        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Referrals
      </Link>
      <Link
        href="/help"
        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Help
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">Pilates Connect</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
          ) : user && userType ? (
            <>
              <Button variant="ghost" asChild>
                <Link href={userType === "studio" ? "/studio/dashboard" : "/instructor/dashboard"}>Dashboard</Link>
              </Button>
              <UserMenu user={user} userType={userType} />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          {!loading && user && userType && <UserMenu user={user} userType={userType} />}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <NavLinks />
                <div className="border-t pt-4 mt-4 space-y-2">
                  {loading ? (
                    <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
                  ) : user && userType ? (
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link
                        href={userType === "studio" ? "/studio/dashboard" : "/instructor/dashboard"}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full bg-transparent">
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
