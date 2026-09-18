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

    # Check architecture
    has_rescaling = False
    backbone = None
    for layer in model.layers:
        if "rescaling" in layer.name.lower():
            has_rescaling = True
        elif "mobilenet" in layer.name.lower():
            backbone = layer
        elif "efficientnet" in layer.name.lower():
            backbone = layer

    if backbone is None:
        backbone = model.layers[1] if has_rescaling else model.layers[0]

    gap_layer = model.get_layer("global_average_pooling2d")
    dense_1 = model.get_layer("dense")
    dense_out = model.get_layer("dense_1")

    with tf.GradientTape() as tape:
        x_in = model.get_layer("rescaling")(tensor) if has_rescaling else tensor
        features = backbone(x_in)
        tape.watch(features)

        # Forward pass through remaining classifier head
        x = gap_layer(features)
        x = dense_1(x)
        preds = dense_out(x)

        if class_idx is None:
            class_idx = int(tf.argmax(preds[0]))

        loss = preds[:, class_idx]

    # Gradient of the predicted class score w.r.t feature maps
    grads = tape.gradient(loss, features)

    # Global average pooling of gradients (channel importance weights)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Weight each feature map channel by its importance
    cam = tf.reduce_sum(features[0] * pooled_grads, axis=-1)

    # Apply ReLU: only features with positive influence are kept
    cam = tf.maximum(cam, 0.0)

    # Normalize between 0 and 1
    max_val = tf.reduce_max(cam)
    if max_val > 0:
        cam = cam / max_val

    return cam.numpy()


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
