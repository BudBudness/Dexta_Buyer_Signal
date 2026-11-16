import pytest

from dexta.sources import SourceConfig, _html_to_text, fetch_public_source


def test_html_to_text_removes_scripts_and_tags():
    text = _html_to_text("<h1>Looking for Toyota Harrier</h1><script>x()</script><p>Budget 45m</p>")
    assert "Looking for Toyota Harrier" in text
    assert "Budget 45m" in text
    assert "x()" not in text


def test_source_config_is_explicitly_public_and_unverified_by_default():
    cfg = SourceConfig("x", "public", "https://example.com")
    assert cfg.source_type == "public"
    assert cfg.authorization_status == "unverified"


def test_public_source_requires_approved_permission_context():
    cfg = SourceConfig("x", "public", "https://example.com")
    with pytest.raises(ValueError, match="approved authorization"):
        fetch_public_source(cfg)


def test_fetch_public_source_preserves_authorization_provenance(monkeypatch):
    class Response:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def read(self, limit):
            return b"<p>Authorized buyer enquiry</p>"

    monkeypatch.setattr("urllib.request.urlopen", lambda request, timeout: Response())
    cfg = SourceConfig(
        "approved_partner",
        "public",
        "https://example.com/approved-feed",
        authorization_context="Provider approval recorded 2026-11-16",
        permission_context="Provider terms explicitly permit this collection",
        authorization_status="approved",
    )
    record = fetch_public_source(cfg)
    assert record.authorization_context == cfg.authorization_context
    assert record.permission_context == cfg.permission_context
    assert record.authorization_status == "approved"
