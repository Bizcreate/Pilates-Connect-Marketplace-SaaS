import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing Plans | Pilates Connect",
  description:
    "Simple, transparent pricing for Pilates studios. Free for instructors. Choose the plan that fits your studio's hiring needs.",
  keywords: ["pilates connect pricing", "studio subscription", "hiring platform cost", "pilates marketplace pricing"],
  openGraph: {
    title: "Pricing Plans | Pilates Connect",
    description: "Free for instructors. Affordable plans for studios. Start hiring today.",
    type: "website",
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
