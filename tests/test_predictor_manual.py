import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np
from src.predictor import CropDiseasePredictor

def test_manual():
    arr = np.zeros((300, 300, 3), dtype=np.uint8)
    arr[:, :, 1] = 180  # green background
    arr[100:150, 100:150, 0] = 120  # brown spot
    arr[100:150, 100:150, 1] = 80

    predictor = CropDiseasePredictor()
    result = predictor.predict(arr)
    print("Diagnosis Successful!")
    print(f"Predicted Crop: {result['crop']}")
    print(f"Condition: {result['condition']}")
    print(f"Confidence: {result['confidence']}%")
    print(f"Is Healthy: {result['is_healthy']}")
    print(f"Severity: {result['severity']}")
    print(f"Pathogen: {result['pathogen_type']}")
    print(f"Quality Rating: {result['image_quality']['rating']}")
    print(f"Heatmap present: {bool(result['heatmap_base64'])}")
    print(f"Overlay present: {bool(result['overlay_base64'])}")
    print("Top 3 Candidates:")
    for c in result['top_candidates']:
        print(f" - {c['crop']} ({c['condition']}) : {c['confidence']}%")

if __name__ == "__main__":
    test_manual()
