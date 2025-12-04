"use client";

import { SketchCanvas } from "@/components/sketch-canvas";
import { Sidebar } from "@/components/sidebar";
import { useState, useCallback } from "react";

export interface SketchItem {
  id: string;
  imageData: string;
  timestamp: Date;
  transformedImage?: string;
}

export default function Page() {
  const [sketch, setSketch] = useState<SketchItem>();
  const [selectedSketchId, setSelectedSketchId] = useState<string | null>(null);

  // const handleSave = useCallback((imageData: string) => {
  //   const newSketch: SketchItem = {
  //     id: Date.now().toString(),
  //     imageData,
  //     timestamp: new Date(),
  //   }
  //   setSketches((prev) => [newSketch, ...prev])
  //   setSelectedSketchId(newSketch.id)
  // }, [])

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
      setSelectedSketchId(newSketch.id);
    };
    reader.readAsDataURL(file);
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
        console.log("Starting transform for new sketch");

        const response = await fetch("http://localhost:8000/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sketch: newSketch.imageData }),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.image) {
          throw new Error("No image returned from server");
        }

        setSketch(data.image);

        console.log("Transform completed successfully");
      } catch (error) {
        console.error("Transform failed:", error);
        throw error;
      }
    },
    [sketch]
  );

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* <SketchCanvas onSave={handleSave} /> */}
        <SketchCanvas onUpload={handleUpload} onTransform={handleTransform} />
      </main>
      {/* <Sidebar
        sketches={sketches}
        selectedSketchId={selectedSketchId}
        onSelectSketch={setSelectedSketchId}
        onDelete={handleDelete}
        onUpload={handleUpload}
        onTransform={handleTransform}
      /> */}
    </div>
  );
}
