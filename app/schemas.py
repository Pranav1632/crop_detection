from typing import List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    model_loaded: bool = Field(..., example=True)
    classes_count: int = Field(..., example=38)
    framework: str = Field(..., example="TensorFlow / Keras 3")
    version: str = Field(..., example="1.0.0")


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
