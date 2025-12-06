"use client";

import { SketchCanvas } from "@/components/sketch-canvas";
// import { Sidebar } from "@/components/sidebar";
import { useState, useCallback } from "react";
import { TransformedImage } from "@/components/transformed-image";

export interface SketchItem {
  id: string;
  imageData: string;
  timestamp: Date;
  transformedImage?: string;
}

export default function Page() {
  const [sketch, setSketch] = useState<SketchItem>();
  const [isTransforming, setIsTransforming] = useState(false);
  const [sketchType, setSketchType] = useState<"object" | "scene">("object");

  const handleUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const newSketch: SketchItem = {
        id: Date.now().toString(),
        imageData,
        timestamp: new Date(),
      };
      setSketch(newSketch);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClearResult = useCallback(() => {
    setSketch((prev) =>
      prev ? { ...prev, transformedImage: undefined } : prev
    );
  }, []);

  // const handleDelete = useCallback(
  //   (id: string) => {
  //     setSketches((prev) => prev.filter((sketch) => sketch.id !== id))
  //     if (selectedSketchId === id) {
  //       setSelectedSketchId(null)
  //     }
  //   },
  //   [selectedSketchId],
  // )

  const handleTransform = useCallback(
    async (imageData: string) => {
      if (!imageData) throw new Error("Sketch not found");

      const newSketch: SketchItem = {
        id: Date.now().toString(),
        imageData,
        timestamp: new Date(),
      };

      try {
        setIsTransforming(true);
        console.log("Starting transform for new sketch with type:", sketchType);

        // Convert base64 to Blob
        const base64Data = imageData.split(",")[1]; // Remove data:image/png;base64,
        const byteCharacters = atob(base64Data);
        const byteArrays = [];

        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }

        const blob = new Blob([new Uint8Array(byteArrays)], {
          type: "image/png",
        });

        // Create FormData
        const formData = new FormData();
        formData.append("file", blob, "sketch.png");

        // Add model_type as query parameter
        const response = await fetch(
          "http://localhost:8000/generate?model_type=" + sketchType,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Convert response to blob, then to base64
        const imageBlob = await response.blob();
        const reader = new FileReader();

        const base64Image = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageBlob);
        });

        // setSketch(base64Image);
        setSketch({
          ...newSketch,
          transformedImage: base64Image, // Store transformed image
        });

        console.log("Transform completed successfully");
      } catch (error) {
        console.error("Transform failed:", error);
        throw error;
      } finally {
        setIsTransforming(false);
      }
    },
    [sketchType]
  );

  const handleSketchTypeChange = useCallback((value: "object" | "scene") => {
    setSketchType(value);
    console.log("Sketch type changed to:", value, " from page component", sketchType);
    // The `sketchType` here will show the OLD value due to closure
}, [setSketchType]);

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex overflow-hidden relative">
        {/* Canvas Container */}
        <div
          className={`transition-all duration-700 ease-in-out ${
            sketch?.transformedImage ? "w-1/2" : "w-full"
          }`}
        >
          <SketchCanvas
            onUpload={handleUpload}
            onTransform={handleTransform}
            onSketchTypeChange={handleSketchTypeChange}
            sketchType={sketchType}
          />
        </div>

        {/* Transformed Image Container */}
        <div
          className={`transition-all duration-700 ease-in-out overflow-hidden ${
            sketch?.transformedImage ? "w-1/2 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <TransformedImage
            imageUrl={sketch?.transformedImage}
            isTransforming={isTransforming}
            onClear={handleClearResult}
          />
        </div>
      </main>
    </div>
  );
}
