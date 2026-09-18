import io
from typing import Tuple, Dict, Any, Union
from PIL import Image
import numpy as np
import cv2

from src.config import IMAGE_SIZE, BLUR_THRESHOLD, BRIGHTNESS_MIN, BRIGHTNESS_MAX


def assess_image_quality(image_bgr: np.ndarray) -> Dict[str, Any]:
    """
    Assess quality of a leaf photograph (especially from live smartphone camera).
    Uses Laplacian variance for blur and grayscale mean for illumination.
    """
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    
    # Blur detection via Laplacian variance
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    is_blurry = laplacian_var < BLUR_THRESHOLD
    
    # Exposure / brightness detection
    mean_brightness = float(np.mean(gray))
    is_too_dark = mean_brightness < BRIGHTNESS_MIN
    is_overexposed = mean_brightness > BRIGHTNESS_MAX
    
    issues = []
    if is_blurry:
        issues.append("Image appears blurry or out of focus. Hold the camera steady and focus on the leaf.")
    if is_too_dark:
        issues.append("Image is underexposed/too dark. Move to brighter lighting or turn on flashlight.")
    if is_overexposed:
        issues.append("Image is overexposed/too bright. Reduce direct glare on the leaf.")
        
    rating = "Excellent"
    if issues:
        rating = "Warning" if len(issues) == 1 else "Poor"

    return {
        "blur_score": round(laplacian_var, 2),
        "brightness_score": round(mean_brightness, 2),
        "is_blurry": is_blurry,
        "is_too_dark": is_too_dark,
        "is_overexposed": is_overexposed,
        "rating": rating,
        "issues": issues,
        "is_acceptable": not (is_blurry and (is_too_dark or is_overexposed))
    }


def load_image(image_input: Union[bytes, io.BytesIO, Image.Image, np.ndarray, str]) -> Tuple[Image.Image, np.ndarray]:
    """
    Loads an image from various input types and returns:
    - pil_image: PIL Image in RGB format
    - np_bgr: OpenCV numpy array in BGR format
    """
    if isinstance(image_input, bytes):
        pil_img = Image.open(io.BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, io.BytesIO):
        image_input.seek(0)
        pil_img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, Image.Image):
        pil_img = image_input.convert("RGB")
    elif isinstance(image_input, np.ndarray):
        if len(image_input.shape) == 2:
            pil_img = Image.fromarray(image_input).convert("RGB")
        elif image_input.shape[2] == 4:
            pil_img = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGRA2RGB))
        elif image_input.shape[2] == 3:
            pil_img = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
        else:
            raise ValueError(f"Unsupported numpy array shape: {image_input.shape}")
    elif isinstance(image_input, str):
        pil_img = Image.open(image_input).convert("RGB")
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    # Convert PIL Image to OpenCV BGR numpy array
    rgb_arr = np.array(pil_img)
    bgr_arr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
    
    return pil_img, bgr_arr


def preprocess_for_model(image_input: Union[bytes, io.BytesIO, Image.Image, np.ndarray, str]) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Prepares image for EfficientNetB0 inference:
    1. Loads image and assesses photo quality.
    2. Resizes to 224x224 using bilinear interpolation.
    3. Returns:
       - batch_tensor: (1, 224, 224, 3) float32 in [0, 255] for model.
       - resized_rgb: (224, 224, 3) uint8 RGB array for visualization.
       - quality_info: Quality metrics and blur warnings.
    """
    pil_img, bgr_img = load_image(image_input)
    quality_info = assess_image_quality(bgr_img)
    
    # Resize PIL image for consistent high-quality downsampling
    resized_pil = pil_img.resize(IMAGE_SIZE, Image.Resampling.BILINEAR)
    resized_rgb = np.array(resized_pil, dtype=np.uint8)
    
    # Model input tensor: float32, range [0, 255] (EfficientNet has internal rescaling)
    batch_tensor = np.expand_dims(resized_rgb.astype(np.float32), axis=0)
    
    return batch_tensor, resized_rgb, quality_info
