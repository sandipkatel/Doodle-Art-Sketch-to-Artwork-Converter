import { type NextRequest, NextResponse } from "next/server"

/**
 * Template API endpoint for transforming sketches to images
 * This is a generic template. Replace with your actual FastAPI backend call.
 *
 * Expected FastAPI backend endpoint structure:
 * POST /transform-sketch
 * Body: { sketch: "base64_image_data" }
 * Response: { success: true, image: "base64_image_data" }
 */
export async function POST(request: NextRequest) {
  try {
    const { sketch } = await request.json()

    if (!sketch) {
      return NextResponse.json({ error: "No sketch provided" }, { status: 400 })
    }

    const transformedImage = await transformSketchToImage(sketch)

    return NextResponse.json({
      success: true,
      image: transformedImage,
    })
  } catch (error) {
    console.error("[Transform Error]:", error)
    return NextResponse.json(
      { error: "Failed to transform sketch", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

/**
 * Template function for calling your FastAPI backend
 * Update FASTAPI_BACKEND_URL with your actual backend URL
 */
async function transformSketchToImage(sketchData: string): Promise<string> {
  try {
    const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || "http://localhost:8000"

    console.log("[v0] Calling FastAPI backend at:", BACKEND_URL)

    const response = await fetch(`${BACKEND_URL}/transform-sketch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sketch: sketchData,
        // Add any additional parameters your FastAPI backend expects
      }),
      // Timeout after 30 seconds
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(`Backend error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()

    if (!result.image) {
      throw new Error("No image returned from backend")
    }

    console.log("[v0] Successfully transformed sketch")
    return result.image
  } catch (error) {
    console.error("[v0] Sketch transformation error:", error)
    throw error
  }
}
