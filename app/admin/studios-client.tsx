"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, MapPin } from "lucide-react"
import Link from "next/link"

interface StudiosClientProps {
  studios: any[]
}

export function StudiosClient({ studios }: StudiosClientProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStudios = studios.filter(
    (studio) =>
      studio.studio_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studio.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studio.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search studios by name, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredStudios.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {searchTerm ? "No studios found matching your search" : "No studios registered yet"}
            </CardContent>
          </Card>
        ) : (
          filteredStudios.map((studio) => (
            <Card key={studio.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold">{studio.studio_name?.charAt(0) || "S"}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{studio.studio_name || "Unnamed Studio"}</h3>
                      <p className="text-sm text-muted-foreground">{studio.email}</p>
                      {studio.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {studio.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href={`/studios/${studio.user_id}`}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  )
}
