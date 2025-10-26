"use server"

import { createAdminClient } from "@/lib/supabase/server"

export async function createInstructorAccount(data: {
  email: string
  password: string
  displayName: string
  location: string
  phone?: string
  bio?: string
  equipment: string[]
  certifications: string[]
  yearsExperience: number
  rateMin?: number
  rateMax?: number
}) {
  const supabase = createAdminClient()

  let userId: string

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  })

  if (authError) {
    // If user already exists, try to get them and recreate their profile
    if (authError.message.includes("already been registered") || authError.message.includes("email_exists")) {
      console.log("[v0] User already exists, fetching existing user...")

      // Get the existing user by email
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

      if (listError) {
        console.error("[v0] Error listing users:", listError)
        return {
          success: false,
          error: "EMAIL_EXISTS",
          message: "This email is already registered. Please log in instead or contact support.",
        }
      }

      const existingUser = existingUsers.users.find((u) => u.email === data.email)

      if (!existingUser) {
        return {
          success: false,
          error: "EMAIL_EXISTS",
          message: "This email is already registered. Please log in instead.",
        }
      }

      userId = existingUser.id
      console.log("[v0] Found existing user, will recreate profile:", userId)
    } else {
      console.error("[v0] Auth creation error:", authError)
      return {
        success: false,
        error: "AUTH_ERROR",
        message: `Failed to create account: ${authError.message}`,
      }
    }
  } else {
    if (!authData.user) {
      return {
        success: false,
        error: "AUTH_ERROR",
        message: "Failed to create account",
      }
    }
    userId = authData.user.id
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: data.email,
      display_name: data.displayName,
      location: data.location,
      phone: data.phone || null,
      bio: data.bio || null,
      user_type: "instructor",
    },
    {
      onConflict: "id",
    },
  )

  if (profileError) {
    console.error("[v0] Profile creation error:", profileError)
    return {
      success: false,
      error: "PROFILE_ERROR",
      message: `Failed to create profile: ${profileError.message}`,
    }
  }

  const { error: instructorError } = await supabase.from("instructor_profiles").upsert(
    {
      id: userId,
      equipment: data.equipment,
      certifications: data.certifications,
      years_experience: data.yearsExperience,
      hourly_rate_min: data.rateMin || null,
      hourly_rate_max: data.rateMax || null,
    },
    {
      onConflict: "id",
    },
  )

  if (instructorError) {
    console.error("[v0] Instructor profile creation error:", instructorError)
    return {
      success: false,
      error: "PROFILE_ERROR",
      message: `Failed to create instructor profile: ${instructorError.message}`,
    }
  }

  return { success: true, userId }
}

export async function createStudioAccount(data: {
  email: string
  password: string
  displayName: string
  studioName: string
  location: string
  phone?: string
  bio?: string
  website?: string
  instagram?: string
  equipment: string[]
}) {
  const supabase = createAdminClient()

  let userId: string

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  })

  if (authError) {
    // If user already exists, try to get them and recreate their profile
    if (authError.message.includes("already been registered") || authError.message.includes("email_exists")) {
      console.log("[v0] User already exists, fetching existing user...")

      // Get the existing user by email
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

      if (listError) {
        console.error("[v0] Error listing users:", listError)
        return {
          success: false,
          error: "EMAIL_EXISTS",
          message: "This email is already registered. Please log in instead or contact support.",
        }
      }

      const existingUser = existingUsers.users.find((u) => u.email === data.email)

      if (!existingUser) {
        return {
          success: false,
          error: "EMAIL_EXISTS",
          message: "This email is already registered. Please log in instead.",
        }
      }

      userId = existingUser.id
      console.log("[v0] Found existing user, will recreate profile:", userId)
    } else {
      console.error("[v0] Auth creation error:", authError)
      return {
        success: false,
        error: "AUTH_ERROR",
        message: `Failed to create account: ${authError.message}`,
      }
    }
  } else {
    if (!authData.user) {
      return {
        success: false,
        error: "AUTH_ERROR",
        message: "Failed to create account",
      }
    }
    userId = authData.user.id
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: data.email,
      display_name: data.displayName,
      location: data.location,
      phone: data.phone || null,
      bio: data.bio || null,
      user_type: "studio",
    },
    {
      onConflict: "id",
    },
  )

  if (profileError) {
    console.error("[v0] Profile creation error:", profileError)
    return {
      success: false,
      error: "PROFILE_ERROR",
      message: `Failed to create profile: ${profileError.message}`,
    }
  }

  const { error: studioError } = await supabase.from("studio_profiles").upsert(
    {
      id: userId,
      studio_name: data.studioName,
      equipment: data.equipment,
      website: data.website || null,
      instagram: data.instagram || null,
    },
    {
      onConflict: "id",
    },
  )

  if (studioError) {
    console.error("[v0] Studio profile creation error:", studioError)
    return {
      success: false,
      error: "PROFILE_ERROR",
      message: `Failed to create studio profile: ${studioError.message}`,
    }
  }

  return { success: true, userId }
}
