from datasets import concatenate_datasets

merged_dataset = concatenate_datasets([
    climate_translated,
    scifact_formatted,
    nasa_dataset
])