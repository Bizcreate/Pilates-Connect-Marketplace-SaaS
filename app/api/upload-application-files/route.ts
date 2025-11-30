import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload API: Starting file upload...")

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const userId = formData.get("userId") as string
    const jobId = formData.get("jobId") as string

    console.log(`[v0] Upload API: Received ${files.length} files for user ${userId}, job ${jobId}`)

    if (!userId || !jobId) {
      return NextResponse.json({ error: "Missing userId or jobId" }, { status: 400 })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      if (file && file.size > 0) {
        console.log(`[v0] Upload API: Uploading ${file.name} (${file.size} bytes)...`)

        const blob = await put(`applications/${userId}/${jobId}/${file.name}`, file, {
          access: "public",
        })

        uploadedUrls.push(blob.url)
        console.log(`[v0] Upload API: Uploaded ${file.name} to ${blob.url}`)
      }
    }

    console.log(`[v0] Upload API: Successfully uploaded ${uploadedUrls.length} files`)

    return NextResponse.json({ urls: uploadedUrls })
  } catch (error) {
    console.error("[v0] Upload API: Error uploading files:", error)
    return NextResponse.json(
      {
        error: "Failed to upload files",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
