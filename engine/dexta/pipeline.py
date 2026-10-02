import json
from dataclasses import asdict
from .contacts import extract_contacts
from .models import SourceRecord
from .signals import classify

def process_record(record: SourceRecord) -> dict:
    signal = classify(record.text)
    contacts = extract_contacts(
        record.text,
        record.source_url,
        authorization_context=record.authorization_context,
    )
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
    }

def process_jsonl(path: str) -> list[dict]:
    out = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                out.append(process_record(SourceRecord(**json.loads(line))))
    return out
