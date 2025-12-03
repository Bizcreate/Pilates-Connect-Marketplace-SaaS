import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] Uploading file:", file.name, file.type, file.size)

    const isVideo = file.type.startsWith("video/")
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024 // 50MB for videos, 5MB for images

    if (file.size > maxSize) {
      const maxSizeMB = isVideo ? "50MB" : "5MB"
      return NextResponse.json({ error: `File too large. Maximum size is ${maxSizeMB}` }, { status: 400 })
    }

    // Upload to Vercel Blob with content type
    const blob = await put(file.name, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true, // Add random suffix to prevent filename conflicts
    })

    console.log("[v0] Upload successful:", blob.url)

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
