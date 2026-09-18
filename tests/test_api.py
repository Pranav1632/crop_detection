import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import io
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient
from app.api import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["classes_count"] == 38

def test_classes():
    response = client.get("/classes")
    assert response.status_code == 200
    data = response.json()
    assert data["total_classes"] == 38
    assert "Tomato" in data["crops"]

def test_predict_endpoint():
    # Generate dummy test image
    img = Image.new("RGB", (250, 250), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/predict",
        files={"file": ("test_leaf.jpg", buf, "image/jpeg")},
        data={"top_k": "3", "include_gradcam": "true"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "crop" in data
    assert "condition" in data
    assert "confidence" in data
    assert len(data["top_candidates"]) == 3
    assert data["heatmap_base64"] is not None
    assert data["overlay_base64"] is not None

if __name__ == "__main__":
    test_health()
    print("Health check PASSED!")
    test_classes()
    print("Classes check PASSED!")
    test_predict_endpoint()
    print("Predict endpoint PASSED!")
