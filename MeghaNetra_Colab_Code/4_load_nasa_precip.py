import xarray as xr
from datasets import Dataset

precip_url = "https://psl.noaa.gov/thredds/dodsC/Datasets/cpc_us_precip/precip.V1.0.mon.mean.nc"
nasa_ds = xr.open_dataset(precip_url)

nasa_samples = [
    {"text": f"Precipitation at t={i} is {val.values.mean():.2f} mm"}
    for i, val in enumerate(nasa_ds["precip"][:10])
]

nasa_dataset = Dataset.from_list(nasa_samples)