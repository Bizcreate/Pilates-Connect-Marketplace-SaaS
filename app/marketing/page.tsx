import type { Metadata } from "next"
import MarketingClient from "./marketing-client"

export const metadata: Metadata = {
  title: "Pilates Connect - Join Australia's Premier Pilates Marketplace | Launching Soon",
  description:
    "The all-in-one platform connecting Pilates studios with certified instructors. Find permanent positions, urgent covers, and flexible work. Join the waitlist for early access.",
  keywords:
    "pilates marketplace, pilates jobs Australia, hire pilates instructor, reformer pilates jobs, pilates cover teachers, pilates studio hiring, pilates careers, australian pilates instructors",
  openGraph: {
    title: "Pilates Connect - Australia's Pilates Marketplace Launching Soon",
    description:
      "Join studios and instructors transforming how they connect, hire, and grow in the Pilates industry. Sign up for early access.",
    type: "website",
    locale: "en_AU",
    siteName: "Pilates Connect",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pilates Connect - Join the Waitlist",
    description: "Be the first to access Australia's premier Pilates marketplace",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function MarketingPage() {
  return <MarketingClient />
}
