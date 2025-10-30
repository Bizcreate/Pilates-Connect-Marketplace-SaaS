import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { Analytics as VercelAnalytics } from "@vercel/analytics/react"
import { Analytics } from "@/components/analytics"

export const metadata: Metadata = {
  title: "Pilates Connect",
  description: "Australia's premier marketplace connecting Pilates instructors with studios",
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <VercelAnalytics />
      </body>
    </html>
  )
}
