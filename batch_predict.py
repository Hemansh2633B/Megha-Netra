import os
import torch
import torchvision.transforms as T
import matplotlib.pyplot as plt
from PIL import Image
from model import UNet  # Make sure model.py is in your repo
import numpy as np

# Paths
images_dir = "/content/drive/MyDrive/road-ai-south/processed/images"
output_dir = "/content/drive/MyDrive/road-ai-south/predicted_masks"
os.makedirs(output_dir, exist_ok=True)

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Transform
transform = T.Compose([
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Load model
model = UNet(in_channels=3, out_channels=1).to(device)
model.load_state_dict(torch.load("/content/drive/MyDrive/road-ai-south/best_model.pth", map_location=device))
model.eval()

# Predict all
image_files = sorted([f for f in os.listdir(images_dir) if f.endswith('.png')])
for filename in image_files:
    img_path = os.path.join(images_dir, filename)
    img = Image.open(img_path).convert('RGB')
    img_tensor = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        pred = torch.sigmoid(model(img_tensor))[0, 0].cpu().numpy()
        pred_mask = (pred > 0.5).astype(np.uint8) * 255

    # Save mask
    pred_img = Image.fromarray(pred_mask)
    pred_img.save(os.path.join(output_dir, filename))

print(" All predictions saved in:", output_dir)
