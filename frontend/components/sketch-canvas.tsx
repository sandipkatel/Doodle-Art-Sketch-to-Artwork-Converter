"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PencilIcon, Eraser, Trash2, Download } from "lucide-react"

interface SketchCanvasProps {
  onSave: (imageData: string) => void
}

export function SketchCanvas({ onSave }: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"pen" | "eraser">("pen")
  const [lineWidth, setLineWidth] = useState(3)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to window size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Fill with white background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "pen") {
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = lineWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === "eraser") {
      ctx.clearRect(x - lineWidth / 2, y - lineWidth / 2, lineWidth, lineWidth)
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveSketch = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL("image/png")
    onSave(imageData)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant={tool === "pen" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("pen")}
            className="gap-2"
            aria-label="Select pen tool"
          >
            <PencilIcon size={18} />
            Pen
          </Button>
          <Button
            variant={tool === "eraser" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("eraser")}
            className="gap-2"
            aria-label="Select eraser tool"
          >
            <Eraser size={18} />
            Eraser
          </Button>

          {/* Line Width Control */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
            <label htmlFor="lineWidth" className="text-sm font-medium text-muted-foreground">
              Size:
            </label>
            <input
              id="lineWidth"
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              aria-label="Brush size"
            />
            <span className="text-sm text-muted-foreground w-8">{lineWidth}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            className="gap-2 text-destructive hover:text-destructive bg-transparent"
            aria-label="Clear canvas"
          >
            <Trash2 size={18} />
            Clear
          </Button>
          <Button size="sm" onClick={saveSketch} className="gap-2" aria-label="Save sketch to history">
            <Download size={18} />
            Save Sketch
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="flex-1 cursor-crosshair bg-white"
        aria-label="Drawing canvas"
      />
    </div>
  )
}
