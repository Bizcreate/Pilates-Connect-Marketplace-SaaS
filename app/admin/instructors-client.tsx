"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, MapPin } from "lucide-react"
import Link from "next/link"

interface InstructorsClientProps {
  instructors: any[]
}

export function InstructorsClient({ instructors }: InstructorsClientProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInstructors = instructors.filter(
    (instructor) =>
      instructor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search instructors by name, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredInstructors.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {searchTerm ? "No instructors found matching your search" : "No instructors registered yet"}
            </CardContent>
          </Card>
        ) : (
          filteredInstructors.map((instructor) => (
            <Card key={instructor.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold">{instructor.full_name?.charAt(0) || "I"}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{instructor.full_name || "Unnamed Instructor"}</h3>
                      <p className="text-sm text-muted-foreground">{instructor.email}</p>
                      {instructor.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {instructor.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {instructor.insurance_documents &&
                      Array.isArray(instructor.insurance_documents) &&
                      instructor.insurance_documents.some((doc: any) => doc.status === "approved") && (
                        <Badge className="bg-green-100 text-green-800">Insured</Badge>
                      )}
                    {instructor.certification_documents &&
                      Array.isArray(instructor.certification_documents) &&
                      instructor.certification_documents.some((doc: any) => doc.status === "approved") && (
                        <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                      )}
                    <Link href={`/instructors/${instructor.user_id}`}>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  )
}
