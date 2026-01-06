"use client"

import { Badge } from "@/components/ui/badge"
import { Award } from "lucide-react"

interface CertificationBadgeProps {
  certificationDocuments?: any[]
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
}

export function CertificationBadge({
  certificationDocuments = [],
  size = "md",
  showIcon = true,
}: CertificationBadgeProps) {
  const verifiedCount =
    Array.isArray(certificationDocuments) && certificationDocuments.filter((doc) => doc.status === "approved").length

  if (!verifiedCount) {
    return null
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }

  return (
    <Badge className={`bg-blue-100 text-blue-800 ${sizeClasses[size]}`} variant="outline">
      {showIcon && <Award className={`${iconSizes[size]} mr-1`} />}
      {verifiedCount} Verified
    </Badge>
  )
}
