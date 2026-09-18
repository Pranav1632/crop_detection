import logging
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config import ALLOWED_ORIGINS
from src.predictor import CropDiseasePredictor
from src.model_loader import load_class_names, load_disease_info
from app.schemas import HealthResponse, PredictionResponse, DiseaseDetailResponse

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("cropdetect-api")

predictor: Optional[CropDiseasePredictor] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global predictor
    logger.info("Starting up Crop Disease API service...")
    try:
        predictor = CropDiseasePredictor()
        logger.info("Predictor successfully initialized!")
    except Exception as e:
        logger.error(f"Failed to initialize predictor on startup: {e}", exc_info=True)
    yield
    logger.info("Shutting down Crop Disease API service...")


app = FastAPI(
    title="Crop Identification & Disease Diagnosis API",
    description="Automated computer vision API powered by EfficientNet-B0 and Grad-CAM for identifying agricultural crops and plant pathologies.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
async def root():
    return {
        "service": "Crop Identification & Disease Diagnosis API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    global predictor
    if predictor is None:
        try:
            predictor = CropDiseasePredictor()
        except Exception as e:
            logger.error(f"Lazy model initialization failed: {e}")

    class_names = load_class_names()
    return HealthResponse(
        status="healthy" if predictor is not None else "degraded",
        model_loaded=predictor is not None,
        classes_count=len(class_names),
        framework="TensorFlow 2.x / Keras 3 (EfficientNet-B0)",
        version="1.0.0"
    )


@app.get("/classes", tags=["Knowledge Base"])
async def list_classes():
    """
    Returns full list of 38 classes grouped by crop.
    """
    class_names = load_class_names()
    disease_info = load_disease_info()

    grouped_by_crop: Dict[str, List[Dict[str, Any]]] = {}
    for c_name in class_names:
        info = disease_info.get(c_name, {})
        crop = info.get("crop", c_name.split("___")[0].replace("_", " "))
        if crop not in grouped_by_crop:
            grouped_by_crop[crop] = []
        grouped_by_crop[crop].append({
            "class_name": c_name,
            "condition": info.get("condition", c_name),
            "status": info.get("status", "Healthy" if "healthy" in c_name.lower() else "Diseased"),
            "severity": info.get("severity", "None")
        })

    return {
        "total_classes": len(class_names),
        "total_crops": len(grouped_by_crop),
        "crops": grouped_by_crop
    }


@app.get("/disease/{class_name}", response_model=DiseaseDetailResponse, tags=["Knowledge Base"])
async def get_disease_detail(class_name: str):
    """
    Returns agronomic treatment and management profile for a specific class.
    """
    disease_info = load_disease_info()
    if class_name not in disease_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Class '{class_name}' not found in agronomic knowledge base."
        )

    info = disease_info[class_name]
    return DiseaseDetailResponse(
        class_name=class_name,
        crop=info["crop"],
        condition=info["condition"],
        status=info["status"],
        severity=info["severity"],
        pathogen_type=info["pathogen_type"],
        symptoms=info["symptoms"],
        organic_controls=info["organic_controls"],
        chemical_controls=info["chemical_controls"],
        prevention=info["prevention"]
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
async def predict_crop_disease(
    file: UploadFile = File(..., description="Leaf image file or live camera photo"),
    top_k: int = Form(3, description="Number of top candidates to return"),
    include_gradcam: bool = Form(True, description="Whether to generate Grad-CAM visual heatmap")
):
    """
    Accepts an uploaded image or camera snapshot, performs inference,
    assesses photograph quality, and returns full agronomic diagnosis with Grad-CAM heatmap.
    """
    global predictor
    if predictor is None:
        predictor = CropDiseasePredictor()

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Please upload an image (JPEG, PNG, WEBP)."
        )

    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        result = predictor.predict(
            image_input=contents,
            top_k=top_k,
            include_gradcam=include_gradcam
        )
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal inference error: {str(e)}"
        )
