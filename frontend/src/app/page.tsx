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
  Sparkles,
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

export default function Home() {
  const [inputMode, setInputMode] = useState<"upload" | "camera">("upload");
  const [selectedBlobOrFile, setSelectedBlobOrFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearSelection = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedBlobOrFile(null);
    setPreviewUrl(null);
    setDiagnosis(null);
    setError(null);
  };

  const executeDiagnosis = async (item: File | Blob) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await predictCropDisease(item, 3, true);
      setDiagnosis(res);
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setError(
        err.message || "Failed to diagnose leaf image. Please ensure the backend server is running on port 8000."
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
    executeDiagnosis(file);
  };

  const handleCameraCaptured = (blob: Blob, url: string) => {
    setSelectedBlobOrFile(blob);
    setPreviewUrl(url);
    setInputMode("upload"); // switch back to display preview & results
    executeDiagnosis(blob);
  };

  const handleSampleSelected = (blob: Blob, url: string) => {
    clearSelection();
    setSelectedBlobOrFile(blob);
    setPreviewUrl(url);
    executeDiagnosis(blob);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Industrial-Grade Agricultural Computer Vision</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Crop Identification &{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Disease Diagnosis
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Snap a live field photo or upload an image of any crop leaf to obtain real-time pathological diagnosis, visual Grad-CAM lesion heatmaps, and actionable treatment protocols.
          </p>
        </div>

        {/* Mode Selector & Input Area */}
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Mode Switch Tabs */}
          <div className="flex rounded-2xl bg-slate-900/90 p-1.5 border border-slate-800 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setInputMode("upload");
                if (!previewUrl) clearSelection();
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                inputMode === "upload"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Leaf Image</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputMode("camera");
                clearSelection();
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                inputMode === "camera"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Field Camera</span>
            </button>
          </div>

          {/* Active Input Mode Container */}
          <div className="transition-all duration-200">
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

          {/* Loading Indicator */}
          {isAnalyzing && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 flex flex-col items-center justify-center space-y-3 text-center animate-pulse">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-white">Analyzing Crop Foliage...</p>
                <p className="text-xs text-slate-400">
                  Running EfficientNet-B0 inference and generating Grad-CAM explainability heatmap...
                </p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Inference Error</p>
                <p className="text-xs text-rose-200/90">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {diagnosis && !isAnalyzing && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Diagnostic Report & Analysis</h2>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Test Another Leaf</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Visual Grad-CAM Attention Map */}
              <div className="lg:col-span-6 w-full">
                <GradCamViewer
                  originalUrl={diagnosis.original_image_base64 || previewUrl || undefined}
                  heatmapUrl={diagnosis.heatmap_base64 || undefined}
                  overlayUrl={diagnosis.overlay_base64 || undefined}
                />
              </div>

              {/* Right Column: Full Diagnosis & Agronomic Plan */}
              <div className="lg:col-span-6 w-full">
                <DiagnosisCard diagnosis={diagnosis} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 CropDetect AI · Advanced Agricultural Computer Vision</p>
          <p>Trained on 38 Pathologies · MobileNetV2 / EfficientNet-B0 · 98.51% Accuracy</p>
        </div>
      </footer>
    </div>
  );
}
