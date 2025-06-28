# Megha Netra Deep Learning Model

This project aims to create a deep learning model, Megha Netra, for meteorological applications using various satellite datasets.

## Project Structure

- `data/`: Stores downloaded and processed datasets.
    - `data/raw/`: Raw data downloaded from various sources.
    - `data/processed/`: Data processed and ready for model training.
- `src/`: Contains the source code for the model, data loading, and training.
    - `src/data_handling/`: Scripts for downloading and preprocessing data.
    - `src/model/`: Model architecture definitions.
    - `src/utils/`: Utility functions.
- `notebooks/`: Jupyter notebooks for experimentation, visualization, and model evaluation.
- `tests/`: Unit tests for the project.
- `configs/`: Configuration files for training, data sources, etc.

## Datasets

The model will integrate data from the following sources:

1.  **NASA/NOAA GOES-16/17:**
    *   **Source:** NOAA CLASS (Comprehensive Large Array-data Stewardship System)
    *   **Data:** 5-min geostationary data for the Americas.
    *   **Access:** Requires registration. Data can be ordered via the CLASS web interface or potentially through scripting with their APIs if available.
    *   **Integration Plan:**
        *   Investigate direct download APIs (e.g., FTP, HTTP) or Python libraries for accessing CLASS.
        *   Develop scripts in `src/data_handling/download_goes.py` to fetch data.
        *   Preprocessing will involve selecting relevant channels (e.g., infrared, visible), georeferencing, and converting to a standard format like NetCDF or HDF5.
2.  **NASA MODIS/VIIRS:**
    *   **Source:** NASA Earthdata Search / LAADS DAAC
    *   **Data:** Daily global data, 250m–1km resolution.
    *   **Access:** Requires Earthdata login. Data can be accessed via NASA Earthdata Search GUI or programmatically using `earthaccess` library or direct HTTPS/CMR API calls.
    *   **Integration Plan:**
        *   Use `earthaccess` Python library or develop scripts in `src/data_handling/download_modis_viirs.py` for data acquisition.
        *   Focus on relevant products (e.g., Cloud Mask, Aerosol Optical Depth, Land Surface Temperature).
        *   Preprocessing will involve mosaicking, reprojection, and resampling if needed.
3.  **NASA GPM IMERG:**
    *   **Source:** NASA GPM (Global Precipitation Measurement)
    *   **Data:** Half-hourly rainfall data for validation.
    *   **Access:** Available through NASA PPS (Precipitation Processing System) Data Access portal (registration required) or NASA Earthdata.
    *   **Integration Plan:**
        *   Scripts in `src/data_handling/download_gpm_imerg.py` to fetch data (likely HDF5 or NetCDF).
        *   Preprocessing: Ensure temporal and spatial alignment with other datasets for validation.
4.  **ESA/EUMETSAT Meteosat-11:**
    *   **Source:** EUMETSAT Data Centre or CODA (Copernicus Open Data Access)
    *   **Data:** 15-min Indian Ocean coverage.
    *   **Access:** Requires registration with EUMETSAT. Data access mechanisms include EUMETCast (satellite broadcast), Data Centre Ordering, or APIs.
    *   **Integration Plan:**
        *   Investigate EUMETSAT's Python tools (e.g., `eumdac`) or direct API access.
        *   Develop scripts in `src/data_handling/download_meteosat.py`.
        *   Preprocessing: Similar to GOES, focusing on relevant channels and format conversion.
5.  **ESA Sentinel-3:**
    *   **Source:** Copernicus Open Access Hub (soon to be Copernicus Data Space Ecosystem)
    *   **Data:** Cloud height/temperature (e.g., SLSTR Level 2 products).
    *   **Access:** Requires registration. `sentinelsat` Python library is commonly used.
    *   **Integration Plan:**
        *   Use `sentinelsat` in `src/data_handling/download_sentinel3.py`.
        *   Focus on SLSTR Level 2 products related to cloud properties.
        *   Preprocessing: Georeferencing, extraction of relevant variables.
6.  **JAXA Himawari-8/9:**
    *   **Source:** JAXA P-Tree system or JAXA Himawari Monitor (less for bulk download)
    *   **Data:** 10-min Asia-Pacific imagery.
    *   **Access:** Requires registration for P-Tree. Data is often in NetCDF or HDF5 format.
    *   **Integration Plan:**
        *   Investigate programmatic access to JAXA P-Tree.
        *   Develop scripts in `src/data_handling/download_himawari.py`.
        *   Preprocessing: Channel selection, georeferencing.
7.  **ECMWF ERA5:**
    *   **Source:** ECMWF Climate Data Store (CDS)
    *   **Data:** Hourly cloud reanalysis data.
    *   **Access:** Requires CDS account and API key. `cdsapi` Python library is the standard access method.
    *   **Integration Plan:**
        *   Use `cdsapi` in `src/data_handling/download_era5.py` to retrieve variables like cloud cover, cloud base height, cloud top temperature.
        *   Preprocessing: Convert GRIB files to NetCDF if necessary, align spatially and temporally.
8.  **KMA GK-2A:**
    *   **Source:** KMA (Korea Meteorological Administration) Open Data Portal or NMSC (National Meteorological Satellite Center)
    *   **Data:** 10-min East Asia imagery (AMI sensor).
    *   **Access:** Requires registration. Investigate API availability.
    *   **Integration Plan:**
        *   Explore KMA's data access methods for programmatic downloads.
        *   Develop scripts in `src/data_handling/download_gk2a.py`.
        *   Preprocessing: Similar to other geostationary satellites (GOES, Himawari).

## General Data Handling Strategy

-   **Storage:** Raw data will be stored in `data/raw/<dataset_name>/`. Processed data suitable for training will be in `data/processed/`.
-   **Format:** Aim to convert all data into a common format (e.g., NetCDF4 or HDF5) with consistent metadata.
-   **Credentials:** Secure handling of API keys and login credentials (e.g., using environment variables or a config file not committed to the repository).
-   **Configuration:** Data source URLs, API endpoints, and download parameters will be managed in `configs/data_sources.yml` (or similar).

## Setup

(Instructions to be added)

## Training

(Instructions on how to train the model will be added here)
