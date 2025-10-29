import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Pilates Jobs & Cover Requests | Pilates Connect",
  description:
    "Find permanent Pilates instructor positions and urgent cover requests across Australia. Browse full-time, part-time, casual, and contract opportunities at top studios.",
  keywords: [
    "pilates jobs australia",
    "pilates instructor jobs",
    "pilates cover requests",
    "reformer instructor jobs",
    "pilates employment",
    "studio jobs",
    "pilates careers",
  ],
  openGraph: {
    title: "Browse Pilates Jobs & Cover Requests | Pilates Connect",
    description: "Find your next Pilates teaching opportunity. Permanent positions and urgent covers available.",
    type: "website",
  },
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children
}
