"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()

    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        setUser(authUser)

        if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", authUser.id)
            .maybeSingle()
          setUserType(profile?.user_type || null)
        }
      } catch (error) {
        console.error("[v0] Auth error in header:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .maybeSingle()
        setUserType(profile?.user_type || null)
      } else {
        setUserType(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">Pilates Connect</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/jobs" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Jobs
          </Link>
          <Link
            href="/find-instructors"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Find Instructors
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
          ) : user ? (
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
      </div>
    </header>
  )
}
