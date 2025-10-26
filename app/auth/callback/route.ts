import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[v0] Auth callback triggered with code:", code ? "present" : "missing")

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] Error exchanging code for session:", error)
      return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
    }

    if (!data.user) {
      console.error("[v0] No user data after exchange")
      return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
    }

    console.log("[v0] User authenticated:", data.user.id)

    const metadata = data.user.user_metadata
    const userType = metadata.user_type

    console.log("[v0] Creating profile for user type:", userType)

    try {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: data.user.email!,
          display_name: metadata.display_name,
          location: metadata.location,
          phone: metadata.phone,
          bio: metadata.bio,
          user_type: userType,
        },
        {
          onConflict: "id",
        },
      )

      if (profileError) {
        console.error("[v0] Profile creation error:", profileError)
        throw profileError
      }

      console.log("[v0] Main profile created successfully")

      if (userType === "studio") {
        const { error: studioError } = await supabase.from("studio_profiles").upsert(
          {
            id: data.user.id,
            studio_name: metadata.studio_name,
            website: metadata.website,
            instagram: metadata.instagram,
            equipment: metadata.equipment || [],
          },
          {
            onConflict: "id",
          },
        )

        if (studioError) {
          console.error("[v0] Studio profile error:", studioError)
          throw studioError
        }

        console.log("[v0] Studio profile created successfully")
      } else if (userType === "instructor") {
        const { error: instructorError } = await supabase.from("instructor_profiles").upsert(
          {
            id: data.user.id,
            certifications: metadata.certifications || [],
            equipment: metadata.equipment || [],
            years_experience: metadata.years_experience,
            hourly_rate_min: metadata.hourly_rate_min,
            hourly_rate_max: metadata.hourly_rate_max,
          },
          {
            onConflict: "id",
          },
        )

        if (instructorError) {
          console.error("[v0] Instructor profile error:", instructorError)
          throw instructorError
        }

        console.log("[v0] Instructor profile created successfully")
      }

      const redirectPath = userType === "studio" ? "/studio/dashboard" : "/instructor/dashboard"
      console.log("[v0] Redirecting to:", redirectPath)
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
    } catch (err) {
      console.error("[v0] Profile creation failed:", err)
      return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
    }
  }

  console.log("[v0] No code provided, redirecting to error")
  return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
}
