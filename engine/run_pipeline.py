import json
from pathlib import Path
from dexta.pipeline import process_jsonl

INPUT = "data/sample_sources.jsonl"
OUTPUT = "data/qualified_prospects.jsonl"

results = process_jsonl(INPUT)
Path(OUTPUT).parent.mkdir(parents=True, exist_ok=True)
with open(OUTPUT, "w", encoding="utf-8") as f:
    for row in results:
        if row["is_buyer"]:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
print(f"processed={len(results)} qualified={sum(r['is_buyer'] for r in results)} contactable={sum(r['contactable'] for r in results)}")
