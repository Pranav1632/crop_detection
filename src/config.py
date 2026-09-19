from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# Paths
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

MODEL_KERAS_PATH = MODELS_DIR / "crop_model.keras"
MODEL_MOBILENET_PATH = MODELS_DIR / "mobilenet.keras"
MODEL_CONFIG_PATH = MODELS_DIR / "config.json"
MODEL_WEIGHTS_PATH = MODELS_DIR / "model.weights.h5"
CLASS_NAMES_PATH = MODELS_DIR / "class_names.json"
DISEASE_INFO_PATH = DATA_DIR / "disease_info.json"

DEFAULT_MODEL = "mobilenet"

# Model hyperparameters
INPUT_SHAPE = (224, 224, 3)
IMAGE_SIZE = (224, 224)
CONFIDENCE_THRESHOLD = 0.60
TOP_K_DEFAULT = 3

# Image Quality Thresholds
BLUR_THRESHOLD = 80.0  # Laplacian variance below this indicates blur
BRIGHTNESS_MIN = 35.0  # Mean pixel brightness below this is too dark
BRIGHTNESS_MAX = 240.0 # Mean pixel brightness above this is overexposed

# API config
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 8000))
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://crop-detection-gamma.vercel.app",
    "*"
]
