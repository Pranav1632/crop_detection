"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { CameraCapture } from "@/components/CameraCapture";
import { ImageUploader } from "@/components/ImageUploader";
import { SampleGallery } from "@/components/SampleGallery";
import { GradCamViewer } from "@/components/GradCamViewer";
import { DiagnosisCard } from "@/components/DiagnosisCard";
import { predictCropDisease } from "@/lib/api";
import { PredictionResponse } from "@/types";
import {
  Camera,
  UploadCloud,
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Zap,
  Smartphone,
  Play,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const [inputMode, setInputMode] = useState<"upload" | "camera">("upload");
  // Default to MobileNetV2 as requested!
  const [selectedModel, setSelectedModel] = useState<"mobilenet" | "efficientnet">("mobilenet");
  const [selectedBlobOrFile, setSelectedBlobOrFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Model Results Cache: keeps both MobileNet and EfficientNet outputs simultaneously!
  const [resultsCache, setResultsCache] = useState<{
    mobilenet?: PredictionResponse;
    efficientnet?: PredictionResponse;
  }>({});

  const [compareMode, setCompareMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearSelection = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedBlobOrFile(null);
    setPreviewUrl(null);
    setResultsCache({});
    setError(null);
  };

  const executeDiagnosis = async (
    item: File | Blob,
    model: "mobilenet" | "efficientnet" = selectedModel
  ) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await predictCropDisease(item, 3, true, model);
      // Cache result for this specific model so switching doesn't vanish data!
      setResultsCache((prev) => ({
        ...prev,
        [model]: res,
      }));
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setError(
        err.message ||
          "Failed to diagnose leaf image. Please ensure the backend server is running on port 8000."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handlers
  const handleImageUploaded = (file: File) => {
    clearSelection();
    const url = URL.createObjectURL(file);
    setSelectedBlobOrFile(file);
    setPreviewUrl(url);
    // Don't auto-run blindly; let the user see the preview and click "Run Analysis" or trigger immediately!
    executeDiagnosis(file, selectedModel);
  };

  const handleCameraCaptured = (blob: Blob, url: string) => {
    setSelectedBlobOrFile(blob);
    setPreviewUrl(url);
    setInputMode("upload");
    executeDiagnosis(blob, selectedModel);
  };

  const handleSampleSelected = (blob: Blob, url: string) => {
    clearSelection();
    setSelectedBlobOrFile(blob);
    setPreviewUrl(url);
    executeDiagnosis(blob, selectedModel);
  };

  const handleModelSelect = (model: "mobilenet" | "efficientnet") => {
    setSelectedModel(model);
    // If result already cached in memory, it will display immediately!
    // If not cached yet and an image is selected, offer to run it:
    if (selectedBlobOrFile && !resultsCache[model]) {
      executeDiagnosis(selectedBlobOrFile, model);
    }
  };

  const activeDiagnosis = resultsCache[selectedModel];
  const hasBothResults = !!(resultsCache.mobilenet && resultsCache.efficientnet);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Vercel-style Minimalist Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Crop Diagnostics v1.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Crop Foliage Identification & Diagnosis
          </h1>

          <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
            Fast, explainable deep learning diagnostics for 38 plant pathologies. Upload a leaf photo or capture live in the field to identify crop health, attention heatmaps, and treatment advice.
          </p>
        </div>

        {/* Control Center & Upload Card */}
        <div className="rounded-xl bg-[#0a0a0a] border border-zinc-800/90 p-6 space-y-6 shadow-2xl">
          {/* Architecture Switcher & Cache Indicators */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div>
              <span className="text-xs font-mono text-zinc-400 block mb-1">Architecture</span>
              <div className="flex items-center space-x-1.5 bg-black p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleModelSelect("mobilenet")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                    selectedModel === "mobilenet"
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>MobileNetV2 (Default)</span>
                  {resultsCache.mobilenet && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Result cached" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleModelSelect("efficientnet")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                    selectedModel === "efficientnet"
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-zinc-400" />
                  <span>EfficientNet-B0</span>
                  {resultsCache.efficientnet && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Result cached" />
                  )}
                </button>
              </div>
            </div>

            {/* Input Mode Selector (Upload vs Camera) */}
            <div>
              <span className="text-xs font-mono text-zinc-400 block mb-1">Input Source</span>
              <div className="flex items-center space-x-1 bg-black p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("upload");
                    if (!previewUrl) clearSelection();
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                    inputMode === "upload"
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputMode("camera");
                    clearSelection();
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                    inputMode === "camera"
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live Camera</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Input View */}
          <div>
            {inputMode === "camera" ? (
              <CameraCapture
                onCapture={handleCameraCaptured}
                onCancel={() => setInputMode("upload")}
              />
            ) : (
              <div className="space-y-4">
                <ImageUploader
                  onImageSelected={handleImageUploaded}
                  selectedPreview={previewUrl}
                  onClear={clearSelection}
                />

                {!selectedBlobOrFile && (
                  <SampleGallery
                    onSelectSample={handleSampleSelected}
                    disabled={isAnalyzing}
                  />
                )}
              </div>
            )}
          </div>

          {/* Clickable Action Bar (Explicit Execute / Re-run) */}
          {selectedBlobOrFile && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800/80">
              <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                <span>Active Model:</span>
                <span className="text-white font-semibold uppercase">
                  {selectedModel === "mobilenet" ? "MobileNetV2" : "EfficientNet-B0"}
                </span>
                {resultsCache[selectedModel] && (
                  <span className="text-emerald-400 text-[11px] bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Cached
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {hasBothResults && (
                  <button
                    type="button"
                    onClick={() => setCompareMode(!compareMode)}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{compareMode ? "Single View" : "Compare Both Models"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => executeDiagnosis(selectedBlobOrFile, selectedModel)}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 font-medium text-xs transition disabled:opacity-50 shadow"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Leaf...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{activeDiagnosis ? "Re-Run Analysis" : "Execute Analysis"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2 font-mono">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Comparative Side-by-Side View (If user clicked 'Compare Both Models') */}
        {compareMode && hasBothResults && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-300" />
              Direct Architecture Comparison
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MobileNet Result */}
              {resultsCache.mobilenet && (
                <div className="space-y-3">
                  <span className="text-xs font-mono text-zinc-400">📱 MobileNetV2 Output:</span>
                  <DiagnosisCard diagnosis={resultsCache.mobilenet} />
                </div>
              )}

              {/* EfficientNet Result */}
              {resultsCache.efficientnet && (
                <div className="space-y-3">
                  <span className="text-xs font-mono text-zinc-400">⚡ EfficientNet-B0 Output:</span>
                  <DiagnosisCard diagnosis={resultsCache.efficientnet} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Standard Single Diagnostic Results View */}
        {!compareMode && activeDiagnosis && !isAnalyzing && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-semibold">Diagnostic Report</span>
                <span>·</span>
                <span>{activeDiagnosis.model_used}</span>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Visual Grad-CAM View */}
              <div className="lg:col-span-6 w-full">
                <GradCamViewer
                  originalUrl={previewUrl || activeDiagnosis.original_image_base64 || undefined}
                  heatmapUrl={activeDiagnosis.heatmap_base64 || undefined}
                  overlayUrl={activeDiagnosis.overlay_base64 || undefined}
                />
              </div>

              {/* Diagnosis Summary & Action Plan */}
              <div className="lg:col-span-6 w-full">
                <DiagnosisCard diagnosis={activeDiagnosis} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Vercel-style Footer */}
      <footer className="border-t border-zinc-900 bg-black py-6 text-xs font-mono text-zinc-600">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 CropDetect AI · Industrial Agricultural Vision</p>
          <p>MobileNetV2 (Default) · EfficientNet-B0 · 38 Classes</p>
        </div>
      </footer>
    </div>
  );
}
