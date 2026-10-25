import json

from dexta.discovery import write_source_records
from dexta.models import SourceRecord


def test_write_source_records_outputs_one_parseable_json_object_per_line(tmp_path):
    records = [
        SourceRecord(
            source="public_demo",
            source_type="public",
            source_url="https://example.com/one",
            observed_at=1760000000,
            text="Looking for a Toyota Harrier",
        ),
        SourceRecord(
            source="public_demo",
            source_type="public",
            source_url="https://example.com/two",
            observed_at=1760000001,
            text="Looking for a Toyota Vezel",
        ),
    ]
    output = tmp_path / "nested" / "discovered_sources.jsonl"

    write_source_records(records, str(output))

    lines = output.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 2
    decoded = [json.loads(line) for line in lines]
    assert [row["source_url"] for row in decoded] == [
        "https://example.com/one",
        "https://example.com/two",
    ]
