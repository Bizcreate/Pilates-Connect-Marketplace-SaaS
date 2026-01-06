"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Briefcase, Building2, Shield, Award, Settings, BarChart3 } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Instructors",
    href: "/admin/instructors",
    icon: Users,
  },
  {
    title: "Studios",
    href: "/admin/studios",
    icon: Building2,
  },
  {
    title: "Jobs",
    href: "/admin/jobs",
    icon: Briefcase,
  },
  {
    title: "Insurance Review",
    href: "/admin/insurance-review",
    icon: Shield,
  },
  {
    title: "Certifications",
    href: "/admin/certification-review",
    icon: Award,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-background min-h-screen">
      <div className="p-6">
        <Link href="/admin/dashboard">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </Link>
      </div>

      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
