from __future__ import annotations

import re
import urllib.request
from dataclasses import dataclass
from html import unescape
from time import time

from .models import SourceRecord


@dataclass(frozen=True)
class SourceConfig:
    source: str
    source_type: str
    url: str
    enabled: bool = True
    authorization_context: str | None = None
    permission_context: str | None = None


def _html_to_text(html: str) -> str:
    html = re.sub(r"<script\\b[^>]*>.*?</script>", " ", html, flags=re.I | re.S)
    html = re.sub(r"<style\\b[^>]*>.*?</style>", " ", html, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\\s+", " ", unescape(text)).strip()


def fetch_public_source(config: SourceConfig, timeout: int = 20, max_bytes: int = 2_000_000) -> SourceRecord:
    if config.source_type != "public":
        raise ValueError("fetch_public_source only accepts public sources")
    req = urllib.request.Request(
        config.url,
        headers={"User-Agent": "DextaBuyerSignal/1.0 (+public-source-research)"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        raw = response.read(max_bytes + 1)
    if len(raw) > max_bytes:
        raise ValueError(f"source exceeded max_bytes={max_bytes}")
    text = _html_to_text(raw.decode("utf-8", errors="replace"))
    return SourceRecord(
        source=config.source,
        source_type="public",
        source_url=config.url,
        observed_at=int(time()),
        text=text,
    )
