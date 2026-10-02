from dexta.sources import SourceConfig, _html_to_text


def test_html_to_text_removes_scripts_and_tags():
    text = _html_to_text("<h1>Looking for Toyota Harrier</h1><script>x()</script><p>Budget 45m</p>")
    assert "Looking for Toyota Harrier" in text
    assert "Budget 45m" in text
    assert "x()" not in text


def test_source_config_is_explicitly_public():
    cfg = SourceConfig("x", "public", "https://example.com")
    assert cfg.source_type == "public"
