"use client";

import React, { useEffect, useState } from "react";
import { Sprout, Activity, CheckCircle2, AlertCircle } from "lucide-react";
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-white tracking-tight">CropDetect AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v1.0 Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              EfficientNet-B0 · 38 Classes · 98.51% Validation Accuracy
            </p>
          </div>
        </div>

        {/* System Health Status */}
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
              <span>Connecting...</span>
            </div>
          ) : health && health.model_loaded ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-medium hidden sm:inline">Engine Online</span>
              <span className="text-[10px] text-emerald-300 font-mono">
                ({health.classes_count} Classes)
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="font-medium">Backend Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
