import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from tqdm import tqdm

from unet_model import UNet
from utils import get_transforms, visualize_sample  #  Make sure utils.py has these

#  Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

#  Paths to your data
images_dir = "/content/drive/MyDrive/road-ai-south/processed/images"
masks_dir = "/content/drive/MyDrive/road-ai-south/processed/masks"

#  Dataset class (with filename filter)
class RoadDataset(Dataset):
    def __init__(self, images_dir, masks_dir, transform=None):
        self.images_dir = images_dir
        self.masks_dir = masks_dir
        self.image_files = sorted([f for f in os.listdir(images_dir) if f.endswith('.png')])
        self.mask_files = sorted([f for f in os.listdir(masks_dir) if f.endswith('.png')])
        self.transform = transform

        #  Keep only matching filenames
        self.image_files = [f for f in self.image_files if f in self.mask_files]
        self.mask_files = self.image_files

    def __len__(self):
        return len(self.image_files)

    def __getitem__(self, idx):
        img_path = os.path.join(self.images_dir, self.image_files[idx])
        mask_path = os.path.join(self.masks_dir, self.mask_files[idx])

        img = torchvision.io.read_image(img_path).float() / 255.0
        mask = torchvision.io.read_image(mask_path).float() / 255.0

        if self.transform:
            img = self.transform(img)
            mask = self.transform(mask)

        return img, mask

#  Model init
model = UNet(in_channels=3, out_channels=1).to(device)

#  Dataset + Loader
transform = get_transforms()
dataset = RoadDataset(images_dir, masks_dir, transform=transform)
train_loader = DataLoader(dataset, batch_size=4, shuffle=True)

#  Loss & Optimizer
criterion = nn.BCEWithLogitsLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-4)

#  Training Loop
num_epochs = 25
best_loss = float("inf")

for epoch in range(num_epochs):
    model.train()
    total_loss = 0.0

    for img, mask in tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}"):
        img, mask = img.to(device), mask.to(device)

        pred = model(img)
        loss = criterion(pred, mask)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    avg_loss = total_loss / len(train_loader)
    print(f"Epoch {epoch+1}: Loss = {avg_loss:.4f}")

    # Save best model
    if avg_loss < best_loss:
        best_loss = avg_loss
        torch.save(model.state_dict(), "/content/drive/MyDrive/road-ai-south/best_model.pth")
        print("Best model saved!")

#  Visualize
model.eval()
with torch.no_grad():
    img, mask = dataset[0]
    pred = model(img.unsqueeze(0).to(device))
    visualize_sample(img, mask, pred.squeeze(0).cpu())
