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
      if (event === "SIGNED_OUT") {
        // Redirect to login only if on protected page
        if (
          pathname?.includes("/dashboard") ||
          pathname?.includes("/studio/") ||
          pathname?.includes("/instructor/") ||
          pathname?.includes("/admin/")
        ) {
          router.push("/auth/login")
        }
      }

      if (event === "SIGNED_IN") {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  return <>{children}</>
}
