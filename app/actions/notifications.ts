"use server"

import { sendEmail, emailTemplates } from "@/lib/email"

export async function sendWelcomeEmail(email: string, name: string, userType: "instructor" | "studio") {
  const template =
    userType === "instructor" ? emailTemplates.welcomeInstructor(name) : emailTemplates.welcomeStudio(name)

  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

export async function sendJobApplicationEmail(
  studioEmail: string,
  instructorName: string,
  jobTitle: string,
  studioName: string,
) {
  const template = emailTemplates.jobApplication(instructorName, jobTitle, studioName)

  return await sendEmail({
    to: studioEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

export async function sendCoverAcceptedEmail(
  studioEmail: string,
  instructorName: string,
  date: string,
  studioName: string,
) {
  const template = emailTemplates.coverRequestAccepted(instructorName, date, studioName)

  return await sendEmail({
    to: studioEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

export async function sendNewMessageEmail(recipientEmail: string, senderName: string, messagePreview: string) {
  const template = emailTemplates.newMessage(senderName, messagePreview)

  return await sendEmail({
    to: recipientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

export async function sendReferralEarnedEmail(referrerEmail: string, referrerName: string, amount: number) {
  const template = emailTemplates.referralEarned(referrerName, amount)

  return await sendEmail({
    to: referrerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}
