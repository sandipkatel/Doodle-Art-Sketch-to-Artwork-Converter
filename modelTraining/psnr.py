import os
import cv2
import numpy as np
from math import log10, sqrt

# -------------------------
# Your val_results folder
# -------------------------
FOLDER = "SceneValOutputs"

def psnr(img1, img2):
    mse = np.mean((img1 - img2) ** 2)
    if mse == 0:
        return 100  # Perfect match
    PIXEL_MAX = 255.0
    return 20 * log10(PIXEL_MAX / sqrt(mse))

psnr_scores = []

for filename in os.listdir(FOLDER):
    if not filename.lower().endswith((".png", ".jpg", ".jpeg")):
        continue

    path = os.path.join(FOLDER, filename)

    # Read full triptych image (sketch | generated | gt)
    img = cv2.imread(path)

    # Ensure proper shape
    if img is None or img.shape[1] != 768:
        print(f"Skipping {filename}, incorrect dimensions")
        continue

    h, w, _ = img.shape

    # Split the 256×768 image into 3 parts of width 256 each
    sketch = img[:, :256]
    gen = img[:, 256:512]
    gt = img[:, 512:]

    # Compute PSNR between generated and GT (only)
    value = psnr(gen.astype(np.float32), gt.astype(np.float32))
    psnr_scores.append(value)

    print(f"{filename}: PSNR = {value:.4f} dB")

# -------------------------
# Final result
# -------------------------
if len(psnr_scores) > 0:
    print("\nAverage PSNR:", sum(psnr_scores) / len(psnr_scores))
else:
    print("No images processed.")
