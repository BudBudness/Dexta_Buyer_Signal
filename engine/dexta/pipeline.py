import json
import re
from dataclasses import asdict
from pathlib import Path
from tempfile import NamedTemporaryFile

from .contacts import extract_contacts
from .models import SourceRecord
from .signals import classify

BUDGET_RE = re.compile(r"(?i)(?:budget|below|under|up to|around|less than)\s*(?:ugx|shs|sh)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(m|million|bn|billion)?")
YEAR_RE = re.compile(r"\b(19[9][0-9]|20[0-2][0-9])\b")


def extract_vehicle_requirements(text: str) -> dict:
    years = [int(x) for x in YEAR_RE.findall(text)]
    budget = None
    match = BUDGET_RE.search(text)
    if match:
        value = float(match.group(1).replace(",", ""))
        unit = (match.group(2) or "").lower()
        if unit in {"m", "million"}:
            value *= 1_000_000
        if unit in {"bn", "billion"}:
            value *= 1_000_000_000
        budget = int(value)
    return {
        "years": years,
        "year_min": min(years) if years else None,
        "year_max": max(years) if years else None,
        "budget_max": budget,
        "import_required": bool(
            re.search(r"\b(import|source|bring from japan|bring from abroad)\b", text, re.I)
        ),
    }


def process_record(record: SourceRecord) -> dict:
    signal = classify(record.text)
    contacts = extract_contacts(
        record.text,
        record.source_url,
        authorization_context=record.authorization_context,
        permission_context=record.permission_context,
        authorization_status=record.authorization_status,
    )
    vehicle = extract_vehicle_requirements(record.text)
    return {
        **asdict(record),
        "is_buyer": signal.is_buyer,
        "intent_strength": signal.score,
        "intent_type": signal.intent_type,
        "urgency": signal.urgency,
        "signal_reasons": list(signal.reasons),
        "contacts": [asdict(c) for c in contacts],
        "contactable": bool(contacts),
        "evidence_text": record.text,
        "vehicle_requirements": vehicle,
    }


def process_jsonl(path: str) -> list[dict]:
    out = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                out.append(process_record(SourceRecord(**json.loads(line))))
    return out


def write_qualified_prospects(records: list[dict], path: str) -> None:
    """Atomically replace the qualified output after all rows serialize successfully."""
    output = Path(path)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with NamedTemporaryFile(
            mode="w", encoding="utf-8", newline="\n", dir=output.parent, delete=False
        ) as staged:
            temporary = Path(staged.name)
            for record in records:
                if record["is_buyer"]:
                    staged.write(json.dumps(record, ensure_ascii=False) + "\n")
            staged.flush()
        temporary.replace(output)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
