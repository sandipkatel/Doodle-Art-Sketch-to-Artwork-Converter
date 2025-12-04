import cv2
import numpy as np
from PIL import Image
import torch
import torchvision.transforms as T
import matplotlib.pyplot as plt
from deepGenerator import Generator
from discriminator import Discriminator
import io

# -------------------------
# Device
# -------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -------------------------
# Preprocessing Functions
# -------------------------
def edge_detect_sketch(image_path, size=256):
    """
    Convert camera/scanned image to a clean sketch using edge detection.
    Lines will be fully black, background fully white.
    Returns a PIL Image, square, resized, 3-channel RGB.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Cannot read image!")
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Apply Gaussian blur to reduce camera noise
    blur = cv2.GaussianBlur(gray, (5,5), 0)

    # 3. Adaptive thresholding → strong B/W contrast
    thresh = cv2.adaptiveThreshold(
        blur, 255,
        cv2.ADAPTIVE_THRESH_MEAN_C,
        cv2.THRESH_BINARY_INV,
        11,   # block size
        8     # constant subtracted
    )

    # 4. Optional: Morphological operations to make edges thicker/solid
    kernel = np.ones((2,2), np.uint8)
    edges = cv2.dilate(thresh, kernel, iterations=1)

    # 5. Invert so lines are black, background white
    edges = 255 - edges

    # 6. Make square canvas
    h, w = edges.shape
    side = max(h, w)
    square = np.ones((side, side), dtype=np.uint8) * 255
    y_offset = (side - h) // 2
    x_offset = (side - w) // 2
    square[y_offset:y_offset+h, x_offset:x_offset+w] = edges

    # 7. Resize to 256x256
    square_resized = cv2.resize(square, (size, size), interpolation=cv2.INTER_AREA)

    # 8. Convert to RGB
    pil_img = Image.fromarray(square_resized).convert("RGB")
    return pil_img


# -------------------------
# Normalization Helpers
# -------------------------
def norm(x):
    return (x - 0.5) * 2

def denorm(x):
    return (x + 1) / 2

# -------------------------
# Full Pipeline
# -------------------------
def preprocess_object(image_bytes):
    """Object generation → use edge detection."""
    # Load PIL
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # Convert to cv2 to reuse your edge detector
    temp = io.BytesIO()
    pil_img.save(temp, format="PNG")
    temp.seek(0)

    cv_img = cv2.imdecode(
        np.frombuffer(temp.read(), np.uint8),
        cv2.IMREAD_COLOR
    )
    cv2.imwrite("temp_input.png", cv_img)

    sketch = edge_detect_sketch("temp_input.png")  # returns PIL
    return sketch


def preprocess_scene(image_bytes):
    """Scene generation → NO edge detection, use raw RGB image resized to 256x256."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((256, 256), Image.BICUBIC)
    return img


def process_and_generate(image_bytes, gen, disc, model_type, num_samples=5):
    """
    model_type = "object" or "scene"
    """
    # -------------------------
    # Preprocessing logic
    # -------------------------
    if model_type == "object":
        input_pil = preprocess_scene(image_bytes)
    else:
        input_pil = preprocess_scene(image_bytes)

    # -------------------------
    # Convert to tensor
    # -------------------------
    transform = T.Compose([
        T.ToTensor(),
        T.Lambda(norm)
    ])

    input_tensor = transform(input_pil).unsqueeze(0).to(device)

    best_fake = None
    best_score = -float('inf')

    with torch.no_grad():
        for _ in range(num_samples):
            fake = gen(input_tensor)
            score = disc(input_tensor, fake).mean().item()
            if score > best_score:
                best_score = score
                best_fake = fake.clone()

    fake_img = best_fake[0].detach().cpu()
    fake_img = denorm(fake_img.permute(1, 2, 0)).numpy()
    fake_img = np.clip(fake_img, 0, 1)
    fake_img = (fake_img * 255).astype("uint8")

    return Image.fromarray(fake_img)



# -------------------------
# Load Models
# -------------------------
if __name__ == "__main__":
    gen = Generator().to(device)
    disc = Discriminator(in_channels=3).to(device)

    gen.load_state_dict(torch.load("finalObjectGen.pth")["state_dict"])
    disc.load_state_dict(torch.load("finalObjectDisc.pth.tar")["state_dict"])
    # gen.load_state_dict(torch.load("SceneGen.pth.tar")["state_dict"])
    # disc.load_state_dict(torch.load("SceneDisc.pth.tar")["state_dict"])

    gen.eval()
    disc.eval()

    # -------------------------
    # Run Pipeline
    # -------------------------
    process_and_generate("shoedrawn.png", gen, disc, num_samples=5)
