import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://pilatesconnect.vercel.app"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/jobs", "/find-instructors", "/pricing", "/referrals", "/auth/sign-up"],
        disallow: ["/admin", "/instructor/dashboard", "/studio/dashboard", "/api", "/messages"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
