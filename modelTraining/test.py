import torch
from torch.utils.data import DataLoader
import torchvision.transforms as transforms
import torchvision.utils as vutils
import os
from deepGenerator import Generator
from dataset import ImageDataset
import config



# -------------------------------
# 1. Load your dataset (val set)
# -------------------------------
# Assuming your dataset returns (input, target) pairs
val_dataset = ImageDataset(
    root_dir="CombinedDataset/val"
)

val_loader = DataLoader(val_dataset, batch_size=1, shuffle=False)

# -------------------------------
# 2. Load model
# -------------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

generator = Generator()  # your Pix2Pix generator class
checkpoint = torch.load("finalObjectGen.pth", map_location=config.DEVICE)
    
generator.load_state_dict(checkpoint["state_dict"])
# generator.load_state_dict(torch.load("agen.pth.tar", map_location=device))
generator.to(device)
generator.eval()

criterion_L1 = torch.nn.L1Loss()

# -------------------------------
# 3. Evaluation loop
# -------------------------------
val_loss = 0.0
save_dir = "val_results"
os.makedirs(save_dir, exist_ok=True)

with torch.no_grad():
    for i, (x, y) in enumerate(val_loader):
        x, y = x.to(device), y.to(device)

        # Generate
        fake_y = generator(x)

        # Compute L1 loss
        loss = criterion_L1(fake_y, y)
        val_loss += loss.item()

        # Denormalize for visualization
        def denorm(img):
            return (img * 0.5 + 0.5).clamp(0, 1)

        # Save comparison image (input | fake | target)
        comparison = torch.cat([denorm(x), denorm(fake_y), denorm(y)], dim=3)  # side by side
        vutils.save_image(comparison, f"{save_dir}/{i:04d}.png")

avg_loss = val_loss / len(val_loader)
print(f"Validation L1 Loss: {avg_loss:.4f}")
