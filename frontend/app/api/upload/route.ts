import { type NextRequest, NextResponse } from "next/server"

/**
 * Template API endpoint for handling file uploads
 * Currently supports basic file upload handling with base64 conversion
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (example: 10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // You can extend this to store files using: Vercel Blob, AWS S3, database, etc.
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log(`[v0] File uploaded: ${file.name} (${file.size} bytes)`)

    return NextResponse.json({
      success: true,
      fileUrl: dataUrl,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("[Upload Error]:", error)
    return NextResponse.json(
      { error: "Failed to process upload", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
