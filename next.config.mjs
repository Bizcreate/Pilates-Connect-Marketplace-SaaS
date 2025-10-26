const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self';",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vusercontent.net https://vercel-insights.com;",
      "connect-src 'self' https://*.supabase.co https://vercel-insights.com;",
      "img-src 'self' data: blob:;",
      "style-src 'self' 'unsafe-inline';",
      "font-src 'self' data:;",
    ].join(" "),
  },
]

export default {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
}
