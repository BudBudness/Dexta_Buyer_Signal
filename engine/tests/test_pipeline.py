import json

import pytest

from dexta.models import SourceRecord
from dexta.pipeline import process_record, write_qualified_prospects


def test_buyer_pipeline_extracts_contact():
    record = SourceRecord(
        source="public_demo",
        source_type="public",
        source_url="https://example.com/post/1",
        observed_at=1760000000000,
        text="Looking for Toyota Harrier 2018, budget 45m. WhatsApp +256 701 222 333.",
        public_name="Buyer One",
        city="Kampala",
    )
    result = process_record(record)
    assert result["is_buyer"] is True
    assert result["contactable"] is True
    assert any(c["contact_type"] == "phone" for c in result["contacts"])


def test_authorized_private_pipeline():
    record = SourceRecord(
        source="partner_crm",
        source_type="authorized_private",
        source_url="partner://crm/inquiry/1",
        observed_at=1760000000000,
        text="Need Toyota Vezel 2019 below 35m. Call 0772 123 456.",
        public_name="CRM Lead",
        authorization_context="Partner CRM export",
        permission_context="Contractual lead-sharing permission",
        authorization_status="approved",
    )
    result = process_record(record)
    assert result["contacts"][0]["source"] == "authorized_private"


def test_qualified_output_replaces_existing_file_atomically(tmp_path):
    output = tmp_path / "nested" / "qualified.jsonl"
    output.parent.mkdir()
    output.write_text('{"old": true}\n', encoding="utf-8")

    write_qualified_prospects(
        [{"is_buyer": True, "name": "new"}, {"is_buyer": False, "name": "not qualified"}],
        str(output),
    )

    rows = [json.loads(line) for line in output.read_text(encoding="utf-8").splitlines()]
    assert rows == [{"is_buyer": True, "name": "new"}]
    assert list(output.parent.iterdir()) == [output]


def test_failed_serialization_preserves_previous_output(tmp_path):
    output = tmp_path / "qualified.jsonl"
    original = '{"existing": true}\n'
    output.write_text(original, encoding="utf-8")

    with pytest.raises(TypeError):
        write_qualified_prospects([{"is_buyer": True, "invalid": object()}], str(output))

    assert output.read_text(encoding="utf-8") == original
    assert list(tmp_path.iterdir()) == [output]
