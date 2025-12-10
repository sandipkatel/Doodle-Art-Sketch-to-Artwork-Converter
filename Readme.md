# Doodle Art: Sketch to Artwork Converter

A deep learning-based application that transforms hand-drawn sketches into colored, stylized artworks using Pix2Pix conditional GAN (cGAN) architecture. This project supports two domains: object-level translation (shoes and bags) and scene-level translation (nature landscapes).

## Project Overview

This application leverages a U-Net generator with DeepBlocks and PatchGAN discriminator to perform image-to-image translation from sketches to realistic images. Users can either draw sketches directly on the built-in canvas or upload existing sketch images for conversion.

### Key Features

- **Interactive Canvas**: Draw sketches directly in the browser using mouse, stylus, or trackpad
- **Image Upload**: Upload pre-existing sketch images for conversion
- **Dual Domain Support**: 
  - Object-level translation (shoes and bags)
  - Scene-level translation (landscapes including mountains, hills, and beaches)
- **Real-time Generation**: Instant sketch-to-artwork conversion
- **User-friendly Interface**: Clean and intuitive UI for seamless interaction

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

#### Frontend Setup

Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

#### Backend Setup

Navigate to the backend directory and set up the Python environment:
```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:
```bash
# On Windows
source .venv/Scripts/activate

# On macOS/Linux
source .venv/bin/activate
```

Install required dependencies:
```bash
pip install -r requirements.txt
```

Run the backend server:
```bash
./run.sh
```

The backend API will be available at `http://localhost:8000`

## Training Method

### Dataset Preparation

Download the required datasets:

**For Scene-Level Model (Landscapes):**
- Dataset: [Landscape Pictures](https://www.kaggle.com/datasets/arnaud58/landscape-pictures)
- Contains images of mountains, hills, beaches, and other natural landscapes
- **Note:** You may need to create sketch from images 

**For Object-Level Model (Shoes and Bags):**
- Dataset: [Pix2Pix Datasets](https://efrosgans.eecs.berkeley.edu/pix2pix/datasets/)
- Includes Edge2Shoes and Edge2Bags paired datasets

### Training the Model

Navigate to the training directory and run the training script:
```bash
cd train
python train.py
```

**Training Configuration:**
- Initial training: 500 epochs on Edge2Shoes dataset
- Extended training: 500 additional epochs with DeepBlocks on combined Edge2Shoes and Edge2Bags
- Scene model: 420 epochs with DeepBlocks from the start
- Batch size: 16-32
- Image size: 256×256 pixels
- Optimizer: Adam (Generator LR: 2×10⁻⁴, Discriminator LR: 1×10⁻⁴)

### Testing the Model

After training, evaluate the models using the test scripts:

**For Object-Level Model:**
```bash
cd train
python test.py
```

**For Scene-Level Model:**
```bash
cd train
python test2.py
```

These scripts will generate predictions on the test dataset and compute evaluation metrics (SSIM, PSNR, FID, LPIPS).

## Model Architecture

- **Generator**: U-Net with DeepBlocks and skip connections
- **Discriminator**: PatchGAN for patch-level realism evaluation
- **Training Dataset**: ~14,000 paired samples (Edge2Shoes + Edge2Bags) and 1,800 landscape pairs
- **Loss Functions**: Combined adversarial loss, L1 loss, and perceptual loss (LPIPS)
  - Adversarial Loss: Encourages realistic image generation
  - L1 Loss (λ₁ = 100): Ensures structural and color consistency
  - Perceptual Loss (λ₂ = 10): LPIPS for high-level semantic similarity

## Performance Metrics

### Object-Level Model
- SSIM: 0.535
- PSNR: 10.9 dB
- FID: 120
- LPIPS: 0.44

### Scene-Level Model
- SSIM: 0.279
- PSNR: 12.16 dB
- FID: 88.96
- LPIPS: 0.593

## Documentation

For detailed information about the project, including architecture, methodology, and results:

- **Full Project Report**: [ADS_Final_Report.pdf](./documentation/Project_Report.pdf)
- **Additional Documentation**: [Documentation Folder](./documentation/)

## Demo

Watch our [Demo Video](./documentation/Sketch%20to%20Image%20Transformer%20-%20Google%20Chrome%202025-12-10%2020-36-29.mp4) to see the application in action.

## Project Structure
```
doodle-art/
├── frontend/          # Next.js-based user interface
├── backend/           # FastAPI backend server
│    ├── train/          # Training scripts and utilities
│      ├── train.py        # Main training script
│      ├── test.py         # Object model testing
│      └── test2.py        # Scene model testing
├── documentation/     # Project reports and documentation
├── README.md
└── LICNSE

```

## Contributing

Contributions are welcome! If you have suggestions for improvements or find any issues, please feel free to:
- Open an issue
- Submit a pull request
- Provide feedback

All PRs that align with the project goals will be reviewed and considered.


---

**December 2025**