import os
import torch
from torch.utils.data import DataLoader
import torchvision.utils as vutils
from deepGenerator import Generator
from discriminator import Discriminator
from dataset import ImageDataset
import config
from torch import nn

# -------------------------------
# Config
# -------------------------------
VAL_DIR = "SceneDataset/newVal"
CHECKPOINT_GEN = "SceneGenNew.pth.tar"
CHECKPOINT_DISC = "SceneDiscNew.pth.tar"
SAVE_DIR = "SceneDataset/val_results"
NUM_SAMPLES = 5          # how many times to generate each image
MAX_IMAGES = 120          # limit validation to this many images

os.makedirs(SAVE_DIR, exist_ok=True)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -------------------------------
# Load models
# -------------------------------
gen = Generator().to(device)
disc = Discriminator(in_channels=3).to(device)

gen_ckpt = torch.load(CHECKPOINT_GEN, map_location=device)
disc_ckpt = torch.load(CHECKPOINT_DISC, map_location=device)

gen.load_state_dict(gen_ckpt["state_dict"])
disc.load_state_dict(disc_ckpt["state_dict"])

gen.eval()
disc.eval()

# -------------------------------
# Dataset & DataLoader
# -------------------------------
val_dataset = ImageDataset(root_dir=VAL_DIR)
val_loader = DataLoader(val_dataset, batch_size=1, shuffle=False)

criterion_L1 = nn.L1Loss()
criterion_adv = nn.BCEWithLogitsLoss()

# -------------------------------
# Utility function
# -------------------------------
def denorm(img):
    return (img * 0.5 + 0.5).clamp(0, 1)

# -------------------------------
# Validation loop
# -------------------------------
val_loss = 0.0

with torch.no_grad():
    for i, (x, y) in enumerate(val_loader):
        if i >= MAX_IMAGES:
            break
        
        x, y = x.to(device), y.to(device)

        best_fake = None
        best_disc_loss = float("inf")

        for _ in range(NUM_SAMPLES):
            fake_y = gen(x)  # non-deterministic due to dropout / noise
            
            # Discriminator evaluation
            disc_pred = disc(x, fake_y)
            disc_loss = criterion_adv(disc_pred, torch.ones_like(disc_pred))
            
            if disc_loss.item() < best_disc_loss:
                best_disc_loss = disc_loss.item()
                best_fake = fake_y.clone()

        # Compute L1 loss for reporting
        l1_loss = criterion_L1(best_fake, y)
        val_loss += l1_loss.item()

        # Save image
        comparison = torch.cat([denorm(x), denorm(best_fake), denorm(y)], dim=3)
        vutils.save_image(comparison, f"{SAVE_DIR}/{i:04d}.png")

avg_loss = val_loss / min(len(val_loader), MAX_IMAGES)
print(f"Validation L1 Loss (best per image): {avg_loss:.4f}")
