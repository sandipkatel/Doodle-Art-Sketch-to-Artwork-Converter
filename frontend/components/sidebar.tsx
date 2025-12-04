"use client"

import type React from "react"

import type { SketchItem } from "@/app/page"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, Trash2, Sparkles, AlertCircle } from "lucide-react"
import { useRef, useState } from "react"
import Image from "next/image"

interface SidebarProps {
  sketches: SketchItem[]
  selectedSketchId: string | null
  onSelectSketch: (id: string) => void
  onDelete: (id: string) => void
  onUpload: (file: File) => void
  onTransform: (id: string) => void
}

export function Sidebar({ sketches, selectedSketchId, onSelectSketch, onDelete, onUpload, onTransform }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [transforming, setTransforming] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const MAX_FILE_SIZE = 10 * 1024 * 1024
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({ ...prev, upload: "File size exceeds 10MB limit" }))
        return
      }
      setErrors((prev) => ({ ...prev, upload: "" }))
      onUpload(file)
    }
  }

  const handleTransformClick = async (id: string) => {
    setTransforming(id)
    setErrors((prev) => ({ ...prev, [id]: "" }))

    try {
      await onTransform(id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to transform sketch"
      setErrors((prev) => ({ ...prev, [id]: errorMessage }))
      console.error("[v0] Transform error:", error)
    } finally {
      setTransforming(null)
    }
  }

  return (
    <aside className="w-80 bg-sidebar border-l border-sidebar-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-4">History</h2>

        {errors.upload && (
          <div className="mb-3 p-2 bg-destructive/10 border border-destructive/30 rounded-md flex gap-2 text-xs text-destructive">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{errors.upload}</span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="w-full gap-2 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent"
        >
          <Upload size={18} />
          Upload Sketch
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Sketches List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {sketches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sidebar-foreground/60 text-sm">No sketches yet. Start drawing!</p>
            </div>
          ) : (
            sketches.map((sketch) => (
              <div
                key={sketch.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedSketchId === sketch.id
                    ? "border-sidebar-primary bg-sidebar-primary/10"
                    : "border-sidebar-border hover:border-sidebar-primary/50 bg-sidebar/50"
                }`}
                onClick={() => onSelectSketch(sketch.id)}
              >
                {/* Sketch Preview */}
                <div className="relative w-full h-32 bg-white rounded mb-3 overflow-hidden">
                  <Image
                    src={sketch.transformedImage || sketch.imageData}
                    alt="Sketch preview"
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Timestamp */}
                <p className="text-xs text-sidebar-foreground/60 mb-3">
                  {new Date(sketch.timestamp).toLocaleTimeString()}
                </p>

                {errors[sketch.id] && (
                  <div className="mb-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive flex gap-2">
                    <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{errors[sketch.id]}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {!sketch.transformedImage && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTransformClick(sketch.id)
                      }}
                      disabled={transforming === sketch.id}
                      className="flex-1 gap-1 text-xs"
                    >
                      <Sparkles size={14} />
                      {transforming === sketch.id ? "Transforming..." : "Transform"}
                    </Button>
                  )}
                  {sketch.transformedImage && (
                    <div className="flex-1 px-2 py-1 rounded text-xs bg-sidebar-accent text-sidebar-accent-foreground flex items-center justify-center">
                      ✓ Transformed
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(sketch.id)
                    }}
                    className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
