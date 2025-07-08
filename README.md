# Road Network Segmentation from Satellite Imagery

This project trains a U-Net model to extract roads from Sentinel-2 satellite images and openstreetmap open source (osm files).

## Features
- 165 input-mask training pairs
- U-Net model in PyTorch
- Trained using Google Colab

## Structure
road-network-segmentation/
├── images/ # Input image tiles (e.g., 256x256 .png)
├── masks/ # Corresponding binary road masks
├── train.py # Main training script
├── unet_model.py # U-Net model definition
├── utils.py # Dataset and preprocessing utilities
├── requirements.txt # Python packages
└── README.md


## How to Use

1. Clone the repo
2. Add your images/masks to `images/` and `masks/`
3. Run training:

```bash
pip install -r requirements.txt
python train.py

## Dataset

Sentinel-2 RGB Tiles (downloaded from Google Earth Engine)
Masks created from OpenStreetMap data via QGIS

Status
 Basic training --> curently this is our position 
 Full India coverage
 Inference pipeline
