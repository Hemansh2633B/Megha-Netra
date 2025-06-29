# megha_netra_advanced.py
# Script to download meteorological datasets (ERA5, MODIS, GOES-16, GPM) for June 2020–June 2025
# Designed for portability and sharing on GitHub
# Requires Python 3.8–3.10 and dependencies listed in requirements.txt

import os
import subprocess
import sys
import logging
import json
from datetime import datetime, timedelta
import hashlib
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup
from tqdm import tqdm
import numpy as np
from tenacity import retry, stop_after_attempt, wait_exponential
import re
import psutil

# Step 1: System Configuration
# Purpose: Install dependencies and set up workspace
print("🛠️ Configuring system...")

# Uninstall conflicting packages
subprocess.run(
    "pip uninstall -y xarray netCDF4 cdsapi boto3 tqdm tenacity beautifulsoup4 rich ipywidgets scikit-learn tensorflow numpy scipy ipython pandas requests ml_dtypes tensorstore thinc jax google-genai dask importlib-metadata --quiet",
    shell=True
)

# Install required packages with pinned versions
subprocess.run(
    "pip install xarray==2024.6.0 netCDF4==1.7.1 cdsapi==0.6.1 boto3 tqdm tenacity==8.2.3 beautifulsoup4 rich ipywidgets scikit-learn numpy==1.26.4 scipy==1.14.1 ipython==7.34.0 pandas==2.0.3 requests==2.32.3 ml_dtypes==0.5.0 joblib==1.4.2 --force-reinstall --quiet",
    shell=True
)

# Import dependencies
try:
    import tensorflow as tf
    from tensorflow.keras import mixed_precision
    import xarray as xr
    import cdsapi
    import boto3
    from botocore.config import Config
    from botocore import UNSIGNED
    import joblib
    from sklearn.tree import DecisionTreeRegressor
    import ipywidgets as widgets
    from IPython.display import display
    try:
        from rich.console import Console
        console = Console()
    except ImportError:
        console = None
except ImportError as e:
    print(f"Failed to import dependencies: {e}")
    print("Please ensure all dependencies are installed (see requirements.txt) and restart the script.")
    sys.exit(1)

# Verify package versions
import pkg_resources
required_packages = {
    'xarray': '2024.6.0',
    'netCDF4': '1.7.1',
    'numpy': '1.26.4',
    'scipy': '1.14.1',
    'ipython': '7.34.0',
    'pandas': '2.0.3',
    'requests': '2.32.3',
    'ml_dtypes': '0.5.0',
    'tenacity': '8.2.3',
    'joblib': '1.4.2',
    'tensorflow': None  # Accept default TensorFlow version
}
for pkg, expected_version in required_packages.items():
    try:
        installed_version = pkg_resources.get_distribution(pkg).version
        if expected_version and installed_version != expected_version:
            print(f"Warning: {pkg} version {installed_version} installed, expected {expected_version}")
        else:
            print(f"✅ {pkg} version {installed_version} installed")
    except pkg_resources.ContextualVersionConflict as e:
        print(f"Error: Version conflict for {pkg}: {e}")
        print(f"Try reinstalling with: pip install {pkg}=={expected_version} --force-reinstall")
        sys.exit(1)
    except pkg_resources.DistributionNotFound:
        print(f"Error: {pkg} not installed")
        sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='./logs/config_log.txt'
)
logger = logging.getLogger(__name__)

# Create workspace
DATA_DIR = './data'
MODEL_DIR = './models'
LOG_DIR = './logs'
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)
logger.info('✅ Workspace directories created')

# Step 2: Authentication Setup
# Purpose: Set up CDS API and Earthdata credentials using environment variables or input
print("🔐 Setting up authentication...")

# Get credentials from environment variables or input
try:
    CDS_API_KEY = os.environ.get('CDS_API_KEY') or input(
        '🔐 CDS API Key (format: <UID>:<APIKEY>, e.g., 12345:abcdef12-3456-7890-abcd-ef1234567890): '
    )
    EARTHDATA_USER = os.environ.get('EARTHDATA_USER') or input('👤 Earthdata Username: ')
    EARTHDATA_PASS = os.environ.get('EARTHDATA_PASS') or input('🔑 Earthdata Password: ')
except Exception as e:
    logger.warning(f'⚠️ Failed to get credentials: {e}')
    raise

# Validate CDS API Key format
def validate_cds_key(key, max_attempts=3):
    attempt = 0
    while attempt < max_attempts:
        if not key:
            logger.error('❌ CDS API Key is empty')
            key = input('🔐 Please enter a valid CDS API Key (format: <UID>:<APIKEY>): ')
            attempt += 1
            continue
        if not re.match(r'^\d+:.+$', key):
            logger.error(f'❌ Invalid CDS API Key format: {key[:5]}...')
            key = input('🔐 Please enter a valid CDS API Key (format: <UID>:<APIKEY>): ')
            attempt += 1
            continue
        uid, apikey = key.split(':', 1)
        if not uid.isdigit() or not apikey:
            logger.error(f'❌ Invalid CDS API Key: UID must be numeric, APIKEY must be non-empty')
            key = input('🔐 Please enter a valid CDS API Key (format: <UID>:<APIKEY>): ')
            attempt += 1
            continue
        return key
    raise ValueError('Invalid CDS API Key format after maximum attempts.')

CDS_API_KEY = validate_cds_key(CDS_API_KEY)

# Set up credentials
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def setup_credentials():
    try:
        # Write Earthdata credentials
        with open(os.path.expanduser('~/.netrc'), 'w') as f:
            f.write(f'machine urs.earthdata.nasa.gov login {EARTHDATA_USER} password {EARTHDATA_PASS}')
        os.chmod(os.path.expanduser('~/.netrc'), 0o600)
        
        # Write CDS API credentials
        cdsapirc_path = os.path.expanduser('~/.cdsapirc')
        with open(cdsapirc_path, 'w') as f:
            f.write('url: https://cds.climate.copernicus.eu/api\n')
            f.write(f'key: {CDS_API_KEY}\n')
        os.chmod(cdsapirc_path, 0o600)
        
        # Verify .cdsapirc file
        with open(cdsapirc_path, 'r') as f:
            content = f.read()
        if f'key: {CDS_API_KEY}' not in content:
            raise ValueError('Failed to write correct CDS API key to .cdsapirc')
        
        # Test CDS API client
        client = cdsapi.Client()
        logger.info('✅ CDS API client initialized successfully')
        logger.info(f'✅ .cdsapirc file written at {cdsapirc_path}')
        return client
    except Exception as e:
        logger.error(f'❌ Credential setup failed: {e}')
        raise

cds_client = setup_credentials()

# Step 3: Advanced Meteorological Data Downloader
# Purpose: Download ERA5, MODIS, GOES-16, and GPM datasets for June 2020–June 2025
print("🌍 Starting data downloader...")

# Configuration and Plugin System
CONFIG_FILE = './config.json'
LOG_FILE = './logs/download_metrics.json'
TRANSACTION_LOG = './logs/transaction_log.json'
CACHE_LOG = './logs/cache_log.json'

DEFAULT_CONFIG = {
    'area': [60, -130, 20, -60],  # North, West, South, East
    'era5_variables': [
        'mean_sea_level_pressure',
        '10m_u_component_of_wind',
        '10m_v_component_of_wind',
        'sea_surface_temperature',
        'total_cloud_cover',
        '2m_temperature'
    ],
    'datasets': {
        'era5': {'url': 'reanalysis-era5-single-levels', 'client': 'cdsapi', 'format': 'netcdf', 'variables': 'era5_variables', 'area': 'area'},
        'modis_snow': {'url': 'https://e4ftl01.cr.usgs.gov/MOLT/MOD10A1.061/{year}.{month:02d}.01/', 'format': 'hdf', 'variable': 'NDSI_Snow_Cover'},
        'goes16': {'url': 's3://noaa-goes16/ABI-L1b-RadF/{year}/{day_of_year}/00/', 'format': 'netcdf', 'variable': 'Rad'},
        'gpm': {'url': 'https://jsimpson.pps.eosdis.nasa.gov/imerg/gis/early/{year}/{month:02d}/', 'format': 'hdf5', 'variable': 'precipitationCal'}
    }
}

def save_config(config):
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
        logger.info(f'✅ Config saved to {CONFIG_FILE}')
    except Exception as e:
        logger.error(f'❌ Failed to save config: {e}')
        raise

def load_config():
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG
    except Exception as e:
        logger.error(f'❌ Failed to load config: {e}')
        raise

# Microservice Components
class Downloader:
    def __init__(self, session=None):
        self.session = session or requests.Session()
        retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
        self.session.mount('https://', HTTPAdapter(max_retries=retries))
        logger.info('✅ Downloader initialized with retry policy')

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def download(self, url, output_file, auth=None, chunk_size=8192, num_threads=4):
        try:
            temp_file = output_file + '.tmp'
            response = self.session.head(url, auth=auth)
            file_size = int(response.headers.get('content-length', 0))
            if not file_size:
                logger.warning(f'⚠️ No content-length for {url}')
                return False
            chunk_size = max(chunk_size, file_size // num_threads)

            def download_chunk(start, end):
                headers = {'Range': f'bytes={start}-{end}'}
                r = self.session.get(url, headers=headers, stream=True, auth=auth)
                r.raise_for_status()
                return r.content

            ranges = [(i, min(i + chunk_size - 1, file_size - 1)) for i in range(0, file_size, chunk_size)]
            with ThreadPoolExecutor(max_workers=num_threads) as executor:
                chunks = list(executor.map(lambda r: download_chunk(r[0], r[1]), ranges))
            with open(temp_file, 'wb') as f:
                for chunk in chunks:
                    f.write(chunk)
            os.rename(temp_file, output_file)
            logger.info(f'✅ Downloaded {url} to {output_file}')
            return True
        except Exception as e:
            logger.error(f'❌ Download failed for {url}: {e}')
            return False

class Validator:
    def validate_file(self, file_path, expected_vars=None):
        try:
            if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
                logger.warning(f'⚠️ Invalid file: {file_path} (missing or empty)')
                return False
            engine = 'h5netcdf' if file_path.endswith(('.hdf', '.hdf5')) else 'netcdf4'
            with xr.open_dataset(file_path, engine=engine) as ds:
                if expected_vars and not all(var in ds.variables for var in expected_vars):
                    logger.warning(f'⚠️ Missing variables in {file_path}: expected {expected_vars}')
                    return False
                for var in ds.variables:
                    if 'temperature' in var.lower():
                        data = ds[var].values
                        if np.any(data < 200) or np.any(data > 350):
                            logger.warning(f'⚠️ Out-of-range values in {var} for {file_path}')
                            return False
            logger.info(f'✅ Validated {file_path}')
            return True
        except Exception as e:
            logger.warning(f'⚠️ Validation failed for {file_path}: {e}')
            return False

    def compute_sha256(self, file_path):
        try:
            hash_sha256 = hashlib.sha256()
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b''):
                    hash_sha256.update(chunk)
            return hash_sha256.hexdigest()
        except Exception as e:
            logger.error(f'❌ Failed to compute SHA-256 for {file_path}: {e}')
            return None

class Notifier:
    def notify(self, message, level='INFO'):
        if console:
            color = 'green' if level == 'INFO' else 'red' if level == 'ERROR' else 'yellow'
            console.print(f'[{color}]{message}[/]')
        else:
            print(f'{level}: {message}')
            getattr(logger, level.lower())(message)

class Storage:
    def save_to_s3(self, file_path, bucket, key, aws_access_key=None, aws_secret_key=None):
        try:
            s3 = boto3.client('s3', aws_access_key_id=aws_access_key, aws_secret_access_key=aws_secret_key)
            s3.upload_file(file_path, bucket, key)
            logger.info(f'✅ Uploaded {file_path} to s3://{bucket}/{key}')
        except Exception as e:
            logger.error(f'❌ S3 upload failed for {file_path}: {e}')

    def create_data_package(self, files, output_zip):
        try:
            with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
                for file in files:
                    zf.write(os.path.join(DATA_DIR, file), file)
            logger.info(f'✅ Created data package: {output_zip}')
        except Exception as e:
            logger.error(f'❌ Failed to create data package {output_zip}: {e}')

# Pipeline Architecture
class Pipeline:
    def __init__(self, downloader, validator, notifier, storage):
        self.downloader = downloader
        self.validator = validator
        self.notifier = notifier
        self.storage = storage
        self.transaction_log = []
        self.download_metrics = {'success': 0, 'failures': 0, 'total_time': 0, 'total_size': 0, 'response_times': []}
        self.cache = {}
        logger.info('✅ Pipeline initialized')

    def log_transaction(self, action, details):
        try:
            self.transaction_log.append({'action': action, 'details': details, 'timestamp': datetime.now().isoformat()})
            with open(TRANSACTION_LOG, 'w') as f:
                json.dump(self.transaction_log, f, indent=2)
        except Exception as e:
            logger.error(f'❌ Failed to log transaction: {e}')

    def process(self, dataset, date, config, dry_run=False, aws_bucket=None):
        try:
            if dataset not in config['datasets']:
                self.notifier.notify(f'❌ Invalid dataset: {dataset}', 'ERROR')
                return False
            dataset_config = config['datasets'][dataset]
            output_file = f'{DATA_DIR}/{dataset}_{date.year}{date.month:02d}.{dataset_config["format"]}'
            file_hash = self.validator.compute_sha256(output_file) if os.path.exists(output_file) else None

            if file_hash and file_hash in self.cache:
                self.notifier.notify(f'⏭️ {dataset} {date.year}-{date.month:02d} cached', 'INFO')
                return True

            self.log_transaction('start_download', {'dataset': dataset, 'date': f'{date.year}-{date.month:02d}'})
            start_time = time.time()

            if dataset == 'era5':
                success = self.download_era5(date, config, dry_run)
            elif dataset == 'modis_snow':
                success = self.download_modis_snow(date, dry_run)
            elif dataset == 'goes16':
                success = self.download_goes16(date, dry_run)
            else:
                success = self.download_gpm(date, dry_run)

            elapsed = time.time() - start_time
            self.download_metrics['response_times'].append(elapsed)

            if success and not dry_run:
                expected_vars = dataset_config.get('variables', [dataset_config.get('variable')])
                if self.validator.validate_file(output_file, expected_vars):
                    file_hash = self.validator.compute_sha256(output_file)
                    if file_hash:
                        self.cache[file_hash] = {'file': output_file, 'access_count': self.cache.get(file_hash, {'access_count': 0})['access_count'] + 1}
                        self.download_metrics['success'] += 1
                        self.download_metrics['total_time'] += elapsed
                        self.download_metrics['total_size'] += os.path.getsize(output_file) / 1024**2
                        self.log_transaction('complete_download', {'dataset': dataset, 'file': output_file, 'hash': file_hash})
                        if aws_bucket:
                            self.storage.save_to_s3(output_file, aws_bucket, f'data/{os.path.basename(output_file)}')
                        return True
                    else:
                        self.log_transaction('rollback_download', {'dataset': dataset, 'reason': 'hash computation failed'})
                else:
                    if os.path.exists(output_file):
                        os.remove(output_file)
                    self.log_transaction('rollback_download', {'dataset': dataset, 'reason': 'validation failed'})
            self.download_metrics['failures'] += 1
            self.log_transaction('fail_download', {'dataset': dataset, 'reason': 'download or validation failed'})
            return False
        except Exception as e:
            self.notifier.notify(f'❌ Pipeline error for {dataset}: {e}', 'ERROR')
            self.log_transaction('fail_download', {'dataset': dataset, 'reason': str(e)})
            return False

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def download_era5(self, date, config, dry_run):
        try:
            output_file = f'{DATA_DIR}/era5_{date.year}{date.month:02d}.nc'
            if dry_run:
                self.notifier.notify(f'[DRY RUN] Would download ERA5 {date.year}-{date.month:02d}', 'INFO')
                return True
            cds_client.retrieve(
                config['datasets']['era5']['url'],
                {
                    'product_type': 'reanalysis',
                    'variable': config[config['datasets']['era5']['variables']],
                    'year': str(date.year),
                    'month': [f'{date.month:02d}'],
                    'day': ['01'],
                    'time': ['00:00'],
                    'format': 'netcdf',
                    'area': config['area'],
                },
                output_file
            )
            with xr.open_dataset(output_file, engine='netcdf4') as ds:
                ds.attrs['download_time'] = datetime.now().isoformat()
                ds.attrs['source'] = 'ERA5 via CDS API'
                ds.to_netcdf(output_file, engine='netcdf4')
            logger.info(f'✅ ERA5 downloaded: {output_file}')
            return True
        except Exception as e:
            logger.error(f'❌ ERA5 download failed for {date.year}-{date.month:02d}: {e}')
            return False

    def download_modis_snow(self, date, dry_run):
        try:
            url = config['datasets']['modis_snow']['url'].format(year=date.year, month=date.month)
            output_file = f'{DATA_DIR}/modis_snow_{date.year}{date.month:02d}.hdf'
            if dry_run:
                self.notifier.notify(f'[DRY RUN] Would download MODIS Snow {date.year}-{date.month:02d}', 'INFO')
                return True
            r = self.downloader.session.get(url, auth=(EARTHDATA_USER, EARTHDATA_PASS))
            r.raise_for_status()
            soup = BeautifulSoup(r.text, 'html.parser')
            links = [a['href'] for a in soup.find_all('a', href=True) if a['href'].endswith('.hdf')]
            if not links:
                logger.warning(f'⚠️ No HDF files found at {url}')
                return False
            file_url = url + links[0]
            success = self.downloader.download(file_url, output_file, auth=(EARTHDATA_USER, EARTHDATA_PASS))
            if success:
                with xr.open_dataset(output_file, engine='h5netcdf') as ds:
                    ds.attrs['download_time'] = datetime.now().isoformat()
                    ds.attrs['source'] = 'MODIS via Earthdata'
                    ds.to_netcdf(output_file, engine='h5netcdf')
                logger.info(f'✅ MODIS downloaded: {output_file}')
            return success
        except Exception as e:
            logger.error(f'❌ MODIS download failed for {date.year}-{date.month:02d}: {e}')
            return False

    def download_goes16(self, date, dry_run):
        try:
            output_file = f'{DATA_DIR}/goes16_{date.year}{date.month:02d}.nc'
            if dry_run:
                self.notifier.notify(f'[DRY RUN] Would download GOES-16 {date.year}-{date.month:02d}', 'INFO')
                return True
            s3 = boto3.client('s3', config=Config(signature_version=UNSIGNED))
            bucket = 'noaa-goes16'
            prefix = config['datasets']['goes16']['url'].format(year=date.year, day_of_year=date.strftime('%j'))
            response = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
            if 'Contents' not in response:
                logger.warning(f'⚠️ No objects found in S3 bucket {bucket}/{prefix}')
                return False
            key = [obj['Key'] for obj in response['Contents'] if 'C13' in obj['Key']]
            if not key:
                logger.warning(f'⚠️ No C13 files found in {bucket}/{prefix}')
                return False
            s3.download_file(bucket, key[0], output_file)
            with xr.open_dataset(output_file, engine='netcdf4') as ds:
                ds.attrs['download_time'] = datetime.now().isoformat()
                ds.attrs['source'] = 'GOES-16 via NOAA S3'
                ds.to_netcdf(output_file, engine='netcdf4')
            logger.info(f'✅ GOES-16 downloaded: {output_file}')
            return True
        except Exception as e:
            logger.error(f'❌ GOES-16 download failed for {date.year}-{date.month:02d}: {e}')
            return False

    def download_gpm(self, date, dry_run):
        try:
            url = config['datasets']['gpm']['url'].format(year=date.year, month=date.month)
            output_file = f'{DATA_DIR}/gpm_{date.year}{date.month:02d}.hdf5'
            if dry_run:
                self.notifier.notify(f'[DRY RUN] Would download GPM {date.year}-{date.month:02d}', 'INFO')
                return True
            r = self.downloader.session.get(url, auth=(EARTHDATA_USER, EARTHDATA_PASS))
            r.raise_for_status()
            soup = BeautifulSoup(r.text, 'html.parser')
            links = [a['href'] for a in soup.find_all('a', href=True) if a['href'].endswith('.HDF5')]
            if not links:
                logger.warning(f'⚠️ No HDF5 files found at {url}')
                return False
            file_url = url + links[0]
            success = self.downloader.download(file_url, output_file, auth=(EARTHDATA_USER, EARTHDATA_PASS))
            if success:
                with xr.open_dataset(output_file, engine='h5netcdf') as ds:
                    ds.attrs['download_time'] = datetime.now().isoformat()
                    ds.attrs['source'] = 'GPM IMERG via Earthdata'
                    ds.to_netcdf(output_file, engine='h5netcdf')
                logger.info(f'✅ GPM downloaded: {output_file}')
            return success
        except Exception as e:
            logger.error(f'❌ GPM download failed for {date.year}-{date.month:02d}: {e}')
            return False

# Adaptive Parallelism and AI Optimization
class Optimizer:
    def __init__(self):
        self.model = DecisionTreeRegressor()
        self.historical_data = []
        logger.info('✅ Optimizer initialized')

    def update_metrics(self, response_time, file_size, success):
        try:
            cpu_load = psutil.cpu_percent()
            mem_load = psutil.virtual_memory().percent
            self.historical_data.append([response_time, file_size, cpu_load, mem_load, success])
            if len(self.historical_data) > 10:
                X = np.array(self.historical_data)[:, :-1]
                y = np.array(self.historical_data)[:, -1]
                self.model.fit(X, y)
        except Exception as e:
            logger.error(f'❌ Optimizer update failed: {e}')

    def predict_workers(self, response_times):
        try:
            if not response_times:
                return 3
            avg_response = np.mean(response_times)
            cpu_load = psutil.cpu_percent()
            mem_load = psutil.virtual_memory().percent
            if len(self.historical_data) > 10:
                pred = self.model.predict([[avg_response, 100, cpu_load, mem_load]])[0]
                return max(1, min(5, int(pred * 3)))
            return 3 if avg_response < 5 else 1
        except Exception as e:
            logger.error(f'❌ Worker prediction failed: {e}')
            return 3

# Natural Language Query Parser
def parse_natural_query(query):
    try:
        query = query.lower()
        config = load_config()
        datasets = config['datasets'].keys()
        regions = {'india': [37, 68, 6, 97], 'north america': [60, -130, 20, -60]}
        seasons = {'summer': ['06', '07', '08'], 'winter': ['12', '01', '02']}

        dataset = next((d for d in datasets if d in query), 'gpm')
        year_match = re.search(r'\b(20\d{2})\b', query)
        year = year_match.group(1) if year_match else str(datetime.now().year)
        month = next((m for s, months in seasons.items() for m in months if s in query), '01')
        region = next((r for r in regions if r in query), 'north america')
        config['area'] = regions[region]
        logger.info(f'✅ Parsed query: dataset={dataset}, year={year}, month={month}, region={region}')
        return {'dataset': dataset, 'year': year, 'month': month, 'config': config}
    except Exception as e:
        logger.error(f'❌ Query parsing failed: {e}')
        raise

# Main Pipeline Execution
def download_all(query=None, dry_run=False, aws_bucket=None):
    try:
        config = load_config()
        if query:
            parsed = parse_natural_query(query)
            config = parsed['config']
            dates = [datetime(int(parsed['year']), int(parsed['month']), 1)]
            datasets = [parsed['dataset']]
        else:
            # Generate dates for the last 5 years (June 2020 to June 2025)
            end_date = datetime.now().replace(day=1)
            start_date = end_date.replace(year=end_date.year - 5)
            dates = []
            current_date = start_date
            while current_date <= end_date:
                dates.append(current_date)
                next_month = current_date.month + 1 if current_date.month < 12 else 1
                next_year = current_date.year + 1 if next_month == 1 else current_date.year
                current_date = current_date.replace(year=next_year, month=next_month)
            datasets = config['datasets'].keys()

        downloader = Downloader()
        validator = Validator()
        notifier = Notifier()
        storage = Storage()
        pipeline = Pipeline(downloader, validator, notifier, storage)
        optimizer = Optimizer()

        total = len(dates) * len(datasets)
        with tqdm(total=total, desc='Processing 5 years of data', colour='green' if console else None) as pbar:
            for date in dates:
                max_workers = optimizer.predict_workers(pipeline.download_metrics['response_times'])
                with ThreadPoolExecutor(max_workers=max_workers) as executor:
                    futures = [executor.submit(pipeline.process, dataset, date, config, dry_run, aws_bucket) for dataset in datasets]
                    for f in as_completed(futures):
                        pbar.update(1)

        # Anomaly Detection
        sizes = [pipeline.download_metrics['total_size'] / pipeline.download_metrics['success'] if pipeline.download_metrics['success'] > 0 else 0]
        if sizes and pipeline.download_metrics['success'] > 5:
            mean_size = np.mean(sizes)
            std_size = np.std(sizes)
            if abs(pipeline.download_metrics['total_size'] / pipeline.download_metrics['success'] - mean_size) > 2 * std_size:
                notifier.notify('⚠️ Anomalous download size detected', 'WARNING')

        # Save Metrics (Prometheus-compatible)
        metrics = {
            'download_success_total': pipeline.download_metrics['success'],
            'download_failures_total': pipeline.download_metrics['failures'],
            'download_size_mb': pipeline.download_metrics['total_size'],
            'download_time_seconds': pipeline.download_metrics['total_time'],
            'data_freshness': max(0, (datetime.now() - max(dates)).total_seconds() / 86400)
        }
        with open(LOG_FILE, 'w') as f:
            json.dump(metrics, f, indent=2)

        # Create Data Package
        files = [f for f in os.listdir(DATA_DIR) if f.endswith(('.nc', '.hdf', '.hdf5'))]
        # Parallel validation of files using joblib
        validation_results = joblib.Parallel(n_jobs=-1)(
            joblib.delayed(validator.validate_file)(os.path.join(DATA_DIR, f), config['datasets'][f.split('_')[0]].get('variables', [config['datasets'][f.split('_')[0]].get('variable')]))
            for f in files
        )
        valid_files = [f for f, valid in zip(files, validation_results) if valid]
        storage.create_data_package(valid_files, f'{DATA_DIR}/data_package.zip')

        # Cache Management
        with open(CACHE_LOG, 'w') as f:
            json.dump(pipeline.cache, f, indent=2)

        success_rate = pipeline.download_metrics['success'] / total if total > 0 else 0
        notifier.notify(f'🎉 Completed: {pipeline.download_metrics["success"]}/{total} files ({success_rate:.1%} success)', 'INFO' if success_rate >= 0.8 else 'ERROR')
    except Exception as e:
        notifier.notify(f'❌ Pipeline execution failed: {e}', 'ERROR')
        raise

# Optional Jupyter Widgets
try:
    dataset_dropdown = widgets.Dropdown(options=['era5', 'modis_snow', 'goes16', 'gpm'], description='Dataset:')
    year_input = widgets.IntText(value=datetime.now().year, description='Year:')
    month_input = widgets.Dropdown(options=[f'{i:02d}' for i in range(1, 13)], description='Month:')
    dry_run_toggle = widgets.Checkbox(value=False, description='Dry Run')
    run_button = widgets.Button(description='Run Pipeline')
    output = widgets.Output()

    def on_run_button_clicked(b):
        with output:
            output.clear_output()
            download_all(dry_run=dry_run_toggle.value)

    run_button.on_click(on_run_button_clicked)
    display(widgets.VBox([dataset_dropdown, year_input, month_input, dry_run_toggle, run_button, output]))
except Exception as e:
    logger.info(f'ℹ️ Jupyter widgets skipped (non-Jupyter environment or ipywidgets not installed): {e}')

# Example Natural Language Query (for testing single month)
if __name__ == '__main__':
    try:
        download_all(query='Get summer 2023 precipitation data for India')
    except Exception as e:
        logger.error(f'❌ Example query failed: {e}')