"use client";

import React, { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";
import { HealthStatus } from "@/types";

export const Header: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await checkHealth();
        setHealth(data);
      } catch {
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-black/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Vercel-style Brand */}
        <div className="flex items-center space-x-3">
          {/* Geometric Triangle mark */}
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-white fill-current"
              viewBox="0 0 76 65"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm text-white tracking-tight">CropDetect</span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono text-zinc-400">MobileNetV2 & EfficientNet</span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="flex items-center space-x-1.5 text-xs text-zinc-500 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" />
              <span>connecting</span>
            </div>
          ) : health && health.model_loaded ? (
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px]">38 Classes Ready</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[11px]">Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
