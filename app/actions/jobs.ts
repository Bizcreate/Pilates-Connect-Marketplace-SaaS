"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function createJob(jobData: {
  title: string
  description: string
  job_type: string
  location: string
  suburb?: string | null
  state?: string | null
  equipment_provided?: string[]
  required_certifications?: string[]
  hourly_rate_min?: number | null
  hourly_rate_max?: number | null
  start_date?: string | null
  end_date?: string | null
  status: "open" | "draft"
}) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const fullJobData = {
      ...jobData,
      studio_id: user.id,
    }

    console.log("[v0] Creating job with data:", fullJobData)

    const { data: job, error } = await supabase.from("jobs").insert(fullJobData).select().single()

    if (error) {
      console.error("[v0] Error creating job:", error)
      throw error
    }

    console.log("[v0] Job created successfully:", job)

    const { data: studioProfile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()

    // Get instructors in the same location who are looking for work
    const { data: instructors } = await supabase
      .from("profiles")
      .select("email, display_name")
      .eq("user_type", "instructor")
      .eq("location", jobData.location)
      .not("email", "is", null)

    // Send emails to matching instructors
    if (instructors && instructors.length > 0 && jobData.hourly_rate_min && jobData.hourly_rate_max) {
      const salaryRange = `$${jobData.hourly_rate_min.toLocaleString()} - $${jobData.hourly_rate_max.toLocaleString()}`

      await Promise.all(
        instructors.map((instructor) =>
          sendEmail({
            to: instructor.email!,
            ...emailTemplates.jobPosted(
              jobData.title,
              studioProfile?.display_name || "A studio",
              jobData.location,
              salaryRange,
            ),
          }),
        ),
      )
    }

    revalidatePath("/studio/dashboard")
    revalidatePath("/jobs")
    return { success: true, data: job }
  } catch (error: any) {
    console.error("[v0] Error in createJob:", error)
    return { success: false, error: error.message }
  }
}

export async function applyToJob(jobId: string, coverLetter: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: existingApplication } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("instructor_id", user.id)
      .single()

    if (existingApplication) {
      return { success: false, error: "You have already applied to this job" }
    }

    const { data: application, error } = await supabase
      .from("job_applications")
      .insert({
        job_id: jobId,
        instructor_id: user.id,
        cover_letter: coverLetter,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    const { data: job } = await supabase
      .from("jobs")
      .select(
        `
        title,
        studio:profiles!jobs_studio_id_fkey(email, display_name)
      `,
      )
      .eq("id", jobId)
      .single()

    const { data: instructorProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()

    if (job?.studio?.email) {
      await sendEmail({
        to: job.studio.email,
        ...emailTemplates.applicationReceived(
          instructorProfile?.display_name || "An instructor",
          job.title,
          job.studio.display_name || "your studio",
        ),
      })
    }

    revalidatePath("/jobs")
    revalidatePath("/studio/dashboard")
    return { success: true, data: application }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
