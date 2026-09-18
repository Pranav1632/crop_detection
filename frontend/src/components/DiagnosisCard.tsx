"use client";

import React, { useState } from "react";
import { PredictionResponse } from "@/types";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sprout,
  FlaskConical,
  ShieldCheck,
  Camera,
  Activity,
  ChevronRight,
} from "lucide-react";

interface DiagnosisCardProps {
  diagnosis: PredictionResponse;
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ diagnosis }) => {
  const [activeTab, setActiveTab] = useState<"organic" | "chemical" | "prevention">("organic");

  const isHealthy = diagnosis.is_healthy;
  const severityColors = {
    None: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Low: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    Moderate: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    High: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    Critical: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-2xl">
      {/* Top Header: Crop & Disease Title */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {diagnosis.crop}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                severityColors[diagnosis.severity] || severityColors.Moderate
              }`}
            >
              Severity: {diagnosis.severity}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            {diagnosis.condition}
          </h2>

          <p className="text-xs text-slate-400">
            Pathogen:{" "}
            <span className="text-slate-200 font-medium">
              {diagnosis.pathogen_type || "N/A"}
            </span>
          </p>
        </div>

        {/* Health Status Badge */}
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${
            isHealthy
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {isHealthy ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold">Healthy Foliage</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span className="text-sm font-semibold">Pathology Detected</span>
            </>
          )}
        </div>
      </div>

      {/* Confidence Gauge */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            AI Confidence Score
          </span>
          <span className="text-lg font-bold text-white">
            {diagnosis.confidence}%
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              diagnosis.confidence > 80
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : diagnosis.confidence > 60
                ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                : "bg-gradient-to-r from-rose-500 to-orange-400"
            }`}
            style={{ width: `${diagnosis.confidence}%` }}
          />
        </div>
      </div>

      {/* Image Quality / Blur Warning Banner (if present) */}
      {diagnosis.image_quality && diagnosis.image_quality.issues.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Camera Quality Advisory ({diagnosis.image_quality.rating})</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-200/90 pl-1">
            {diagnosis.image_quality.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Visual Symptoms Summary */}
      {diagnosis.symptoms && (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs space-y-1">
          <span className="font-semibold text-slate-300">Diagnostic Symptoms:</span>
          <p className="text-slate-400 leading-relaxed">{diagnosis.symptoms}</p>
        </div>
      )}

      {/* Top 3 Alternative Candidates */}
      {diagnosis.top_candidates && diagnosis.top_candidates.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Differential Diagnosis (Top Predictions)
          </h4>
          <div className="space-y-1.5">
            {diagnosis.top_candidates.map((cand, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 text-slate-500 font-mono text-[10px]">
                    #{idx + 1}
                  </span>
                  <span className="font-medium text-slate-200">
                    {cand.crop} - {cand.condition}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      cand.status === "Healthy"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {cand.status}
                  </span>
                  <span className="font-semibold text-slate-300 w-12 text-right">
                    {cand.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agronomic Action & Advisory Plan (Tabs) */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Agronomic Action Plan & Remedies
        </h4>

        {/* Tabs Bar */}
        <div className="flex space-x-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("organic")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all ${
              activeTab === "organic"
                ? "bg-emerald-600 text-white font-medium shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Organic Controls</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chemical")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all ${
              activeTab === "chemical"
                ? "bg-blue-600 text-white font-medium shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Chemical Remedies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prevention")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all ${
              activeTab === "prevention"
                ? "bg-purple-600 text-white font-medium shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Prevention & Field Care</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 min-h-[120px]">
          {activeTab === "organic" && (
            <ul className="space-y-2 text-xs text-slate-300">
              {diagnosis.organic_controls && diagnosis.organic_controls.length > 0 ? (
                diagnosis.organic_controls.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">No specific organic controls recorded.</li>
              )}
            </ul>
          )}

          {activeTab === "chemical" && (
            <ul className="space-y-2 text-xs text-slate-300">
              {diagnosis.chemical_controls && diagnosis.chemical_controls.length > 0 ? (
                diagnosis.chemical_controls.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">No chemical treatment needed.</li>
              )}
            </ul>
          )}

          {activeTab === "prevention" && (
            <ul className="space-y-2 text-xs text-slate-300">
              {diagnosis.prevention && diagnosis.prevention.length > 0 ? (
                diagnosis.prevention.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">Practice standard field sanitation.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
