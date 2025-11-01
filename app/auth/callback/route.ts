import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
    }

    if (!data.user) {
      return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
    }

    const metadata = data.user.user_metadata
    const userType = metadata.user_type

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

      if (profileError) throw profileError

      if (userType === "studio") {
        const { error: studioError } = await supabase.from("studio_profiles").upsert(
          {
            id: data.user.id,
            studio_name: metadata.studio_name,
            website: metadata.website,
            instagram: metadata.instagram,
            equipment_available: metadata.equipment || [],
          },
          {
            onConflict: "id",
          },
        )

        if (studioError) throw studioError

        await sendEmail({
          to: data.user.email!,
          ...emailTemplates.welcomeStudio(metadata.display_name || metadata.studio_name || "there"),
        })
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

        if (instructorError) throw instructorError

        await sendEmail({
          to: data.user.email!,
          ...emailTemplates.welcomeInstructor(metadata.display_name || "there"),
        })
      }

      const redirectPath = userType === "studio" ? "/studio/dashboard" : "/instructor/dashboard"
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
    } catch (err) {
      return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL("/auth/error", requestUrl.origin))
}
