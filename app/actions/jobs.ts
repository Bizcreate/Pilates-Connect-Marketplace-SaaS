"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function createJob(formData: FormData) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const jobData = {
      studio_id: user.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      employment_type: formData.get("employment_type") as string,
      salary_min: Number.parseInt(formData.get("salary_min") as string),
      salary_max: Number.parseInt(formData.get("salary_max") as string),
      requirements: formData.get("requirements") as string,
      status: "open",
    }

    const { data: job, error } = await supabase.from("jobs").insert(jobData).select().single()

    if (error) throw error

    const { data: studioProfile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()

    // Get instructors in the same location who are looking for work
    const { data: instructors } = await supabase
      .from("profiles")
      .select("email, display_name")
      .eq("user_type", "instructor")
      .eq("location", jobData.location)
      .not("email", "is", null)

    // Send emails to matching instructors
    if (instructors && instructors.length > 0) {
      const salaryRange = `$${jobData.salary_min.toLocaleString()} - $${jobData.salary_max.toLocaleString()}`

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
    revalidatePath("/instructor/jobs")
    return { success: true, data: job }
  } catch (error: any) {
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
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("instructor_id", user.id)
      .single()

    if (existingApplication) {
      return { success: false, error: "You have already applied to this job" }
    }

    const { data: application, error } = await supabase
      .from("applications")
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

    revalidatePath("/instructor/jobs")
    revalidatePath("/studio/dashboard")
    return { success: true, data: application }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
