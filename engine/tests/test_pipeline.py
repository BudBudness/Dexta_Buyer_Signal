import json
from dexta.models import SourceRecord
from dexta.pipeline import process_record

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
    )
    result = process_record(record)
    assert result["contacts"][0]["source"] == "authorized_private"
