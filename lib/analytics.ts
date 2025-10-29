"use client"

// Google Analytics tracking
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ""

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Predefined event trackers
export const trackEvent = {
  // User actions
  signUp: (userType: "instructor" | "studio") => {
    event({
      action: "sign_up",
      category: "User",
      label: userType,
    })
  },

  login: (userType: "instructor" | "studio") => {
    event({
      action: "login",
      category: "User",
      label: userType,
    })
  },

  // Job actions
  postJob: (jobType: string) => {
    event({
      action: "post_job",
      category: "Job",
      label: jobType,
    })
  },

  applyToJob: (jobId: string) => {
    event({
      action: "apply_to_job",
      category: "Job",
      label: jobId,
    })
  },

  viewJob: (jobId: string) => {
    event({
      action: "view_job",
      category: "Job",
      label: jobId,
    })
  },

  // Cover requests
  requestCover: () => {
    event({
      action: "request_cover",
      category: "Cover",
    })
  },

  acceptCover: (requestId: string) => {
    event({
      action: "accept_cover",
      category: "Cover",
      label: requestId,
    })
  },

  // Instructor actions
  postAvailability: () => {
    event({
      action: "post_availability",
      category: "Instructor",
    })
  },

  viewInstructorProfile: (instructorId: string) => {
    event({
      action: "view_instructor_profile",
      category: "Instructor",
      label: instructorId,
    })
  },

  // Messaging
  sendMessage: () => {
    event({
      action: "send_message",
      category: "Communication",
    })
  },

  // Referrals
  shareReferralLink: () => {
    event({
      action: "share_referral",
      category: "Referral",
    })
  },

  // Payments
  startCheckout: (plan: string) => {
    event({
      action: "begin_checkout",
      category: "Payment",
      label: plan,
    })
  },

  completeCheckout: (plan: string, value: number) => {
    event({
      action: "purchase",
      category: "Payment",
      label: plan,
      value,
    })
  },

  // Search and discovery
  searchJobs: (query: string) => {
    event({
      action: "search",
      category: "Discovery",
      label: query,
    })
  },

  filterInstructors: (filters: string) => {
    event({
      action: "filter_instructors",
      category: "Discovery",
      label: filters,
    })
  },
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void
  }
}
