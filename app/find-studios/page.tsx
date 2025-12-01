"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Search, MapPin, Briefcase } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"

export default function FindStudiosPage() {
  const [studios, setStudios] = useState<any[]>([])
  const [filteredStudios, setFilteredStudios] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadStudios() {
      console.log("[v0] Loading studios...")

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_type", "studio")
        .order("created_at", { ascending: false })

      if (!profilesData) {
        setLoading(false)
        return
      }

      const studiosWithDetails = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: studioData } = await supabase
            .from("studio_profiles")
            .select("*")
            .eq("id", profile.id)
            .maybeSingle()

          const { data: jobsCount } = await supabase
            .from("jobs")
            .select("id", { count: "exact", head: true })
            .eq("studio_id", profile.id)
            .eq("status", "open")

          return {
            ...profile,
            ...studioData,
            activeJobs: jobsCount || 0,
          }
        }),
      )

      console.log("[v0] Loaded studios:", studiosWithDetails.length)
      setStudios(studiosWithDetails)
      setFilteredStudios(studiosWithDetails)
      setLoading(false)
    }

    loadStudios()
  }, [supabase])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudios(studios)
    } else {
      const filtered = studios.filter(
        (studio) =>
          studio.studio_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studio.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studio.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studio.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredStudios(filtered)
    }
  }, [searchTerm, studios])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="bg-primary/5 border-b">
          <div className="container py-12">
            <h1 className="text-4xl font-bold mb-4">Find Studios</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Connect with Pilates studios looking for talented instructors
            </p>

            <div className="max-w-2xl relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by studio name, location, or description..."
                className="pl-10 h-12 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="container py-8">
          {loading ? (
            <div className="text-center py-12">
              <p>Loading studios...</p>
            </div>
          ) : filteredStudios.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">No Studios Found</h2>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  {filteredStudios.length} {filteredStudios.length === 1 ? "studio" : "studios"} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudios.map((studio) => (
                  <Card key={studio.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        {studio.avatar_url ? (
                          <Image
                            src={studio.avatar_url || "/placeholder.svg"}
                            alt={studio.studio_name || studio.display_name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-[60px] w-[60px] rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg line-clamp-1">
                            {studio.studio_name || studio.display_name}
                          </CardTitle>
                          {studio.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="line-clamp-1">{studio.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {studio.description || "No description available"}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{studio.activeJobs || 0} active jobs</Badge>
                        <Button size="sm" asChild>
                          <Link href={`/studios/${studio.id}`}>View Profile</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
