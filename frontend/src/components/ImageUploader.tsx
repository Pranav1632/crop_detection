"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  selectedPreview: string | null;
  onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  selectedPreview,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle clipboard paste of images (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          onImageSelected(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onImageSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          onImageSelected(file);
        }
      }
    },
    [onImageSelected]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onImageSelected(file);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {selectedPreview ? (
        <div className="relative group w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-900 shadow-xl">
          <img
            src={selectedPreview}
            alt="Selected Crop Leaf"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-all shadow-md"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-emerald-400 bg-emerald-950/20 scale-[1.01]"
              : "border-slate-700 hover:border-emerald-500/60 bg-slate-900/50 hover:bg-slate-900"
          }`}
        >
          <div className="w-14 h-14 mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base font-semibold text-slate-200 mb-1">
            Drag & drop your leaf image here
          </h3>
          <p className="text-xs text-slate-400 mb-4 text-center max-w-sm">
            Supports JPEG, PNG, or WEBP. You can also paste directly with <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl+V</kbd>
          </p>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 transition"
          >
            Browse Files
          </button>
        </div>
      )}
    </div>
  );
};
