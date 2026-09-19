"use client";

import React, { useState } from "react";
import { Sliders, Columns, Eye, HelpCircle } from "lucide-react";

interface GradCamViewerProps {
  originalUrl?: string;
  heatmapUrl?: string;
  overlayUrl?: string;
}

export const GradCamViewer: React.FC<GradCamViewerProps> = ({
  originalUrl,
  heatmapUrl,
  overlayUrl,
}) => {
  const [viewMode, setViewMode] = useState<"slider" | "split">("slider");
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(55);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!originalUrl) return null;

  return (
    <div className="w-full rounded-xl bg-[#0a0a0a] border border-zinc-800/90 p-5 space-y-4 shadow-2xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              AI Visual Saliency (Grad-CAM)
            </h3>
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              title="What is Grad-CAM?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            Attribution map highlighting the neural network's visual focus.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-black p-1 rounded-lg border border-zinc-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setViewMode("slider")}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
              viewMode === "slider"
                ? "bg-zinc-800 text-white font-medium shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Blend</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
              viewMode === "split"
                ? "bg-zinc-800 text-white font-medium shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>Split</span>
          </button>
        </div>
      </div>

      {/* Info Callout explaining Grad-CAM */}
      {showExplanation && (
        <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-200">What does this "Heatmap" mean?</p>
          <p className="leading-relaxed">
            Grad-CAM (Gradient-weighted Class Activation Mapping) detects <strong>AI attention</strong>, not physical sunlight or thermal heat. 
            The red/yellow regions show the exact pixels on the leaf that the neural network's convolutional filters focused on to diagnose the disease. Blue areas were classified as background or healthy tissue.
          </p>
        </div>
      )}

      {/* Main Visual Display */}
      {viewMode === "slider" ? (
        <div className="space-y-4">
          <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden border border-zinc-800 bg-black shadow-inner">
            {/* Base Original High-Res Image */}
            <img
              src={originalUrl}
              alt="Original Leaf"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Superimposed Heatmap Layer with dynamic opacity */}
            {heatmapUrl && (
              <img
                src={heatmapUrl}
                alt="Grad-CAM Heatmap"
                className="absolute inset-0 w-full h-full object-cover mix-blend-screen pointer-events-none transition-opacity duration-75"
                style={{ opacity: heatmapOpacity / 100 }}
              />
            )}
          </div>

          {/* Opacity Slider Control */}
          <div className="max-w-md mx-auto px-2 space-y-2">
            <div className="flex justify-between text-[11px] font-mono text-zinc-500">
              <span>Original Photo</span>
              <span className="font-semibold text-zinc-300">{heatmapOpacity}% AI Attention</span>
              <span>Full Heatmap</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={heatmapOpacity}
              onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
              className="w-full accent-white cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>
        </div>
      ) : (
        /* Side-by-Side Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-500">Original Foliage</span>
            <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-black">
              <img
                src={originalUrl}
                alt="Original Leaf"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-500">Grad-CAM Attribution</span>
            <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-black">
              <img
                src={overlayUrl || heatmapUrl || originalUrl}
                alt="Grad-CAM Overlay"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Spectrum Legend */}
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 bg-black px-3.5 py-2 rounded-lg border border-zinc-800">
        <span>Low Attribution</span>
        <div className="h-2 w-28 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-yellow-400 to-red-600" />
        <span className="text-zinc-300">Lesion Target Focus</span>
      </div>
    </div>
  );
};
