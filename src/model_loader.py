import json
import logging
from typing import List, Dict, Any, Optional
import keras

from src.config import (
    MODEL_KERAS_PATH,
    MODEL_MOBILENET_PATH,
    MODEL_CONFIG_PATH,
    MODEL_WEIGHTS_PATH,
    CLASS_NAMES_PATH,
    DISEASE_INFO_PATH,
    DEFAULT_MODEL
)

logger = logging.getLogger(__name__)

_MODELS: Dict[str, keras.Model] = {}
_CLASS_NAMES: Optional[List[str]] = None
_DISEASE_INFO: Optional[Dict[str, Any]] = None


def load_model(model_name: str = DEFAULT_MODEL) -> keras.Model:
    """
    Loads either 'efficientnet' or 'mobilenet' model with caching.
    """
    key = model_name.lower().strip()
    if key in _MODELS:
        return _MODELS[key]

    if "mobile" in key:
        # Load MobileNetV2
        if MODEL_MOBILENET_PATH.exists():
            logger.info(f"Loading MobileNetV2 from {MODEL_MOBILENET_PATH}...")
            model = keras.models.load_model(str(MODEL_MOBILENET_PATH))
        else:
            raise FileNotFoundError(f"MobileNet model not found at {MODEL_MOBILENET_PATH}")
    else:
        # Load EfficientNet-B0
        if MODEL_KERAS_PATH.exists():
            logger.info(f"Loading EfficientNet from {MODEL_KERAS_PATH}...")
            model = keras.models.load_model(str(MODEL_KERAS_PATH))
        elif MODEL_CONFIG_PATH.exists() and MODEL_WEIGHTS_PATH.exists():
            logger.info(f"Loading EfficientNet from config {MODEL_CONFIG_PATH} and weights {MODEL_WEIGHTS_PATH}...")
            with open(MODEL_CONFIG_PATH, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            model = keras.models.model_from_json(json.dumps(cfg))
            model.load_weights(str(MODEL_WEIGHTS_PATH))
        else:
            raise FileNotFoundError(
                f"Model weights not found. Expected {MODEL_KERAS_PATH} or {MODEL_CONFIG_PATH} + {MODEL_WEIGHTS_PATH}"
            )

    logger.info(f"Model [{key}] loaded successfully! Output shape: {model.output_shape}")
    _MODELS[key] = model
    return model


def load_class_names() -> List[str]:
    """
    Loads list of 38 class names matching model output indices.
    """
    global _CLASS_NAMES
    if _CLASS_NAMES is not None:
        return _CLASS_NAMES

    if not CLASS_NAMES_PATH.exists():
        raise FileNotFoundError(f"Class names file not found at: {CLASS_NAMES_PATH}")

    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
        _CLASS_NAMES = json.load(f)

    logger.info(f"Loaded {len(_CLASS_NAMES)} class names.")
    return _CLASS_NAMES


def load_disease_info() -> Dict[str, Any]:
    """
    Loads agricultural disease advisory database.
    """
    global _DISEASE_INFO
    if _DISEASE_INFO is not None:
        return _DISEASE_INFO

    if not DISEASE_INFO_PATH.exists():
        raise FileNotFoundError(f"Disease advisory file not found at: {DISEASE_INFO_PATH}")

    with open(DISEASE_INFO_PATH, "r", encoding="utf-8") as f:
        _DISEASE_INFO = json.load(f)

    logger.info(f"Loaded {len(_DISEASE_INFO)} disease advisory entries.")
    return _DISEASE_INFO
