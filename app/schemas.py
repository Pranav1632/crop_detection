from typing import List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    classes_count: int
    framework: str
    version: str
    supported_models: List[str] = ["EfficientNet-B0", "MobileNetV2"]


class CandidateScore(BaseModel):
    class_name: str
    crop: str
    condition: str
    status: str
    confidence: float


class ImageQuality(BaseModel):
    blur_score: float
    brightness_score: float
    is_blurry: bool
    is_too_dark: bool
    is_overexposed: bool
    rating: str
    issues: List[str]
    is_acceptable: bool


class PredictionResponse(BaseModel):
    model_used: Optional[str] = "EfficientNet-B0"
    crop: str
    condition: str
    class_name: str
    status: str
    is_healthy: bool
    confidence: float
    severity: str
    pathogen_type: str
    symptoms: str
    organic_controls: List[str]
    chemical_controls: List[str]
    prevention: List[str]
    top_candidates: List[CandidateScore]
    image_quality: ImageQuality
    original_image_base64: Optional[str] = None
    heatmap_base64: Optional[str] = None
    overlay_base64: Optional[str] = None


class DiseaseDetailResponse(BaseModel):
    class_name: str
    crop: str
    condition: str
    status: str
    severity: str
    pathogen_type: str
    symptoms: str
    organic_controls: List[str]
    chemical_controls: List[str]
    prevention: List[str]
