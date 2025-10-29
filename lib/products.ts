export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  popular?: boolean
}

// Source of truth for all subscription products
export const STUDIO_PRODUCTS: Product[] = [
  {
    id: "studio-basic",
    name: "Basic",
    description: "Perfect for getting started",
    priceInCents: 0, // Free
    features: [
      "Create studio profile",
      "Post up to 2 jobs per month",
      "Browse instructor profiles",
      "Basic applicant management",
      "Email support",
    ],
  },
  {
    id: "studio-professional",
    name: "Professional",
    description: "Most popular for growing Pilates studios",
    priceInCents: 4900, // $49/month
    popular: true,
    features: [
      "Everything in Basic",
      "Unlimited job postings",
      "Advanced search (equipment, certifications)",
      "Applicant tracking system",
      "Direct messaging with instructors",
      "Featured job listings (2/month)",
      "Priority support",
      "Analytics dashboard",
    ],
  },
  {
    id: "studio-enterprise",
    name: "Enterprise",
    description: "For multi-location Pilates chains",
    priceInCents: 14900, // $149/month
    features: [
      "Everything in Professional",
      "Unlimited featured job listings",
      "Multi-location management",
      "Team collaboration tools",
      "Custom branding",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced reporting",
    ],
  },
]

export function getProduct(productId: string): Product | undefined {
  return STUDIO_PRODUCTS.find((p) => p.id === productId)
}

export function formatPrice(priceInCents: number): string {
  if (priceInCents === 0) return "Free"
  return `$${(priceInCents / 100).toFixed(0)}`
}
