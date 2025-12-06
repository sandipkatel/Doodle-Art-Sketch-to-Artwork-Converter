"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Eye } from "lucide-react";

interface TransformedImageProps {
  imageUrl?: string;
  isTransforming?: boolean;
  onClear?: () => void;
  onDownload?: () => void;
}

export function TransformedImage({
  imageUrl,
  isTransforming = false,
  onClear,
  onDownload,
}: TransformedImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `transformed-${Date.now()}.png`;
    link.click();

    if (onDownload) onDownload();
  };

  return (
    <div className="flex flex-col h-full border-l-2">
      {/* Toolbar */}
      <div className="bg-card border-b border-border px-6 py-4 pt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            Generated Result
          </h3>
          {imageUrl && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              ✓ Transformed
            </span>
          )}
        </div>
      </div>

      {/* Image Display Container - Square and Centered */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 bg-muted/30"
      >
        {isTransforming ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium">
              Transforming your sketch...
            </p>
          </div>
        ) : imageUrl ? (
          <div className="relative max-w-full max-h-full aspect-square flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/5 rounded-lg blur-xl"></div>
            <div className="relative bg-white border border-border shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img
                src={imageUrl}
                alt="Transformed Result"
                className="w-151 h-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Eye className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground mb-1">
                No Result Yet
              </p>
              <p className="text-sm text-muted-foreground">
                Transform your sketch to see the result here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="h-max flex items-center gap-3 p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={!imageUrl}
          className="h-12 flex-1 gap-1"
        >
          <Trash2 size={14} />
          Clear Result
        </Button>

        <Button
          size="sm"
          variant="default"
          onClick={handleDownload}
          disabled={!imageUrl}
          className="h-12 flex-1 gap-1"
        >
          <Download size={14} />
          Download
        </Button>
      </div>
    </div>
  );
}
