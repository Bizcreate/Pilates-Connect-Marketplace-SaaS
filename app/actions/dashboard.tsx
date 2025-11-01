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
      const statusMessage =
        status === "accepted"
          ? `Congratulations! Your application for ${application.job?.title} has been accepted.`
          : `Thank you for your interest in ${application.job?.title}. Unfortunately, we've decided to move forward with other candidates.`

      await sendEmail({
        to: application.instructor.email,
        subject: `Application Update: ${application.job?.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B4513;">Application Status Update</h1>
            <p>${statusMessage}</p>
            <p>Job: <strong>${application.job?.title}</strong></p>
            <p>Studio: <strong>${application.job?.studio?.display_name}</strong></p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/instructor/dashboard" 
               style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
              View Dashboard
            </a>
          </div>
        `,
        text: statusMessage,
      })
    }

    revalidatePath("/studio/dashboard")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
