export interface CandidateScore {
  class_name: string;
  crop: string;
  condition: string;
  status: string;
  confidence: number;
}

export interface ImageQuality {
  blur_score: number;
  brightness_score: number;
  is_blurry: boolean;
  is_too_dark: boolean;
  is_overexposed: boolean;
  rating: "Excellent" | "Warning" | "Poor";
  issues: string[];
  is_acceptable: boolean;
}

export interface PredictionResponse {
  crop: string;
  condition: string;
  class_name: string;
  status: "Healthy" | "Diseased";
  is_healthy: boolean;
  confidence: number;
  severity: "None" | "Low" | "Moderate" | "High" | "Critical";
  pathogen_type: string;
  symptoms: string;
  organic_controls: string[];
  chemical_controls: string[];
  prevention: string[];
  top_candidates: CandidateScore[];
  image_quality: ImageQuality;
  original_image_base64?: string;
  heatmap_base64?: string;
  overlay_base64?: string;
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  classes_count: number;
  framework: string;
  version: string;
}
