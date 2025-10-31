import "server-only"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Email service configuration
// In production, you would use a service like Resend, SendGrid, or AWS SES
// For now, this is a placeholder that logs emails

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Pilates Connect <noreply@pilatesconnect.com.au>",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      console.error("[v0] Email send error:", error)
      return { success: false, error }
    }

    console.log("[v0] Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Email send exception:", error)
    return { success: false, error }
  }
}

// Email templates
export const emailTemplates = {
  welcomeInstructor: (name: string) => ({
    subject: "Welcome to Pilates Connect!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">Welcome to Pilates Connect, ${name}!</h1>
        <p>Thank you for joining Australia's premier marketplace for Pilates instructors and studios.</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Complete your instructor profile</li>
          <li>Browse available job opportunities</li>
          <li>Set your availability for cover requests</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/instructor/profile" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Complete Your Profile
        </a>
      </div>
    `,
    text: `Welcome to Pilates Connect, ${name}! Complete your profile to start finding opportunities.`,
  }),

  welcomeStudio: (name: string) => ({
    subject: "Welcome to Pilates Connect!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">Welcome to Pilates Connect, ${name}!</h1>
        <p>Thank you for joining Australia's premier marketplace for Pilates instructors and studios.</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Post your first job opening</li>
          <li>Browse qualified instructors</li>
          <li>Request cover for urgent needs</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/studio/post-job" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Post Your First Job
        </a>
      </div>
    `,
    text: `Welcome to Pilates Connect, ${name}! Post your first job to start finding instructors.`,
  }),

  jobApplication: (instructorName: string, jobTitle: string, studioName: string) => ({
    subject: `New Application: ${instructorName} applied to ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">New Job Application</h1>
        <p><strong>${instructorName}</strong> has applied to your job posting:</p>
        <p style="font-size: 18px; font-weight: bold;">${jobTitle}</p>
        <p>Review their application and profile in your dashboard.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/studio/dashboard" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Application
        </a>
      </div>
    `,
    text: `${instructorName} applied to ${jobTitle}. View their application in your dashboard.`,
  }),

  coverRequestAccepted: (instructorName: string, date: string, studioName: string) => ({
    subject: `Cover Request Accepted by ${instructorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">Cover Request Accepted!</h1>
        <p><strong>${instructorName}</strong> has accepted your cover request for ${date}.</p>
        <p>You can now coordinate details through the messaging system.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/messages" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Send Message
        </a>
      </div>
    `,
    text: `${instructorName} accepted your cover request for ${date}. Message them to coordinate details.`,
  }),

  newMessage: (senderName: string, preview: string) => ({
    subject: `New message from ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">New Message</h1>
        <p>You have a new message from <strong>${senderName}</strong>:</p>
        <p style="background: #f5f5f5; padding: 16px; border-radius: 6px; font-style: italic;">
          ${preview}...
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/messages" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Message
        </a>
      </div>
    `,
    text: `New message from ${senderName}: ${preview}`,
  }),

  referralEarned: (referrerName: string, amount: number) => ({
    subject: "You've Earned a Referral Reward!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">Congratulations, ${referrerName}!</h1>
        <p>You've earned a referral reward of <strong>$${amount}</strong>!</p>
        <p>Your referral has successfully signed up and completed their profile.</p>
        <p>Keep sharing Pilates Connect to earn more rewards!</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://pilatesconnect.vercel.app"}/referrals" 
           style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Referral Dashboard
        </a>
      </div>
    `,
    text: `Congratulations! You've earned $${amount} from your referral.`,
  }),
}
