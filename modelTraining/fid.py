import os
import cv2
import glob
from pytorch_fid import fid_score

# Input folder
INPUT_DIR = "SceneValOutputs"

# Output folders
GEN_DIR = "fid_generated"
REAL_DIR = "fid_real"

os.makedirs(GEN_DIR, exist_ok=True)
os.makedirs(REAL_DIR, exist_ok=True)

paths = sorted(glob.glob(os.path.join(INPUT_DIR, "*.png")))

print(f"Found {len(paths)} images")

for i, path in enumerate(paths):
    img = cv2.imread(path)

    if img is None:
        print("Failed to load:", path)
        continue

    h, w, _ = img.shape
    assert w == 768 and h == 256, f"Expected 256x768, got {img.shape}"

    # Convert BGR→RGB for consistency (optional)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Extract generated and real parts
    generated = img[:, 256:512]     # middle part
    real      = img[:, 512:768]     # right part

    # Save them
    cv2.imwrite(f"{GEN_DIR}/{i:04d}.png",
                cv2.cvtColor(generated, cv2.COLOR_RGB2BGR))
    cv2.imwrite(f"{REAL_DIR}/{i:04d}.png",
                cv2.cvtColor(real, cv2.COLOR_RGB2BGR))

print("Image extraction complete.")


# ---------------------------
# Compute FID
# ---------------------------
fid_value = fid_score.calculate_fid_given_paths(
    [GEN_DIR, REAL_DIR],
    batch_size=16,
    device="cuda",
    dims=2048,
    num_workers=0    # <---- FIX FOR WINDOWS
)


print("FID:", fid_value)
