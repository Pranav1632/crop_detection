"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface SampleItem {
  id: string;
  name: string;
  crop: string;
  color: string;
  spotColor: string;
}

const SAMPLES: SampleItem[] = [
  { id: "tomato_blight", name: "Tomato (Late Blight)", crop: "Tomato", color: "#2e7d32", spotColor: "#3e2723" },
  { id: "potato_early", name: "Potato (Early Blight)", crop: "Potato", color: "#388e3c", spotColor: "#5d4037" },
  { id: "corn_rust", name: "Corn (Common Rust)", crop: "Corn", color: "#43a047", spotColor: "#d84315" },
  { id: "pepper_healthy", name: "Bell Pepper (Healthy)", crop: "Pepper", color: "#1b5e20", spotColor: "#1b5e20" },
  { id: "apple_scab", name: "Apple (Apple Scab)", crop: "Apple", color: "#2e7d32", spotColor: "#263238" },
];

interface SampleGalleryProps {
  onSelectSample: (blob: Blob, previewUrl: string, name: string) => void;
  disabled?: boolean;
}

export const SampleGallery: React.FC<SampleGalleryProps> = ({ onSelectSample, disabled }) => {
  // Generate a test SVG/Canvas blob dynamically so it's self-contained
  const createSampleBlob = (sample: SampleItem): Promise<{ blob: Blob; url: string }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background leaf shape
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 300, 300);

      // Draw leaf body
      ctx.beginPath();
      ctx.ellipse(150, 150, 110, 80, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fillStyle = sample.color;
      ctx.fill();

      // Main leaf vein
      ctx.beginPath();
      ctx.moveTo(80, 220);
      ctx.lineTo(220, 80);
      ctx.strokeStyle = "#81c784";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Secondary lateral veins
      for (let i = 1; i <= 4; i++) {
        const x = 80 + i * 28;
        const y = 220 - i * 28;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 25, y - 10);
        ctx.strokeStyle = "#66bb6a";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 20, y + 15);
        ctx.stroke();
      }

      // If diseased, draw spots
      if (sample.spotColor !== sample.color) {
        // Target concentric rings / spots
        ctx.beginPath();
        ctx.arc(140, 130, 22, 0, 2 * Math.PI);
        ctx.fillStyle = sample.spotColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(175, 160, 16, 0, 2 * Math.PI);
        ctx.fillStyle = sample.spotColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(120, 175, 12, 0, 2 * Math.PI);
        ctx.fillStyle = sample.spotColor;
        ctx.fill();
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve({ blob, url });
        }
      }, "image/jpeg", 0.95);
    });
  };

  const handleSampleClick = async (sample: SampleItem) => {
    if (disabled) return;
    const { blob, url } = await createSampleBlob(sample);
    onSelectSample(blob, url, sample.name);
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span>Try Sample Leaf Images:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            disabled={disabled}
            onClick={() => handleSampleClick(sample)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs transition-all disabled:opacity-50"
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: sample.spotColor !== sample.color ? sample.spotColor : sample.color }}
            />
            <span>{sample.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
