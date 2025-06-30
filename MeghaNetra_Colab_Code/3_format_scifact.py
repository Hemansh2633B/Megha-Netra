scifact_ds = load_dataset("scifact", split="test[:100]")

def scifact_tokenize(example):
    return {
        "text": f"Claim: {example['claim']}\nEvidence: {example['evidence']}\nConclusion:"
    }

scifact_formatted = scifact_ds.map(scifact_tokenize)