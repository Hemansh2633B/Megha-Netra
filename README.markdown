# Megha Netra Advanced: Meteorological Data Downloader

This script (`megha_netra_advanced.py`) downloads meteorological datasets (ERA5, MODIS, GOES-16, GPM) for June 2020–June 2025, covering 240 files. It uses a modular pipeline with parallel processing (`joblib`), validation, and caching, designed for portability across Python environments.

## Features
- Downloads ERA5 (reanalysis), MODIS (snow cover), GOES-16 (radiance), and GPM (precipitation) datasets.
- Supports natural language queries (e.g., "Get summer 2023 precipitation data for India").
- Validates downloaded files and creates a zipped package (`data_package.zip`).
- Logs metrics and transactions for debugging.
- Optional Jupyter widgets for interactive use.

## Prerequisites
- Python 3.8–3.10
- Internet access
- Valid credentials:
  - [CDS API key](https://cds.climate.copernicus.eu/) (`<UID>:<APIKEY>`)
  - [Earthdata](https://urs.earthdata.nasa.gov/) username and password
- Approximately 20 GB disk space for full dataset (240 files)

## Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/megha-netra-advanced.git
   cd megha-netra-advanced
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Environment Variables** (recommended for security):
   ```bash
   export CDS_API_KEY="your_uid:your_apikey"
   export EARTHDATA_USER="your_username"
   export EARTHDATA_PASS="your_password"
   ```
   Alternatively, run the script and enter credentials when prompted.

4. **Ensure Disk Space**:
   Check available space:
   ```bash
   df -h .
   ```
   If limited, modify the date range in `download_all()` to download fewer files.

## Usage
1. **Run the Script**:
   ```bash
   python megha_netra_advanced.py
   ```
   - Downloads 240 files (June 2020–June 2025) to `./data`.
   - Creates `./data/data_package.zip`.
   - Logs to `./logs` (e.g., `download_metrics.json`, `transaction_log.json`).

2. **Run in Jupyter** (optional):
   - Convert to a notebook:
     ```bash
     jupyter nbconvert --to notebook megha_netra_advanced.py
     jupyter notebook megha_netra_advanced.ipynb
     ```
   - Use the interactive widgets to select dataset, year, month, or dry run.

3. **Single Month Example**:
   Edit the script or run in Python:
   ```python
   download_all(query='Get summer 2023 precipitation data for India')
   ```

4. **AWS S3 Upload** (optional):
   Add AWS credentials and bucket:
   ```python
   download_all(aws_bucket='your-bucket', aws_access_key='your-key', aws_secret_key='your-secret')
   ```

## Outputs
- **Data**: `./data` (e.g., `era5_202006.nc`, `gpm_202006.hdf5`)
- **Zipped Package**: `./data/data_package.zip`
- **Logs**: `./logs` (e.g., `download_metrics.json`, `transaction_log.json`, `cache_log.json`)

## Troubleshooting
1. **Dependency Issues**:
   Check installed versions:
   ```bash
   pip list | grep -E 'xarray|netCDF4|numpy|scipy|ipython|pandas|requests|ml_dtypes|tenacity|joblib'
   ```
   Reinstall if needed:
   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

2. **Authentication Errors**:
   Verify `.cdsapirc`:
   ```bash
   cat ~/.cdsapirc
   ```
   Expected:
   ```plaintext
   url: https://cds.climate.copernicus.eu/api
   key: your_uid:your_apikey
   ```
   Re-run authentication section if invalid.

3. **Disk Space Issues**:
   Reduce date range:
   ```python
   dates = [datetime(2023, m, 1) for m in range(1, 13)]  # Only 2023
   ```

4. **Download Failures**:
   Check logs:
   ```bash
   cat ./logs/transaction_log.json
   ```
   Test a single download:
   ```python
   pipeline = Pipeline(Downloader(), Validator(), Notifier(), Storage())
   pipeline.process('gpm', datetime(2023, 6, 1), load_config(), dry_run=True)
   ```

## Notes
- **Performance**: Downloading 240 files may take hours due to CDS API queueing. Test with a smaller range if needed.
- **Security**: Avoid committing credentials to GitHub. Use environment variables or `.gitignore` for `.cdsapirc` and `.netrc`.
- **Further Steps**: Data fusion, model training, and evaluation can be added. Contact the repository maintainer for extensions.

## License
MIT License (or specify your preferred license).

---
*Generated for GitHub on June 29, 2025*