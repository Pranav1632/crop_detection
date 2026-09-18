"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, RefreshCw, CheckCircle, AlertCircle, Sparkles, X } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (blob: Blob, previewUrl: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Stop camera tracks helper
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera with chosen facingMode
  const startCamera = useCallback(async (mode: "environment" | "user") => {
    setIsInitializing(true);
    setError(null);

    // Stop existing stream first
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser.");
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError(err.message || "Failed to access camera.");
      }
    } finally {
      setIsInitializing(false);
    }
  }, [stream]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopStream();
    };
  }, [facingMode]);

  // Toggle between back and front camera
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Capture frame to canvas
  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Trigger flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    // If front camera, flip horizontally to match mirror preview
    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const preview = URL.createObjectURL(blob);
          setCapturedBlob(blob);
          setCapturedUrl(preview);
        }
      },
      "image/jpeg",
      0.95
    );
  };

  const handleConfirm = () => {
    if (capturedBlob && capturedUrl) {
      stopStream();
      onCapture(capturedBlob, capturedUrl);
    }
  };

  const handleRetake = () => {
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }
    setCapturedBlob(null);
    setCapturedUrl(null);
    if (!stream) {
      startCamera(facingMode);
    }
  };

  const handleClose = () => {
    stopStream();
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }
    onCancel();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-900 border border-emerald-500/30 shadow-2xl">
      {/* Top Controls Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center space-x-2 text-white/90 text-sm font-medium">
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>{capturedUrl ? "Photo Captured" : "Live Field Camera"}</span>
        </div>

        <div className="flex items-center space-x-2">
          {!capturedUrl && (
            <button
              type="button"
              onClick={handleToggleCamera}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
              title="Switch Camera (Front/Back)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative aspect-[4/3] w-full flex items-center justify-center bg-black overflow-hidden">
        {/* Flash Effect */}
        {isFlashing && (
          <div className="absolute inset-0 z-30 bg-white opacity-80 animate-fade-out pointer-events-none" />
        )}

        {/* Error State */}
        {error ? (
          <div className="p-6 text-center text-rose-400 space-y-3">
            <AlertCircle className="w-12 h-12 mx-auto text-rose-400" />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => startCamera(facingMode)}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition"
            >
              Retry Camera
            </button>
          </div>
        ) : capturedUrl ? (
          /* Captured Preview */
          <img
            src={capturedUrl}
            alt="Captured Leaf"
            className="w-full h-full object-contain"
          />
        ) : (
          /* Live Stream */
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === "user" ? "scale-x-[-1]" : ""
              }`}
            />

            {/* Viewfinder Target Framing Guidelines */}
            <div className="absolute inset-8 pointer-events-none border-2 border-emerald-400/40 rounded-3xl flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              </div>
              <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 text-xs font-medium">
                  Center diseased or healthy leaf within frame
                </span>
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
              </div>
            </div>
          </>
        )}

        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Shutter / Action Controls */}
      <div className="p-5 bg-slate-900 flex items-center justify-center space-x-6 border-t border-slate-800">
        {capturedUrl ? (
          <div className="flex items-center space-x-4 w-full justify-center">
            <button
              type="button"
              onClick={handleRetake}
              className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all"
            >
              Retake Photo
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Diagnose Leaf</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <button
              type="button"
              onClick={handleSnap}
              disabled={isInitializing || !!error}
              className="group relative flex items-center justify-center w-18 h-18 rounded-full border-4 border-emerald-400/80 bg-white/10 hover:bg-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              title="Snap Leaf Photo"
            >
              <div className="w-13 h-13 rounded-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors shadow-md" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
