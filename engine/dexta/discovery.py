from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path
from .models import SourceRecord
from .sources import SourceConfig, fetch_public_source


def load_registry(path: str = "data/sources.json") -> list[SourceConfig]:
    rows = json.loads(Path(path).read_text(encoding="utf-8"))
    return [SourceConfig(**row) for row in rows if row.get("enabled")]


def discover(registry_path: str = "data/sources.json") -> list[SourceRecord]:
    records = []
    for config in load_registry(registry_path):
        if config.source_type != "public":
            continue
        try:
            records.append(fetch_public_source(config))
        except Exception as exc:
            print(f"source_error={config.source} error={exc}")
    return records


def write_source_records(records: list[SourceRecord], path: str = "data/discovered_sources.jsonl") -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(asdict(record), ensure_ascii=False) + "\\n")
