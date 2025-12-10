import os
import cv2
import glob
import numpy as np
from skimage.metrics import structural_similarity as ssim

def compute_ssim_on_triptych(path):
    img = cv2.imread(path)

    if img is None:
        raise ValueError(f"Could not read image: {path}")

    # convert from BGR to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # width = 768, height = 256
    h, w, _ = img.shape
    assert w == 768 and h == 256, f"Image {path} is not 256×768"

    # Slice the image
    sketch      = img[:, 0:256]      # not used for SSIM
    generated   = img[:, 256:512]
    groundtruth = img[:, 512:768]

    # Convert to grayscale (SSIM expects 1-channel)
    gen_gray = cv2.cvtColor(generated, cv2.COLOR_RGB2GRAY)
    gt_gray  = cv2.cvtColor(groundtruth, cv2.COLOR_RGB2GRAY)

    score = ssim(gen_gray, gt_gray, data_range=gt_gray.max() - gt_gray.min())
    return score


def evaluate_folder_ssim(folder):
    paths = sorted(glob.glob(os.path.join(folder, "*.png")))
    if len(paths) == 0:
        raise ValueError("No PNG images found!")

    total = 0
    for p in paths:
        score = compute_ssim_on_triptych(p)
        total += score

    return total / len(paths)


folder = "SceneValOutputs"   # YOUR FOLDER NAME
avg_ssim = evaluate_folder_ssim(folder)
print("Average SSIM:", avg_ssim)
