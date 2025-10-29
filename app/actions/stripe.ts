"use server"

import { stripe } from "@/lib/stripe"
import { STUDIO_PRODUCTS } from "@/lib/products"

export async function startCheckoutSession(productId: string) {
  const product = STUDIO_PRODUCTS.find((p) => p.id === productId)

  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  if (product.priceInCents === 0) {
    throw new Error("Cannot create checkout session for free product")
  }

  // Create Checkout Session for subscription
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "aud", // Australian dollars
          product_data: {
            name: `${product.name} Plan`,
            description: product.description,
          },
          unit_amount: product.priceInCents,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
  })

  return session.client_secret
}
