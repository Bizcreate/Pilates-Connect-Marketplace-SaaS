import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[v0] Auth callback received, code:", code ? "present" : "missing")

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] Failed to exchange code for session:", error)
      return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
    }

    if (!data.user) {
      console.error("[v0] No user in session data")
      return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
    }

    console.log("[v0] Session exchange successful for user:", data.user.id)

    const metadata = data.user.user_metadata
    const userType = metadata.user_type

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: metadata.display_name,
          location: metadata.location,
          phone: metadata.phone,
          bio: metadata.bio,
        })
        .eq("id", data.user.id)

      if (profileError) {
        console.error("[v0] Profile update error:", profileError)
      }

      if (userType === "studio") {
        const equipment = Array.isArray(metadata.equipment)
          ? metadata.equipment
          : typeof metadata.equipment === "string"
            ? JSON.parse(metadata.equipment)
            : []

        console.log("[v0] Upserting studio profile with equipment:", equipment)

        const { error: studioError } = await supabase.from("studio_profiles").upsert(
          {
            id: data.user.id,
            studio_name: metadata.studio_name,
            website: metadata.website,
            instagram: metadata.instagram,
            equipment_available: equipment,
          },
          {
            onConflict: "id",
          },
        )

        if (studioError) {
          console.error("[v0] Studio profile upsert error:", studioError)
        }

        sendEmail({
          to: data.user.email!,
          ...emailTemplates.welcomeStudio(metadata.display_name || metadata.studio_name || "there"),
        }).catch((err) => console.error("[v0] Email send error:", err))
      } else if (userType === "instructor") {
        const certifications = Array.isArray(metadata.certifications)
          ? metadata.certifications
          : typeof metadata.certifications === "string"
            ? JSON.parse(metadata.certifications)
            : []

        const equipment = Array.isArray(metadata.equipment)
          ? metadata.equipment
          : typeof metadata.equipment === "string"
            ? JSON.parse(metadata.equipment)
            : []

        const { error: instructorError } = await supabase.from("instructor_profiles").upsert(
          {
            id: data.user.id,
            certifications,
            equipment,
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
        }

        sendEmail({
          to: data.user.email!,
          ...emailTemplates.welcomeInstructor(metadata.display_name || "there"),
        }).catch((err) => console.error("[v0] Email send error:", err))
      }

      const redirectPath = userType === "studio" ? "/studio/dashboard" : "/instructor/dashboard"
      console.log("[v0] Redirecting to:", redirectPath)
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
    } catch (err) {
      console.error("[v0] Callback processing error:", err)
      const redirectPath = metadata.user_type === "studio" ? "/studio/dashboard" : "/instructor/dashboard"
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
}
