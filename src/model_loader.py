import json
import logging
from typing import List, Dict, Any, Optional
import keras

from src.config import (
    MODEL_KERAS_PATH,
    MODEL_CONFIG_PATH,
    MODEL_WEIGHTS_PATH,
    CLASS_NAMES_PATH,
    DISEASE_INFO_PATH
)

logger = logging.getLogger(__name__)

_MODEL_INSTANCE: Optional[keras.Model] = None
_CLASS_NAMES: Optional[List[str]] = None
_DISEASE_INFO: Optional[Dict[str, Any]] = None


def load_model() -> keras.Model:
    """
    Loads the trained EfficientNet-B0 model with singleton caching.
    Tries crop_model.keras first, then config.json + model.weights.h5.
    """
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is not None:
        return _MODEL_INSTANCE

    if MODEL_KERAS_PATH.exists():
        logger.info(f"Loading model from {MODEL_KERAS_PATH}...")
        _MODEL_INSTANCE = keras.models.load_model(str(MODEL_KERAS_PATH))
    elif MODEL_CONFIG_PATH.exists() and MODEL_WEIGHTS_PATH.exists():
        logger.info(f"Loading model from config: {MODEL_CONFIG_PATH} and weights: {MODEL_WEIGHTS_PATH}...")
        with open(MODEL_CONFIG_PATH, "r", encoding="utf-8") as f:
            cfg = json.load(f)
        model = keras.models.model_from_json(json.dumps(cfg))
        model.load_weights(str(MODEL_WEIGHTS_PATH))
        _MODEL_INSTANCE = model
    else:
        raise FileNotFoundError(
            f"Model weights not found. Expected {MODEL_KERAS_PATH} or {MODEL_CONFIG_PATH} + {MODEL_WEIGHTS_PATH}"
        )

    logger.info(f"Model successfully loaded! Input shape: {_MODEL_INSTANCE.input_shape}, Output shape: {_MODEL_INSTANCE.output_shape}")
    return _MODEL_INSTANCE


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
