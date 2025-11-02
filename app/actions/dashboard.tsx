"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function acceptCoverRequest(requestId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: coverRequest } = await supabase
      .from("cover_requests")
      .select(
        `
        *,
        studio:profiles!cover_requests_studio_id_fkey(email, display_name)
      `,
      )
      .eq("id", requestId)
      .single()

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

    if (coverRequest?.studio?.email) {
      const { data: instructorProfile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single()

      await sendEmail({
        to: coverRequest.studio.email,
        ...emailTemplates.coverRequestAccepted(
          instructorProfile?.display_name || "An instructor",
          new Date(coverRequest.date).toLocaleDateString("en-AU"),
          coverRequest.studio.display_name || "your studio",
        ),
      })
    }

    revalidatePath("/instructor/dashboard")
    return { success: true }
  } catch (error: any) {
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
    return { success: true }
  } catch (error: any) {
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

    const { data: application } = await supabase
      .from("applications")
      .select(
        `
        *,
        instructor:profiles!applications_instructor_id_fkey(email, display_name),
        job:jobs(title, studio:profiles!jobs_studio_id_fkey(display_name))
      `,
      )
      .eq("id", applicationId)
      .single()

    const { error } = await supabase
      .from("applications")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)

    if (error) throw error

    if (application?.instructor?.email && (status === "accepted" || status === "rejected")) {
      await sendEmail({
        to: application.instructor.email,
        ...emailTemplates.applicationStatusUpdate(
          application.instructor.display_name || "there",
          application.job?.title || "the position",
          application.job?.studio?.display_name || "the studio",
          status as "accepted" | "rejected",
        ),
      })
    }

    revalidatePath("/studio/dashboard")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
