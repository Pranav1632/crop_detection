import { PredictionResponse, HealthStatus } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function checkHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }
  return res.json();
}

export async function predictCropDisease(
  imageFileOrBlob: File | Blob,
  topK: number = 3,
  includeGradcam: boolean = true,
  modelType: "efficientnet" | "mobilenet" = "efficientnet"
): Promise<PredictionResponse> {
  const formData = new FormData();
  
  if (imageFileOrBlob instanceof File) {
    formData.append("file", imageFileOrBlob, imageFileOrBlob.name);
  } else {
    formData.append("file", imageFileOrBlob, "camera_snap.jpg");
  }
  
  formData.append("top_k", topK.toString());
  formData.append("include_gradcam", includeGradcam.toString());
  formData.append("model_type", modelType);

  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.detail || "Prediction request failed");
    } catch {
      throw new Error(`Server returned ${res.status}: ${errText}`);
    }
  }

  return res.json();
}
