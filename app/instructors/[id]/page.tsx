import Link from "next/link"
import { notFound } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MapPin, Star, Award, Briefcase, GraduationCap, Clock, CheckCircle2, FileText, Video, Instagram, Globe, ArrowLeft, MessageSquare, Facebook, Linkedin } from 'lucide-react'
import { createClient } from "@/lib/supabase/server"

export default async function InstructorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: instructor, error } = await supabase
    .from("profiles")
    .select(`
      *,
      instructor_profiles(*)
    `)
    .eq("id", id)
    .eq("user_type", "instructor")
    .maybeSingle()

  if (error || !instructor) {
    console.error("[v0] Error fetching instructor:", error)
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userType: string | null = null
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()
    userType = profile?.user_type || null
  }

  const instructorProfile = instructor.instructor_profiles?.[0] || {}
  const socialLinks = instructorProfile.social_links || {}

  const { data: availabilitySlots } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("instructor_id", id)
    .eq("is_available", true)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(10)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-6xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/find-instructors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Instructors
            </Link>
          </Button>

          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={instructorProfile.profile_image || "/placeholder.svg?height=128&width=128"}
                  alt={instructor.display_name}
                  className="h-32 w-32 rounded-full object-cover mx-auto md:mx-0"
                />
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{instructor.display_name}</h1>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{instructor.location || "Location not specified"}</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        {instructorProfile.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-primary text-primary" />
                            <span className="font-semibold">{instructorProfile.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({instructorProfile.review_count || 0} reviews)
                            </span>
                          </div>
                        )}
                        <Badge variant="default">Available</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {user && userType === "studio" ? (
                        <>
                          <Button size="lg" asChild>
                            <Link href={`/messages?userId=${instructor.id}`}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Link>
                          </Button>
                          <Button size="lg" variant="outline" asChild>
                            <Link href={`/studio/post-job?instructorId=${instructor.id}`}>
                              <Briefcase className="h-4 w-4 mr-2" />
                              Offer Job
                            </Link>
                          </Button>
                        </>
                      ) : !user ? (
                        <Button size="lg" asChild>
                          <Link href="/auth/login">Sign In to Contact</Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{instructorProfile.bio || "No bio provided"}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{instructorProfile.years_experience || 0}</div>
                      <div className="text-xs text-muted-foreground">Years Experience</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{instructorProfile.total_classes || 0}+</div>
                      <div className="text-xs text-muted-foreground">Classes Taught</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {instructorProfile.certifications?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Certifications</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        ${instructorProfile.hourly_rate_min || 60}-{instructorProfile.hourly_rate_max || 80}
                      </div>
                      <div className="text-xs text-muted-foreground">Per Class</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Equipment Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {instructorProfile.equipment?.map((item: string) => (
                        <Badge key={item} variant="secondary" className="text-sm">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {item}
                        </Badge>
                      )) || <p className="text-sm text-muted-foreground">No equipment listed</p>}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Specialties
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {instructorProfile.specialties?.map((specialty: string) => (
                        <Badge key={specialty} variant="outline" className="text-sm">
                          {specialty}
                        </Badge>
                      )) || <p className="text-sm text-muted-foreground">No specialties listed</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {(socialLinks.website || socialLinks.instagram || socialLinks.facebook || socialLinks.linkedin) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Connect</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    {socialLinks.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={socialLinks.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}
                    {socialLinks.instagram && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </a>
                      </Button>
                    )}
                    {socialLinks.facebook && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                          <Facebook className="h-4 w-4 mr-2" />
                          Facebook
                        </a>
                      </Button>
                    )}
                    {socialLinks.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="certifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {instructorProfile.certifications?.map((cert: string) => (
                      <Badge key={cert} variant="secondary" className="text-sm py-2 px-3">
                        <Award className="h-4 w-4 mr-1" />
                        {cert}
                      </Badge>
                    )) || <p className="text-sm text-muted-foreground">No certifications listed</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Professional Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {instructorProfile.cv_url && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Curriculum Vitae</p>
                          <p className="text-sm text-muted-foreground">Professional CV</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={instructorProfile.cv_url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  )}
                  {instructorProfile.insurance_url && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Insurance Certificate</p>
                          <p className="text-sm text-muted-foreground">Professional liability insurance</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={instructorProfile.insurance_url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  )}
                  {instructorProfile.qualifications_url && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Qualifications</p>
                          <p className="text-sm text-muted-foreground">Certification documents</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={instructorProfile.qualifications_url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  )}
                  {!instructorProfile.cv_url &&
                    !instructorProfile.insurance_url &&
                    !instructorProfile.qualifications_url && (
                      <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded yet</p>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Available Time Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {availabilitySlots && availabilitySlots.length > 0 ? (
                    <div className="space-y-3">
                      {availabilitySlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between py-3 px-4 border rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {new Date(slot.start_time).toLocaleDateString('en-AU', { 
                                  weekday: 'long', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(slot.start_time).toLocaleTimeString('en-AU', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })} - {new Date(slot.end_time).toLocaleTimeString('en-AU', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                          {slot.notes && (
                            <span className="text-sm text-muted-foreground max-w-xs truncate">{slot.notes}</span>
                          )}
                          {user && userType === "studio" && (
                            <Button size="sm" asChild>
                              <Link href={`/messages?userId=${instructor.id}&slotId=${slot.id}`}>
                                Book Slot
                              </Link>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No upcoming availability slots</p>
                  )}
                </CardContent>
              </Card>

              {instructorProfile.availability && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-4 w-4 text-primary" />
                      General Weekly Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(instructorProfile.availability).map(([day, times]) => (
                        <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                          <span className="font-medium capitalize text-sm">{day}</span>
                          <span
                            className={
                              times === "Not Available" ? "text-muted-foreground text-sm" : "text-foreground font-medium text-sm"
                            }
                          >
                            {times as string}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Preview Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {instructorProfile.preview_videos && instructorProfile.preview_videos.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {instructorProfile.preview_videos.map((video: string, index: number) => (
                        <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <video src={video} controls className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No preview videos uploaded</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Image Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  {instructorProfile.image_gallery && instructorProfile.image_gallery.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {instructorProfile.image_gallery.map((image: string, index: number) => (
                        <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No images uploaded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
