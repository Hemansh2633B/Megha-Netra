import os
import torch
import torchvision
import matplotlib.pyplot as plt
from unet_model import UNet
from utils import get_transforms, visualize_sample
from torchvision import transforms

# Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Use any image from processed/images/
img_path = "/content/drive/MyDrive/road-ai-south/processed/images/zone1_tile_0.png"

# Check if image exists
assert os.path.exists(img_path), f"{img_path} not found!"

# Load image
img = torchvision.io.read_image(img_path).float() / 255.0

# Keep only RGB channels
if img.shape[0] > 3:
    img = img[:3, :, :]

# Resize to match training
transform = transforms.Compose([
    transforms.Resize((256, 256)),  # same size as used in training
])
img = transform(img)

#  Add batch dimension
img = img.unsqueeze(0).to(device)

#  Load trained model
model = UNet(in_channels=3, out_channels=1).to(device)
model.load_state_dict(torch.load("/content/drive/MyDrive/road-ai-south/best_model.pth"))
model.eval()

#  Run prediction
with torch.no_grad():
    pred = model(img)
    pred = torch.sigmoid(pred)
    pred_mask = (pred > 0.5).float()

#  Visualize results
img_np = img.squeeze(0).permute(1, 2, 0).cpu().numpy()
pred_np = pred_mask.squeeze(0).squeeze(0).cpu().numpy()

plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
plt.title("Input Image")
plt.imshow(img_np)

plt.subplot(1, 2, 2)
plt.title("Predicted Road Mask")
plt.imshow(pred_np, cmap='gray')
plt.show()
