import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find Qualified Pilates Instructors | Pilates Connect",
  description:
    "Connect with certified Pilates instructors across Australia. Search by location, certification, specialization, and availability. Find the perfect instructor for your studio.",
  keywords: [
    "find pilates instructors",
    "hire pilates instructor",
    "certified pilates teachers",
    "reformer instructors",
    "pilates cover instructors",
    "australia pilates instructors",
  ],
  openGraph: {
    title: "Find Qualified Pilates Instructors | Pilates Connect",
    description: "Connect with certified Pilates instructors for permanent positions or urgent covers.",
    type: "website",
  },
}

export default function FindInstructorsLayout({ children }: { children: React.ReactNode }) {
  return children
}
