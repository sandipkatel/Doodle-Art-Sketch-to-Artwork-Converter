"use client";

import type React from "react";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Eraser,
  Trash2,
  Upload,
  Sparkles,
  Box,
  Image as Scene,
} from "lucide-react";

interface SketchCanvasProps {
  onTransform: (imageData: string) => void;
  onUpload: (file: File) => void;
  onSketchTypeChange: (type: "object" | "scene") => void;
  sketchType: "object" | "scene";
}

export function SketchCanvas({
  onTransform,
  onUpload,
  onSketchTypeChange,
  sketchType,
}: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [transforming, setTransforming] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [lineWidth, setLineWidth] = useState(3);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Calculate and set canvas size based on container height
  useEffect(() => {
    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerHeight = container.clientHeight;
      const size = Math.min(containerHeight, window.innerWidth - 48) - 24; // Account for padding

      setCanvasSize({ width: size, height: size });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Fill with white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // If there's an uploaded image, draw it
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = uploadedImage;
    }
  }, [canvasSize, uploadedImage]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "pen") {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === "eraser") {
      ctx.clearRect(x - lineWidth / 2, y - lineWidth / 2, lineWidth, lineWidth);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setUploadedImage(null);
  };

  const handleTransformClick = async () => {
    setTransforming(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const imageData = canvas.toDataURL("image/png");
      await onTransform(imageData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to transform sketch";
      console.error("Transform error:", error);
    } finally {
      setTransforming(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds 10MB limit");
        return;
      }

      // Read the file and set it as uploaded image
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImage(result);
      };
      reader.readAsDataURL(file);

      onUpload(file);
    }
  };

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
            <Pencil size={18} />
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
            <label
              htmlFor="lineWidth"
              className="text-sm font-medium text-muted-foreground"
            >
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
            <span className="text-sm text-muted-foreground w-8">
              {lineWidth}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sketchType} onValueChange={(value) => onSketchTypeChange(value as "object" | "scene") }>
            <SelectTrigger className="h-7 w-25 ml-2 text-xs px-2 py-0">
              <SelectValue placeholder="Sketch Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="object" className="text-xs py-1">
                <div className="flex flex-row">
                  <Box className="mr-2 h-4 w-4" /> Object
                </div>
              </SelectItem>
              <SelectItem value="scene" className="text-xs py-1">
                <div className="flex flex-row">
                  <Scene className="mr-2 h-4 w-4" />
                  Scene
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
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
        </div>
      </div>

      {/* Canvas Container - Square and Centered */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 bg-muted/30"
      >
        <div className="flex flex-col items-center gap-1">
          {/* <p className="text-sm text-muted-foreground">
            Draw a {sketchType === "object" ? "single object" : "scene"} to
            transform
          </p> */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
            }}
            className="cursor-crosshair bg-white border border-border shadow-lg"
            aria-label="Drawing canvas"
          />
        </div>
      </div>

      {/* Upload and Transform Buttons */}
      <div className="h-max flex items-center gap-3 p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-12 flex-1 gap-1"
        >
          <Upload size={14} />
          Upload Sketch
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          size="sm"
          variant="default"
          onClick={handleTransformClick}
          disabled={transforming}
          className="h-12 flex-1 gap-1"
        >
          <Sparkles size={14} />
          {transforming ? "Transforming..." : `Transform ${sketchType}`}
        </Button>
      </div>
    </div>
  );
}
