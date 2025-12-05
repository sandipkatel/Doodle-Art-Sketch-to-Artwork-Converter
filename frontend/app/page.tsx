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
  const [isTransforming, setIsTransforming] = useState(false);

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
        console.log("Starting transform for new sketch");

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
          "http://localhost:8000/generate?model_type=scene",
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
    [sketch]
  );

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex overflow-hidden relative">
        {/* Canvas Container */}
        <div
          className={`transition-all duration-700 ease-in-out ${
            sketch?.transformedImage ? "w-1/2" : "w-full"
          }`}
        >
          <SketchCanvas onUpload={handleUpload} onTransform={handleTransform} />
        </div>

        {/* Transformed Image Container */}
        <div
          className={`transition-all duration-700 ease-in-out overflow-hidden ${
            sketch?.transformedImage ? "w-1/2 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 border-l border-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-white/80 backdrop-blur">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Generated Result
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Your sketch has been transformed
              </p>
            </div>

            {/* Image Display */}
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="relative w-full h-full max-w-2xl max-h-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-blue-400/20 rounded-2xl blur-2xl"></div>
                <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 transform hover:scale-[1.02] transition-transform duration-300">
                  {isTransforming ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="inline-block w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-600 font-medium">
                          Transforming your sketch...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={sketch?.transformedImage}
                      alt="Transformed Sketch"
                      className="w-full h-full object-contain p-4 animate-fadeIn"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-200 bg-white/80 backdrop-blur flex gap-3">
              <button
                onClick={() =>
                  setSketch((prev) =>
                    prev ? { ...prev, transformedImage: undefined } : prev
                  )
                }
                className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors duration-200"
              >
                Clear Result
              </button>
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = sketch?.transformedImage || "";
                  link.download = `transformed-${Date.now()}.png`;
                  link.click();
                }}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
