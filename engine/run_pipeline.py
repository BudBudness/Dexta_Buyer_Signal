from pathlib import Path

from dexta.pipeline import process_jsonl, write_qualified_prospects

INPUT = "data/discovered_sources.jsonl"
OUTPUT = "data/qualified_prospects.jsonl"

results = process_jsonl(INPUT)
write_qualified_prospects(results, OUTPUT)
print(
    f"processed={len(results)} "
    f"qualified={sum(r['is_buyer'] for r in results)} "
    f"contactable={sum(r['contactable'] for r in results)}"
)
