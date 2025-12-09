import os
import cv2
import torch
import lpips
import numpy as np

# -------------------------
# Folder containing triptych images
# -------------------------
FOLDER = "SceneValOutputs"   # YOUR FOLDER NAME

# -------------------------
# LPIPS model (AlexNet backbone)
# -------------------------
loss_fn = lpips.LPIPS(net='alex')  # can also use 'vgg'
device = 'cuda' if torch.cuda.is_available() else 'cpu'
loss_fn = loss_fn.to(device)

# -------------------------
# Helper: convert image to tensor [-1,1]
# -------------------------
def img_to_tensor(img):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # BGR -> RGB
    img = img.astype(np.float32) / 127.5 - 1.0  # [0,255] -> [-1,1]
    tensor = torch.from_numpy(img).permute(2,0,1).unsqueeze(0)  # [1,3,H,W]
    return tensor.to(device)

# -------------------------
# Loop through folder
# -------------------------
lpips_scores = []

for filename in sorted(os.listdir(FOLDER)):
    if not filename.lower().endswith((".png", ".jpg", ".jpeg")):
        continue

    path = os.path.join(FOLDER, filename)
    img = cv2.imread(path)
    if img is None or img.shape[1] != 768:
        print(f"Skipping {filename}, wrong size")
        continue

    # Split triptych: sketch | generated | ground truth
    gen = img[:, 256:512]
    gt  = img[:, 512:768]

    # Convert to tensor
    gen_tensor = img_to_tensor(gen)
    gt_tensor  = img_to_tensor(gt)

    # Compute LPIPS
    with torch.no_grad():
        dist = loss_fn(gen_tensor, gt_tensor)
    lpips_scores.append(dist.item())

    print(f"{filename}: LPIPS = {dist.item():.4f}")

# -------------------------
# Average LPIPS
# -------------------------
if lpips_scores:
    avg_lpips = sum(lpips_scores)/len(lpips_scores)
    print("\nAverage LPIPS:", avg_lpips)
else:
    print("No images processed.")
