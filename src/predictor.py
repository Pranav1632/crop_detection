import logging
from typing import Dict, Any, Union, Optional
import io
import numpy as np
from PIL import Image

from src.model_loader import load_model, load_class_names, load_disease_info
from src.preprocessing import preprocess_for_model
from src.gradcam import compute_gradcam_heatmap, generate_gradcam_overlay, array_to_base64_jpeg
from src.config import TOP_K_DEFAULT

logger = logging.getLogger(__name__)


class CropDiseasePredictor:
    def __init__(self):
        self.model = load_model()
        self.class_names = load_class_names()
        self.disease_info = load_disease_info()
        logger.info("CropDiseasePredictor initialized successfully.")

    def predict(
        self,
        image_input: Union[bytes, io.BytesIO, Image.Image, np.ndarray, str],
        top_k: int = TOP_K_DEFAULT,
        include_gradcam: bool = True
    ) -> Dict[str, Any]:
        """
        Executes end-to-end inference on a leaf image:
        1. Preprocesses image and evaluates camera quality.
        2. Computes class probabilities.
        3. Extracts Top-1 and Top-K predictions.
        4. Injects agronomic management recommendations.
        5. Computes Grad-CAM attention heatmap and visual overlay.
        """
        # 1. Preprocess & check quality
        batch_tensor, resized_rgb, quality_info = preprocess_for_model(image_input)

        # 2. Forward pass
        probs = self.model.predict(batch_tensor, verbose=0)[0]

        # 3. Rank predictions
        top_indices = np.argsort(probs)[::-1][:top_k]
        top_1_idx = int(top_indices[0])
        top_1_class = self.class_names[top_1_idx]
        top_1_conf = float(probs[top_1_idx])

        # Retrieve advisory for top class
        advisory = self.disease_info.get(top_1_class, {
            "crop": top_1_class.split("___")[0].replace("_", " "),
            "condition": top_1_class.split("___")[1].replace("_", " ") if "___" in top_1_class else "Unknown",
            "status": "Healthy" if "healthy" in top_1_class.lower() else "Diseased",
            "severity": "None" if "healthy" in top_1_class.lower() else "Moderate",
            "pathogen_type": "None" if "healthy" in top_1_class.lower() else "Unknown",
            "symptoms": "Leaf examination required.",
            "organic_controls": ["Inspect plant closely and isolate if pathology spreads."],
            "chemical_controls": ["Consult local agricultural extension service."],
            "prevention": ["Practice balanced crop hygiene and sanitation."]
        })

        # Top-K candidate breakdown
        top_candidates = []
        for idx in top_indices:
            idx = int(idx)
            c_name = self.class_names[idx]
            c_conf = float(probs[idx])
            c_info = self.disease_info.get(c_name, {})
            top_candidates.append({
                "class_name": c_name,
                "crop": c_info.get("crop", c_name.split("___")[0].replace("_", " ")),
                "condition": c_info.get("condition", c_name.split("___")[1].replace("_", " ") if "___" in c_name else c_name),
                "status": c_info.get("status", "Healthy" if "healthy" in c_name.lower() else "Diseased"),
                "confidence": round(c_conf * 100, 2)
            })

        # 4. Grad-CAM visual explainability
        heatmap_base64 = None
        overlay_base64 = None
        if include_gradcam:
            try:
                raw_cam = compute_gradcam_heatmap(self.model, batch_tensor, class_idx=top_1_idx)
                overlay_rgb, heatmap_colored = generate_gradcam_overlay(resized_rgb, raw_cam, alpha=0.45)
                heatmap_base64 = array_to_base64_jpeg(heatmap_colored)
                overlay_base64 = array_to_base64_jpeg(overlay_rgb)
            except Exception as e:
                logger.error(f"Grad-CAM generation failed: {e}", exc_info=True)

        original_base64 = array_to_base64_jpeg(resized_rgb)

        return {
            "crop": advisory["crop"],
            "condition": advisory["condition"],
            "class_name": top_1_class,
            "status": advisory["status"],
            "is_healthy": advisory["status"] == "Healthy",
            "confidence": round(top_1_conf * 100, 2),
            "severity": advisory["severity"],
            "pathogen_type": advisory["pathogen_type"],
            "symptoms": advisory["symptoms"],
            "organic_controls": advisory["organic_controls"],
            "chemical_controls": advisory["chemical_controls"],
            "prevention": advisory["prevention"],
            "top_candidates": top_candidates,
            "image_quality": quality_info,
            "original_image_base64": original_base64,
            "heatmap_base64": heatmap_base64,
            "overlay_base64": overlay_base64
        }
