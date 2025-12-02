"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Briefcase, Calendar, Clock } from "lucide-react"
import Link from "next/link"

interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  updated_at: string
  messages: Message[]
}

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  read: boolean
}

interface ConversationWithDetails {
  id: string
  otherUser: {
    id: string
    display_name: string
    avatar_url: string | null
    user_type: string
  } | null
  lastMessage: Message | undefined
  unreadCount: number
  updatedAt: string
}

interface CoverRequest {
  id: string
  date: string
  start_time: string
  end_time: string
  class_type: string | null
  status: string
  instructor_id: string | null
  instructor: {
    display_name: string
  } | null
}

interface JobApplication {
  id: string
  status: string
  created_at: string
  job: {
    title: string
  }
  instructor: {
    display_name: string
  }
}

export function StudioMessagesView({ studioId }: { studioId: string }) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [coverRequests, setCoverRequests] = useState<CoverRequest[]>([])
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studioId) {
      loadAllData()
    }
  }, [studioId])

  const loadAllData = async () => {
    const supabase = createClient()

    const { data: conversationsData, error: conversationsError } = await supabase
      .from("conversations")
      .select(`
        id,
        participant1_id,
        participant2_id,
        updated_at,
        messages(
          id,
          content,
          sender_id,
          read,
          created_at
        )
      `)
      .or(`participant1_id.eq.${studioId},participant2_id.eq.${studioId}`)
      .order("updated_at", { ascending: false })

    console.log("[v0] StudioMessagesView - Fetched conversations:", conversationsData?.length || 0)
    if (conversationsError) {
      console.error("[v0] StudioMessagesView - Error fetching conversations:", conversationsError)
    }

    const conversationsWithDetails = await Promise.all(
      (conversationsData || []).map(async (conv) => {
        const otherParticipantId = conv.participant1_id === studioId ? conv.participant2_id : conv.participant1_id

        const { data: otherUser } = await supabase
          .from("profiles")
          .select("id, display_name, user_type, avatar_url")
          .eq("id", otherParticipantId)
          .single()

        const messages = Array.isArray(conv.messages) ? conv.messages : []
        const lastMessage = messages.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0]

        const unreadCount = messages.filter((m) => !m.read && m.sender_id !== studioId).length

        return {
          id: conv.id,
          otherUser,
          lastMessage,
          unreadCount,
          updatedAt: conv.updated_at,
        }
      }),
    )

    console.log("[v0] StudioMessagesView - Conversations with details:", conversationsWithDetails.length)
    setConversations(conversationsWithDetails)

    // Load cover requests
    const { data: coverData } = await supabase
      .from("cover_requests")
      .select(`
        id,
        date,
        start_time,
        end_time,
        class_type,
        status,
        instructor_id,
        instructor:profiles!cover_requests_instructor_id_fkey(display_name)
      `)
      .eq("studio_id", studioId)
      .order("date", { ascending: false })
      .limit(10)

    setCoverRequests(coverData || [])

    // Load job applications
    const { data: jobsData } = await supabase.from("jobs").select("id").eq("studio_id", studioId)

    if (jobsData && jobsData.length > 0) {
      const { data: applicationsData } = await supabase
        .from("job_applications")
        .select(`
          id,
          status,
          created_at,
          job:jobs!job_applications_job_id_fkey(title),
          instructor:profiles!job_applications_instructor_id_fkey(display_name)
        `)
        .in(
          "job_id",
          jobsData.map((j) => j.id),
        )
        .order("created_at", { ascending: false })
        .limit(10)

      setJobApplications(applicationsData || [])
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>
  }

  const allMessages: Array<{
    id: string
    content: string
    senderName: string
    conversationId: string
    createdAt: string
    isUnread: boolean
  }> = []

  conversations.forEach((conv) => {
    if (conv.lastMessage) {
      allMessages.push({
        id: conv.lastMessage.id,
        content: conv.lastMessage.content,
        senderName: conv.otherUser?.display_name || "Unknown",
        conversationId: conv.id,
        createdAt: conv.lastMessage.created_at,
        isUnread: conv.unreadCount > 0,
      })
    }
  })

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="messages">
          Messages
          {conversations.filter((c) => c.unreadCount > 0).length > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="covers">Cover Requests</TabsTrigger>
        <TabsTrigger value="applications">Job Applications</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4 mt-4">
        <div className="space-y-3">
          {allMessages.slice(0, 3).map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{msg.senderName}</p>
                  {msg.isUnread && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.createdAt).toLocaleDateString("en-AU")}
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/messages?conversation=${msg.conversationId}`}>View</Link>
              </Button>
            </div>
          ))}

          {coverRequests.slice(0, 3).map((request) => (
            <div key={request.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  Cover Request - {new Date(request.date).toLocaleDateString("en-AU")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {request.start_time} - {request.end_time}
                  {request.class_type && ` • ${request.class_type}`}
                </p>
                <Badge variant={request.status === "filled" ? "default" : "secondary"} className="mt-1">
                  {request.status}
                </Badge>
              </div>
            </div>
          ))}

          {jobApplications.slice(0, 3).map((app) => (
            <div key={app.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
              <Briefcase className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Application: {app.job.title}</p>
                <p className="text-sm text-muted-foreground">{app.instructor.display_name}</p>
                <Badge variant="outline" className="mt-1">
                  {app.status}
                </Badge>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href="/studio/applicants">View</Link>
              </Button>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="messages" className="space-y-3 mt-4">
        {allMessages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No messages yet</p>
        ) : (
          allMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{msg.senderName}</p>
                  {msg.isUnread && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.createdAt).toLocaleDateString("en-AU")}
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/messages?conversation=${msg.conversationId}`}>Reply</Link>
              </Button>
            </div>
          ))
        )}
      </TabsContent>

      <TabsContent value="covers" className="space-y-3 mt-4">
        {coverRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No cover requests</p>
        ) : (
          coverRequests.map((request) => (
            <div key={request.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {new Date(request.date).toLocaleDateString("en-AU", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {request.start_time} - {request.end_time}
                  </span>
                  {request.class_type && <span>• {request.class_type}</span>}
                </div>
                {request.instructor && (
                  <p className="text-sm text-muted-foreground mt-1">Assigned to: {request.instructor.display_name}</p>
                )}
                <Badge variant={request.status === "filled" ? "default" : "secondary"} className="mt-2">
                  {request.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </TabsContent>

      <TabsContent value="applications" className="space-y-3 mt-4">
        {jobApplications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No applications yet</p>
        ) : (
          jobApplications.map((app) => (
            <div key={app.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
              <Briefcase className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{app.job.title}</p>
                <p className="text-sm text-muted-foreground">{app.instructor.display_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{app.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(app.created_at).toLocaleDateString("en-AU")}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href="/studio/applicants">View Details</Link>
              </Button>
            </div>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
