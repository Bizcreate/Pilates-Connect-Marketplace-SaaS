import type { Metadata } from "next"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = { title: "Pilates Connect", description: "…",
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const enableAnalytics =
    process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "1"

  return (
    <html lang="en">
      <body>
        {children}
        {enableAnalytics ? <Analytics /> : null}
      </body>
    </html>
  )
}
