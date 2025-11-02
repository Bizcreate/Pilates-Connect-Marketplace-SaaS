import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "PilatesConnect <onboarding@resend.dev>",
      to,
      subject,
      html,
      text,
    })

    if (error) {
      console.error("[v0] Error sending email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return { success: false, error }
  }
}

export const emailTemplates = {
  welcome: (userName: string) => ({
    subject: "Welcome to PilatesConnect!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">Welcome to PilatesConnect!</h1>
        <p>Hi ${userName},</p>
        <p>Thank you for joining PilatesConnect, the marketplace connecting Pilates studios and instructors.</p>
        <p>Get started by completing your profile and exploring opportunities in your area.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/profile" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Complete Your Profile
        </a>
      </div>
    `,
    text: `Welcome to PilatesConnect! Hi ${userName}, thank you for joining PilatesConnect. Get started by completing your profile.`,
  }),

  coverRequestPosted: (studioName: string, date: string, location: string, rate: number) => ({
    subject: `New Cover Request: ${studioName} - ${date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">New Cover Request Available</h1>
        <p>A new cover request has been posted that matches your profile:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Studio:</strong> ${studioName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Rate:</strong> $${rate}/hour</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/instructor/dashboard" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Request
        </a>
      </div>
    `,
    text: `New cover request from ${studioName} on ${date} at ${location}. Rate: $${rate}/hour. View it on your dashboard.`,
  }),

  coverRequestAccepted: (instructorName: string, date: string, studioName: string) => ({
    subject: `Cover Request Accepted - ${date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">Your Cover Request Has Been Filled!</h1>
        <p>Great news! ${instructorName} has accepted your cover request.</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Instructor:</strong> ${instructorName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Studio:</strong> ${studioName}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/studio/dashboard" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Dashboard
        </a>
      </div>
    `,
    text: `${instructorName} has accepted your cover request for ${date} at ${studioName}.`,
  }),

  jobPosted: (jobTitle: string, studioName: string, location: string, salary: string) => ({
    subject: `New Job Opportunity: ${jobTitle} at ${studioName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">New Job Opportunity</h1>
        <p>A new job has been posted that matches your profile:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Position:</strong> ${jobTitle}</p>
          <p><strong>Studio:</strong> ${studioName}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Salary:</strong> ${salary}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/instructor/jobs" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Job Details
        </a>
      </div>
    `,
    text: `New job opportunity: ${jobTitle} at ${studioName} in ${location}. Salary: ${salary}. View details on the jobs page.`,
  }),

  applicationReceived: (instructorName: string, jobTitle: string, studioName: string) => ({
    subject: `New Application: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">New Job Application</h1>
        <p>You have received a new application for your job posting:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Applicant:</strong> ${instructorName}</p>
          <p><strong>Position:</strong> ${jobTitle}</p>
          <p><strong>Studio:</strong> ${studioName}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/studio/dashboard" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Review Application
        </a>
      </div>
    `,
    text: `${instructorName} has applied for ${jobTitle} at ${studioName}. Review the application on your dashboard.`,
  }),

  applicationStatusUpdate: (
    instructorName: string,
    jobTitle: string,
    studioName: string,
    status: "accepted" | "rejected",
  ) => ({
    subject: `Application Update: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">Application Status Update</h1>
        <p>Hi ${instructorName},</p>
        ${
          status === "accepted"
            ? `<p>Congratulations! Your application for <strong>${jobTitle}</strong> at ${studioName} has been accepted.</p>`
            : `<p>Thank you for your interest in <strong>${jobTitle}</strong> at ${studioName}. Unfortunately, we've decided to move forward with other candidates at this time.</p>`
        }
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Position:</strong> ${jobTitle}</p>
          <p><strong>Studio:</strong> ${studioName}</p>
          <p><strong>Status:</strong> ${status === "accepted" ? "Accepted" : "Not Selected"}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/instructor/dashboard" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Dashboard
        </a>
      </div>
    `,
    text:
      status === "accepted"
        ? `Congratulations! Your application for ${jobTitle} at ${studioName} has been accepted.`
        : `Thank you for your interest in ${jobTitle} at ${studioName}. We've decided to move forward with other candidates.`,
  }),
}
