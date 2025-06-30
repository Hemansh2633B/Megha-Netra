from datasets import load_dataset
from googletrans import Translator

climate_ds = load_dataset("climate_fever", split="test[:100]")
translator = Translator()

def translate_and_tokenize(example):
    translated = translator.translate(example["claim"], dest="hi").text
    return {"text": f"दावा: {translated}\nनिष्कर्ष:"}

climate_translated = climate_ds.map(translate_and_tokenize)