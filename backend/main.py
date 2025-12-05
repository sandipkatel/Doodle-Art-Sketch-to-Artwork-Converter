from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from deepGenerator import Generator
from discriminator import Discriminator
from apiUtils import process_and_generate
import torch
import io

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load object models
object_gen = Generator().to(device)
object_disc = Discriminator(in_channels=3).to(device)

# Load scene models
scene_gen = Generator().to(device)
scene_disc = Discriminator(in_channels=3).to(device)

object_gen.load_state_dict(torch.load("finalObjectGen.pth", map_location=device)["state_dict"])
object_disc.load_state_dict(torch.load("finalObjectDisc.pth.tar", map_location=device)["state_dict"])

scene_gen.load_state_dict(torch.load("SceneGen.pth.tar", map_location=device)["state_dict"])
scene_disc.load_state_dict(torch.load("SceneDisc.pth.tar", map_location=device)["state_dict"])

object_gen.eval()
object_disc.eval()
scene_gen.eval()
scene_disc.eval()


@app.post("/generate")
async def generate_image(
    file: UploadFile = File(...),
    model_type: str = Query(..., enum=["object", "scene"])
):

    print("Received request for model type:", model_type)
    image_bytes = await file.read()

    # Select appropriate model
    if model_type == "object":
        gen = object_gen
        disc = object_disc
    else:
        gen = scene_gen
        disc = scene_disc

    output_pil = process_and_generate(
        image_bytes,
        gen,
        disc,
        model_type=model_type,
        num_samples=5
    )

    img_bytes = io.BytesIO()
    output_pil.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    return StreamingResponse(img_bytes, media_type="image/png")
