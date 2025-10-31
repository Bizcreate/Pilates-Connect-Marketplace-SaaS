"use client"

import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Linkedin, Link2, Mail } from "lucide-react"

interface SocialShareProps {
  url: string
  title: string
  description?: string
}

export function SocialShare({ url, title, description }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || "")

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-2">Share:</span>
      <Button size="sm" variant="outline" onClick={() => window.open(shareLinks.facebook, "_blank")}>
        <Facebook className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={() => window.open(shareLinks.twitter, "_blank")}>
        <Twitter className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={() => window.open(shareLinks.linkedin, "_blank")}>
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={() => window.open(shareLinks.email, "_blank")}>
        <Mail className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={copyToClipboard}>
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
