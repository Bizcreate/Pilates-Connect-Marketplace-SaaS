"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function saveStudioProfile(formData: any) {
  try {
    const supabase = await createServerClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const userId = user.id

    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: formData.studio_name || null,
        phone: formData.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (profileError) {
      console.error("[Server] Profiles update error:", profileError)
      return { success: false, error: profileError.message }
    }

    // Convert equipment string to array
    const equipmentArray = formData.equipment_available
      ? formData.equipment_available
          .split(",")
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0)
      : []

    // Build social links object
    const socialLinks = {
      instagram: formData.instagram || null,
      facebook: formData.facebook || null,
      linkedin: formData.linkedin || null,
    }

    // Upsert studio_profiles table
    const { error: studioError } = await supabase.from("studio_profiles").upsert(
      {
        id: userId,
        studio_name: formData.studio_name || null,
        description: formData.description || null,
        address: formData.address || null,
        suburb: formData.suburb || null,
        state: formData.state || null,
        postcode: formData.postcode || null,
        email: formData.email || null,
        website: formData.website || null,
        studio_size: formData.studio_size || null,
        equipment_available: equipmentArray,
        social_links: socialLinks,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    if (studioError) {
      console.error("[Server] Studio profiles upsert error:", studioError)
      return { success: false, error: studioError.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("[Server] Unexpected error:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}
