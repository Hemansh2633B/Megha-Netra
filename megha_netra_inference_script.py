from transformers import AutoTokenizer, AutoModelForCausalLM
import transformers
import torch

# Renamed variable to reflect the intended model name or path.
# Initially, this points to the base model "tiiuae/falcon-40b-instruct".
# After fine-tuning your own 'Megha Netra' model, you would change this
# string to the path where your fine-tuned model is saved.
megha_netra_model_path = "tiiuae/falcon-40b-instruct"

tokenizer = AutoTokenizer.from_pretrained(
    megha_netra_model_path,
    trust_remote_code=True # Important for Falcon models
)
pipeline = transformers.pipeline(
    "text-generation",
    model=megha_netra_model_path, # Use the renamed variable
    tokenizer=tokenizer,
    torch_dtype=torch.bfloat16,
    trust_remote_code=True, # Important for Falcon models
    device_map="auto",
)

# Example usage:
# This prompt is a placeholder. For effective weather detection, the model
# loaded by `megha_netra_model_path` needs to be fine-tuned on specific
# weather-related textual data (ERA5, MODIS, GOES-16 processed into text).
prompt = "Instruction: Analyze the following weather data summary and provide a concise weather forecast. Data: Temperature 15°C, Wind: 10km/h NW, Humidity: 75%, Pressure: 1012hPa, Sky: Overcast with intermittent light rain. Forecast:"
sequences = pipeline(
    prompt,
    max_length=200,
    do_sample=True,
    top_k=10,
    num_return_sequences=1,
    eos_token_id=tokenizer.eos_token_id,
)

for seq in sequences:
    print(f"Result: {seq['generated_text']}")

print(f"\nNote: This script is currently using the base model: {megha_netra_model_path}")
print("To use your fine-tuned 'Megha Netra' model, update the 'megha_netra_model_path' variable in this script to point to its saved location after fine-tuning.")
