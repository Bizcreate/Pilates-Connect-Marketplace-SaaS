"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveInstructorProfile(formData: {
  display_name: string
  bio: string
  location: string
  phone: string
  years_experience: number
  hourly_rate_min: number
  hourly_rate_max: number
  certifications: string
  equipment: string
  instagram: string
  facebook: string
  linkedin: string
  website: string
}) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: formData.display_name,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (profileError) {
      console.error("Profile update error:", profileError)
      return { success: false, error: `Profile update failed: ${profileError.message}` }
    }

    const certificationsArray = formData.certifications
      ? formData.certifications
          .split(",")
          .map((cert) => cert.trim())
          .filter(Boolean)
      : []

    const equipmentArray = formData.equipment
      ? formData.equipment
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : []

    const { error: instructorError } = await supabase.from("instructor_profiles").upsert(
      {
        id: user.id,
        years_experience: Number(formData.years_experience) || 0,
        hourly_rate_min: Number(formData.hourly_rate_min) || 0,
        hourly_rate_max: Number(formData.hourly_rate_max) || 0,
        certifications: certificationsArray,
        equipment: equipmentArray,
        social_links: {
          instagram: formData.instagram || null,
          facebook: formData.facebook || null,
          linkedin: formData.linkedin || null,
          website: formData.website || null,
        },
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    )

    if (instructorError) {
      console.error("Instructor profile update error:", instructorError)
      return { success: false, error: `Instructor profile update failed: ${instructorError.message}` }
    }

    revalidatePath("/instructor/profile")
    revalidatePath("/instructors/[id]", "page")

    return { success: true }
  } catch (error: any) {
    console.error("Save error:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}
