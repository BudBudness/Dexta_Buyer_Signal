import json
from pathlib import Path
from dexta.discovery import load_registry


def test_registry_loads_only_enabled(tmp_path: Path):
    p = tmp_path / "sources.json"
    p.write_text(json.dumps([{"source":"disabled","source_type":"public","url":"https://example.com","enabled":False},{"source":"enabled","source_type":"public","url":"https://example.com","enabled":True}]))
    rows = load_registry(str(p))
    assert [r.source for r in rows] == ["enabled"]
