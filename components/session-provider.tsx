"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state change:", event)

      if (event === "SIGNED_OUT") {
        // Clear any stale data
        console.log("[v0] User signed out, clearing session...")
        // Redirect to login if on protected page
        if (pathname?.includes("/dashboard") || pathname?.includes("/studio") || pathname?.includes("/instructor")) {
          router.push("/auth/login")
        }
      }

      if (event === "TOKEN_REFRESHED") {
        console.log("[v0] Token refreshed successfully")
      }

      if (event === "USER_UPDATED") {
        console.log("[v0] User profile updated")
      }

      if (event === "SIGNED_IN") {
        console.log("[v0] User signed in")
      }
    })

    const validateInitialSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error && error.message.includes("refresh_token")) {
        console.log("[v0] Invalid session detected on mount, clearing...")
        await supabase.auth.signOut()
        if (pathname?.includes("/dashboard") || pathname?.includes("/studio") || pathname?.includes("/instructor")) {
          router.push("/auth/login")
        }
      }
    }

    validateInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  return <>{children}</>
}
