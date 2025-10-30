"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function acceptCoverRequest(requestId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Update cover request with instructor
    const { error } = await supabase
      .from("cover_requests")
      .update({
        instructor_id: user.id,
        status: "filled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("status", "open")

    if (error) throw error

    // TODO: Send notification email to studio
    console.log("[v0] Cover request accepted:", requestId)

    revalidatePath("/instructor/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Accept cover error:", error)
    return { success: false, error: error.message }
  }
}

export async function removeAvailability(slotId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Mark availability as unavailable
    const { error } = await supabase
      .from("availability_slots")
      .update({
        is_available: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slotId)
      .eq("instructor_id", user.id)

    if (error) throw error

    revalidatePath("/instructor/dashboard")
    return { success: false }
  } catch (error: any) {
    console.error("[v0] Remove availability error:", error)
    return { success: false, error: error.message }
  }
}

export async function cancelCoverRequest(requestId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { error } = await supabase
      .from("cover_requests")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("studio_id", user.id)

    if (error) throw error

    revalidatePath("/studio/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Cancel cover request error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { error } = await supabase
      .from("applications")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)

    if (error) throw error

    // TODO: Send notification email to instructor
    console.log("[v0] Application status updated:", applicationId, status)

    revalidatePath("/studio/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update application error:", error)
    return { success: false, error: error.message }
  }
}
