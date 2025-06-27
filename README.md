# Megha-Netra
# AI for Tropical Cloud Cluster Detection 🌩️🛰️

An **AI/ML-based algorithm** to identify tropical cloud clusters using **half-hourly geostationary satellite data** (e.g., INSAT-3D, GOES-16, Himawari-8). Designed for weather forecasting, cyclone tracking, and climate research.

---

## 📌 Key Features
- **Input**: Multispectral satellite imagery (VIS, IR, WV) at **30-min intervals**.
- **Output**: Pixel-wise cloud cluster masks (binary or probabilistic).
- **Models**: U-Net, ConvLSTM, or Vision Transformers for spatiotemporal analysis.
- **Datasets**: Supports INSAT-3D, GOES-16, Himawari-8, and other open-source satellite data.

---

## 🌐 Open-Source Datasets
| Satellite  | Agency | Resolution | Frequency | Data Link |
|------------|--------|------------|-----------|-----------|
| **GOES-16** | NOAA | 2km (IR), 0.5km (VIS) | 5-min | [NOAA CLASS](https://www.avl.class.noaa.gov/) |
| **Himawari-8** | JAXA | 2km (IR), 0.5km (VIS) | 10-min | [JAXA P-Tree](https://www.eorc.jaxa.jp/ptree/) |
| **Meteosat-11** | EUMETSAT | 3km (IR) | 15-min | [EUMETSAT](https://data.eumetsat.int/) |
| **INSAT-3D** | ISRO | 4km (IR) | 30-min | [MOSDAC](https://mosdac.gov.in/) |
| **ERA5** (Reanalysis) | ECMWF | 31km | Hourly | [Climate Data Store](https://cds.climate.copernicus.eu/) |

---

## 🛠️ Installation
```bash
git clone https://github.com/your-repo/tropical-cloud-ai.git
cd tropical-cloud-ai
pip install -r requirements.txt  # TensorFlow/PyTorch, xarray, SatPy