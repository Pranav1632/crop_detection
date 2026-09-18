import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import io
import json
import pytest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from src.config import CLASS_NAMES_PATH, DISEASE_INFO_PATH, MODEL_KERAS_PATH
from src.preprocessing import assess_image_quality, preprocess_for_model
from src.predictor import CropDiseasePredictor
from app.api import app


def test_artifacts_exist():
    """Verify all critical files are present."""
    assert CLASS_NAMES_PATH.exists(), "class_names.json missing"
    assert DISEASE_INFO_PATH.exists(), "disease_info.json missing"
    assert MODEL_KERAS_PATH.exists(), "crop_model.keras missing"


def test_knowledge_base_integrity():
    """Verify all 38 classes have full metadata and treatment protocols."""
    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
        classes = json.load(f)
    assert len(classes) == 38, f"Expected 38 classes, found {len(classes)}"

    with open(DISEASE_INFO_PATH, "r", encoding="utf-8") as f:
        advisory = json.load(f)
    assert len(advisory) == 38, f"Expected 38 advisory entries, found {len(advisory)}"

    for c in classes:
        assert c in advisory, f"Class {c} missing in disease_info.json"
        entry = advisory[c]
        assert "crop" in entry
        assert "condition" in entry
        assert "status" in entry
        assert entry["status"] in ["Healthy", "Diseased"]
        assert len(entry["organic_controls"]) > 0
        assert len(entry["prevention"]) > 0


def test_image_quality_check():
    """Verify Laplacian blur and illumination detection."""
    # Blurry image (uniform flat color)
    flat_img = np.full((200, 200, 3), 128, dtype=np.uint8)
    q_blur = assess_image_quality(flat_img)
    assert q_blur["is_blurry"] is True

    # Dark image
    dark_img = np.full((200, 200, 3), 10, dtype=np.uint8)
    q_dark = assess_image_quality(dark_img)
    assert q_dark["is_too_dark"] is True


def test_predictor_and_gradcam():
    """Verify inference pipeline and Grad-CAM generation for both EfficientNet and MobileNet."""
    predictor = CropDiseasePredictor()
    dummy_img = np.full((224, 224, 3), 100, dtype=np.uint8)
    dummy_img[80:140, 80:140, 0] = 200  # distinct patch
    
    # 1. Test EfficientNet
    result_eff = predictor.predict(dummy_img, top_k=3, include_gradcam=True, model_type="efficientnet")
    assert "crop" in result_eff
    assert "condition" in result_eff
    assert result_eff["model_used"] == "EfficientNet-B0"
    assert len(result_eff["top_candidates"]) == 3
    assert result_eff["heatmap_base64"] is not None
    assert result_eff["overlay_base64"] is not None
    assert result_eff["heatmap_base64"].startswith("data:image/jpeg;base64,")

    # 2. Test MobileNet
    result_mob = predictor.predict(dummy_img, top_k=3, include_gradcam=True, model_type="mobilenet")
    assert "crop" in result_mob
    assert "condition" in result_mob
    assert result_mob["model_used"] == "MobileNetV2"
    assert len(result_mob["top_candidates"]) == 3
    assert result_mob["overlay_base64"] is not None


def test_fastapi_endpoints():
    """Verify FastAPI endpoints."""
    with TestClient(app) as client:
        # 1. Health
        res_h = client.get("/health")
        assert res_h.status_code == 200
        assert res_h.json()["status"] == "healthy"

        # 2. Classes
        res_c = client.get("/classes")
        assert res_c.status_code == 200
        assert res_c.json()["total_classes"] == 38

        # 3. Predict
        img = Image.new("RGB", (200, 200), color="green")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        res_p = client.post(
            "/predict",
            files={"file": ("leaf.jpg", buf, "image/jpeg")},
            data={"top_k": "3", "include_gradcam": "true"}
        )
        assert res_p.status_code == 200
        p_data = res_p.json()
        assert p_data["confidence"] > 0
        assert p_data["overlay_base64"] is not None
