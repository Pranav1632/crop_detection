"use client";

import React, { useState } from "react";
import { PredictionResponse } from "@/types";
import {
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sprout,
  FlaskConical,
  ShieldCheck,
  Cpu,
} from "lucide-react";

interface DiagnosisCardProps {
  diagnosis: PredictionResponse;
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ diagnosis }) => {
  const [activeTab, setActiveTab] = useState<"organic" | "chemical" | "prevention">("organic");

  const isHealthy = diagnosis.is_healthy;
  const severityColors = {
    None: "text-emerald-400 border-emerald-500/30 bg-emerald-950/30",
    Low: "text-blue-400 border-blue-500/30 bg-blue-950/30",
    Moderate: "text-amber-400 border-amber-500/30 bg-amber-950/30",
    High: "text-orange-400 border-orange-500/30 bg-orange-950/30",
    Critical: "text-rose-400 border-rose-500/30 bg-rose-950/30",
  };

  return (
    <div className="w-full rounded-xl bg-[#0a0a0a] border border-zinc-800/90 p-6 space-y-6 shadow-2xl">
      {/* Top Header: Crop & Condition Title */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
              {diagnosis.crop}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                severityColors[diagnosis.severity] || severityColors.Moderate
              }`}
            >
              Severity: {diagnosis.severity}
            </span>
            {diagnosis.model_used && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-400">
                <Cpu className="w-3 h-3 text-zinc-400" />
                {diagnosis.model_used}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-semibold text-white tracking-tight">
            {diagnosis.condition}
          </h2>

          <p className="text-xs text-zinc-400 font-mono">
            Pathogen:{" "}
            <span className="text-zinc-200">
              {diagnosis.pathogen_type || "None"}
            </span>
          </p>
        </div>

        {/* Health Status Badge */}
        <div
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border text-xs font-mono ${
            isHealthy
              ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-400"
              : "bg-rose-950/40 border-rose-800/80 text-rose-400"
          }`}
        >
          {isHealthy ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Healthy Foliage</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Pathology Detected</span>
            </>
          )}
        </div>
      </div>

      {/* Confidence Score Bar */}
      <div className="p-4 rounded-lg bg-black border border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-mono">Confidence Level</span>
          <span className="text-sm font-mono font-semibold text-white">
            {diagnosis.confidence}%
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              diagnosis.confidence > 80
                ? "bg-white"
                : diagnosis.confidence > 50
                ? "bg-zinc-400"
                : "bg-zinc-600"
            }`}
            style={{ width: `${diagnosis.confidence}%` }}
          />
        </div>
      </div>

      {/* Diagnostic Symptoms */}
      {diagnosis.symptoms && (
        <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 text-xs space-y-1">
          <span className="font-mono text-zinc-400 uppercase text-[10px] tracking-wider">Symptoms:</span>
          <p className="text-zinc-300 leading-relaxed">{diagnosis.symptoms}</p>
        </div>
      )}

      {/* Differential Diagnosis (Top 3 Candidates) */}
      {diagnosis.top_candidates && diagnosis.top_candidates.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Differential Candidates
          </h4>
          <div className="space-y-1.5">
            {diagnosis.top_candidates.map((cand, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-black border border-zinc-800/80 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600">0{idx + 1}</span>
                  <span className="text-zinc-200">
                    {cand.crop} · {cand.condition}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded ${
                      cand.status === "Healthy"
                        ? "text-emerald-400 bg-emerald-950/40"
                        : "text-zinc-400 bg-zinc-900"
                    }`}
                  >
                    {cand.status}
                  </span>
                  <span className="font-semibold text-white w-14 text-right">
                    {cand.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Plan & Remedies Tabs */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
          Agronomic Action Plan & Remedies
        </h4>

        {/* Vercel-style Tab Strip */}
        <div className="flex space-x-1 p-1 rounded-lg bg-black border border-zinc-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("organic")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition-all ${
              activeTab === "organic"
                ? "bg-zinc-800 text-white font-medium"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Organic</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chemical")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition-all ${
              activeTab === "chemical"
                ? "bg-zinc-800 text-white font-medium"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Chemical</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prevention")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition-all ${
              activeTab === "prevention"
                ? "bg-zinc-800 text-white font-medium"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Prevention</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="p-4 rounded-lg bg-black border border-zinc-800/80 min-h-[110px]">
          {activeTab === "organic" && (
            <ul className="space-y-2 text-xs text-zinc-300">
              {diagnosis.organic_controls && diagnosis.organic_controls.length > 0 ? (
                diagnosis.organic_controls.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-zinc-500">No specific organic controls recorded.</li>
              )}
            </ul>
          )}

          {activeTab === "chemical" && (
            <ul className="space-y-2 text-xs text-zinc-300">
              {diagnosis.chemical_controls && diagnosis.chemical_controls.length > 0 ? (
                diagnosis.chemical_controls.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-zinc-500">No chemical intervention required.</li>
              )}
            </ul>
          )}

          {activeTab === "prevention" && (
            <ul className="space-y-2 text-xs text-zinc-300">
              {diagnosis.prevention && diagnosis.prevention.length > 0 ? (
                diagnosis.prevention.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-zinc-500">Practice standard field sanitation.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
