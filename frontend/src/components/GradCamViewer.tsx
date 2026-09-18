"use client";

import React, { useState } from "react";
import { Sliders, Columns, Eye, Info } from "lucide-react";

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

  if (!originalUrl) return null;

  return (
    <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            AI Visual Attention (Grad-CAM)
          </h3>
          <p className="text-xs text-slate-400">
            Highlights the exact lesion patterns and leaf features that triggered the diagnosis.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("slider")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "slider"
                ? "bg-emerald-600 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Opacity Blend</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "split"
                ? "bg-emerald-600 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      {viewMode === "slider" ? (
        <div className="space-y-4">
          <div className="relative w-full aspect-square max-w-md mx-auto rounded-xl overflow-hidden border border-slate-800 bg-black shadow-inner">
            {/* Base Original Image */}
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
            <div className="flex justify-between text-xs text-slate-400">
              <span>Original Photo</span>
              <span className="font-semibold text-emerald-400">{heatmapOpacity}% Heatmap</span>
              <span>Full AI Saliency</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={heatmapOpacity}
              onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      ) : (
        /* Side-by-Side Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-400">Original Leaf Input</span>
            <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-black">
              <img
                src={originalUrl}
                alt="Original Leaf"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-400">Grad-CAM Activation Overlay</span>
            <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-black">
              <img
                src={overlayUrl || heatmapUrl || originalUrl}
                alt="Grad-CAM Heatmap"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Color Scale Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-800/80">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          Attention Spectrum:
        </span>
        <div className="flex items-center space-x-2">
          <span>Background</span>
          <div className="h-2.5 w-28 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-yellow-400 to-red-600" />
          <span className="font-semibold text-rose-400">Primary Lesion Focus</span>
        </div>
      </div>
    </div>
  );
};
