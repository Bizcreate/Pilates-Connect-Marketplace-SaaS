import { notFound } from "next/navigation"
import { getProduct } from "@/lib/products"
import Checkout from "@/components/checkout"
import { SiteHeader } from "@/components/site-header"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const product = getProduct(productId)

  if (!product || product.priceInCents === 0) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 container py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/pricing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscribe to {product.name}</h1>
          <p className="text-muted-foreground">{product.description}</p>
        </div>

        <Checkout productId={productId} />
      </main>
    </div>
  )
}
