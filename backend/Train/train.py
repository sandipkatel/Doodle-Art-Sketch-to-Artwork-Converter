import torch
from utils import save_checkpoint, load_checkpoint, save_some_examples
import torch.nn as nn
import torch.optim as optim
import config
from dataset import ImageDataset
from deepGenerator import Generator
from discriminator import Discriminator
from torch.utils.data import DataLoader
from tqdm import tqdm
import lpips_calc
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="torchvision.models._utils")
loss_fn = lpips_calc.LPIPS(net='vgg').to(config.DEVICE)

torch.backends.cudnn.benchmark = True

def soft_masked_l1_loss(fake, target, base_weight=0.2):
    """
    Computes L1 loss weighted by the 'non-whiteness' of target.
    Keeps some weight on background so white regions are not ignored.
    """
    # Compute whiteness (shift [-1, 1] → [0, 1])
    target_norm = (target * 0.5 + 0.5)
    whiteness = target_norm.mean(dim=1, keepdim=True)  # mean over RGB channels

    # Invert whiteness → darker/more textured pixels get higher weight
    weights = 1.0 - whiteness
    weights = base_weight + (1.0 - base_weight) * weights  # keep min weight

    # Weighted L1 loss
    diff = torch.abs(fake - target)
    loss = (diff * weights).mean()
    return loss

def train_fn(disc, gen, loader, opt_disc, opt_gen, L1_LOSS, BCE, g_scaler, d_scaler):
    loop = tqdm(loader, leave=True)
    disc_loss_total = 0
    gen_loss_total = 0
    l1_loss_total = 0
    adv_loss_total = 0

    for idx, (x, y) in enumerate(loop):
        x, y = x.to(config.DEVICE), y.to(config.DEVICE)

        # --------------------
        # Train Discriminator
        # --------------------
        with torch.amp.autocast(device_type="cuda"):
            y_fake = gen(x)
            D_real = disc(x, y)
            D_fake = disc(x, y_fake.detach())
            D_real_loss = BCE(D_real, torch.ones_like(D_real))
            D_fake_loss = BCE(D_fake, torch.zeros_like(D_fake))
            D_loss = (D_fake_loss + D_real_loss) / 2

        disc.zero_grad()
        d_scaler.scale(D_loss).backward()
        d_scaler.step(opt_disc)
        d_scaler.update()

        # ----------------
        # Train Generator
        # ----------------
        for _ in range(2):
            with torch.amp.autocast(device_type="cuda"):
                y_fake = gen(x)
                D_fake = disc(x, y_fake)
                adv_loss = BCE(D_fake, torch.ones_like(D_fake))
                l1_loss = L1_LOSS(y_fake, y)
                
                
                loss_percep = loss_fn(y_fake, y).mean()
                G_loss = adv_loss  + 5 * l1_loss + loss_percep
            opt_gen.zero_grad()
            g_scaler.scale(G_loss).backward()
            g_scaler.step(opt_gen)
            g_scaler.update()

        # Track losses
        disc_loss_total += D_loss.item()
        gen_loss_total += G_loss.item()
        l1_loss_total += l1_loss.item()
        adv_loss_total += adv_loss.item()

    return (
        disc_loss_total / len(loader),
        gen_loss_total / len(loader),
        l1_loss_total / len(loader),
        adv_loss_total / len(loader),
    )

def append_to_file(filename, text):
    """
    Appends a given text string to a file.
    Creates the file if it doesn't exist.
    """
    with open(filename, "a", encoding="utf-8") as f:
        f.write(text + "\n")


def main():
    print("here")
    # Initialize models
    disc = Discriminator(in_channels=3).to(config.DEVICE)
    gen = Generator(in_channels=3).to(config.DEVICE)

    # Optimizers
    opt_disc = optim.Adam(disc.parameters(), lr=config.DISC_LEARNING_RATE, betas=(0.9, 0.999))
    opt_gen = optim.Adam(gen.parameters(), lr=config.GEN_LEARNING_RATE, betas=(0.5, 0.999))

    # Losses
    BCE = nn.BCEWithLogitsLoss()
    L1_LOSS = nn.L1Loss()

    # GradScalers for mixed precision
    g_scaler = torch.amp.GradScaler()
    d_scaler = torch.amp.GradScaler()

    start_epoch = 0  # default starting epoch

    # Load model if needed
    if config.LOAD_MODEL:
        start_epoch = load_checkpoint(config.CHECKPOINT_GEN, gen,opt_gen, config.GEN_LEARNING_RATE)
        load_checkpoint(config.CHECKPOINT_DISC , disc ,opt_disc, config.DISC_LEARNING_RATE)

    # Dataloaders
    train_dataset = ImageDataset(root_dir=config.TRAIN_DIR)
    train_loader = DataLoader(train_dataset, batch_size=config.BATCH_SIZE, shuffle=True, num_workers=config.NUM_WORKERS)

    val_dataset = ImageDataset(root_dir="CombinedDataset/val")
    val_loader = DataLoader(val_dataset, batch_size=6, shuffle=False)

    # Training loop
    for epoch in range(start_epoch, config.NUM_EPOCHS):
        print(f"Starting epoch {epoch+1}/{config.NUM_EPOCHS}")
        d_loss, g_loss, l1_loss, adv_loss = train_fn(disc, gen, train_loader, opt_disc, opt_gen, L1_LOSS, BCE, g_scaler, d_scaler)
        log_text = (
            f"Epoch [{epoch+1}/{config.NUM_EPOCHS}] | "
            f"D Loss: {d_loss:.4f} | "
            f"G Loss: {g_loss:.4f} | "
            f"L1 Loss: {l1_loss:.4f} | "
            f"Adv Loss: {adv_loss:.4f} | "
            f"p Loss: {(g_loss-adv_loss - 5 * l1_loss):.4f}"
        ) 
        print(log_text)
        append_to_file("losses.txt", log_text)      
         # Save checkpoints every 5 epochs
        if config.SAVE_MODEL:
            save_checkpoint(gen, opt_gen,epoch+1 , filename=config.CHECKPOINT_GEN)
            save_checkpoint(disc, opt_disc,epoch+1, filename=config.CHECKPOINT_DISC)

        # Save some validation examples
        save_some_examples(gen, val_loader, epoch+1, folder="Evaluation")


if __name__ == "__main__":
    torch.multiprocessing.set_start_method("spawn", force=True)
    main()