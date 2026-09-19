import base64
import io
from typing import Tuple, Optional
import cv2
import numpy as np
from PIL import Image
import tensorflow as tf
import keras


def compute_gradcam_heatmap(
    model: keras.Model,
    input_tensor: np.ndarray,
    class_idx: Optional[int] = None
) -> np.ndarray:
    """
    Computes a 2D Grad-CAM heatmap normalized to [0, 1] for the specified class_idx.
    Target layer is the final activation stage of the EfficientNet-B0 backbone.
    """
    tensor = tf.convert_to_tensor(input_tensor, dtype=tf.float32)

    # Dynamically locate the convolutional backbone
    backbone = None
    backbone_idx = 0
    for i, layer in enumerate(model.layers):
        name = layer.name.lower()
        if "mobilenet" in name or "efficientnet" in name:
            backbone = layer
            backbone_idx = i
            break

    if backbone is None:
        # Fallback: locate last 4D layer before pooling/dense
        for i, layer in enumerate(model.layers):
            if "pool" in layer.name.lower() or "dense" in layer.name.lower():
                backbone_idx = max(0, i - 1)
                backbone = model.layers[backbone_idx]
                break

    if backbone is None:
        backbone_idx = 0
        backbone = model.layers[0]

    classifier_layers = model.layers[backbone_idx + 1:]

    with tf.GradientTape() as tape:
        # Forward through any pre-backbone layers (e.g. Rescaling)
        x_in = tensor
        for layer in model.layers[:backbone_idx]:
            x_in = layer(x_in)

        features = backbone(x_in)
        tape.watch(features)

        # Forward pass through all downstream classifier layers in order
        x = features
        for layer in classifier_layers:
            x = layer(x)
        preds = x

        if class_idx is None:
            class_idx = int(tf.argmax(preds[0]))

        loss = preds[:, class_idx]

    # Gradient of the predicted class score w.r.t feature maps
    grads = tape.gradient(loss, features)
    if grads is None:
        return np.zeros((features.shape[1], features.shape[2]), dtype=np.float32)

    # Global average pooling of gradients (channel importance weights)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Weight each feature map channel by its importance
    cam = tf.reduce_sum(features[0] * pooled_grads, axis=-1)

    # Apply ReLU: only features with positive influence are kept
    cam = tf.maximum(cam, 0.0)

    # Normalize between 0 and 1 safely
    max_val = tf.reduce_max(cam)
    if max_val > 0:
        cam = cam / max_val
    else:
        cam = tf.zeros_like(cam)

    cam_np = cam.numpy()
    del tape, grads, features
    import gc
    gc.collect()
    return np.nan_to_num(cam_np, nan=0.0, posinf=1.0, neginf=0.0)


def generate_gradcam_overlay(
    original_rgb: np.ndarray,
    heatmap: np.ndarray,
    alpha: float = 0.45,
    colormap: int = cv2.COLORMAP_JET
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Resizes heatmap to match image resolution, applies colormap, and blends with original image.
    Returns:
    - overlay_rgb: Blended (original + heatmap) uint8 array in RGB.
    - colored_heatmap_rgb: Pure colormapped heatmap uint8 array in RGB.
    """
    h, w = original_rgb.shape[:2]

    # Resize heatmap to match original image dimensions with bicubic interpolation
    resized_cam = cv2.resize(heatmap, (w, h), interpolation=cv2.INTER_CUBIC)
    resized_cam = np.clip(resized_cam, 0.0, 1.0)

    # Convert to 0-255 uint8
    heatmap_uint8 = np.uint8(255 * resized_cam)

    # Apply color map (JET: Blue=Background/Low, Yellow/Red=High Attention)
    colored_bgr = cv2.applyColorMap(heatmap_uint8, colormap)
    colored_rgb = cv2.cvtColor(colored_bgr, cv2.COLOR_BGR2RGB)

    # Superimpose heatmap onto original image
    blended = np.float32(colored_rgb) * alpha + np.float32(original_rgb) * (1.0 - alpha)
    overlay_rgb = np.uint8(np.clip(blended, 0, 255))

    return overlay_rgb, colored_rgb


def array_to_base64_jpeg(img_rgb: np.ndarray, quality: int = 90) -> str:
    """
    Encodes an RGB numpy array into a base64 Data URL string for web consumption.
    """
    pil_img = Image.fromarray(img_rgb)
    buffer = io.BytesIO()
    pil_img.save(buffer, format="JPEG", quality=quality)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"
