import type { Metadata } from "next"
import ClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Pilates Connect - Australia's Marketplace for Pilates Instructors & Studios",
  description:
    "Find certified Reformer, Cadillac, and Mat Pilates instructors in Australia. Connect studios with qualified instructors for permanent positions and class covers. Join 250+ instructors and 90+ studios.",
  keywords:
    "pilates instructors Australia, pilates jobs, reformer instructor, cadillac pilates, mat pilates, pilates studio hiring, pilates marketplace, pilates careers",
  openGraph: {
    title: "Pilates Connect - Australia's Pilates Marketplace",
    description:
      "Connect with certified Pilates instructors and studios across Australia. Find jobs, post availability, and manage class covers.",
    type: "website",
    locale: "en_AU",
    siteName: "Pilates Connect",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pilates Connect - Australia's Pilates Marketplace",
    description: "Find certified Pilates instructors and studios across Australia",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HomePage() {
  return <ClientPage />
}
