import re
from dataclasses import dataclass
from urllib.parse import urlparse

EMAIL = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
URL = re.compile(r"https?://[^\s<>]+", re.I)
UG_PHONE = re.compile(r"(?<!\d)(?:\+256|0)(?:7\d|3\d|2\d)\s*\d{3}\s*\d{3}(?!\d)")
WA = re.compile(r"(?:https?://)?(?:wa\.me|api\.whatsapp\.com)/[^\s<>]+", re.I)
HANDLE = re.compile(r"(?<![\w@])@[A-Za-z0-9_.-]{3,30}\b")

@dataclass(frozen=True)
class Contact:
    value: str
    contact_type: str
    source: str
    context: str
    confidence: float


def _clean_phone(value: str) -> str:
    raw = re.sub(r"[^+\d]", "", value)
    if raw.startswith("0") and len(raw) >= 10:
        return "+256" + raw[1:]
    return raw


def extract_contacts(text: str, source_url: str | None = None, *, authorization_context: str | None = None) -> list[Contact]:
    """Extract only explicitly supplied contacts; never infer hidden identity/contact data."""
    found: list[Contact] = []
    seen: set[tuple[str, str]] = set()
    for m in EMAIL.finditer(text):
        key=(m.group(0).lower(),"email")
        if key not in seen:
            seen.add(key); found.append(Contact(m.group(0),"email","authorized_private" if authorization_context else "public","explicitly supplied",0.98))
    for m in WA.finditer(text):
        key=(m.group(0),"whatsapp")
        if key not in seen:
            seen.add(key); found.append(Contact(m.group(0),"whatsapp","authorized_private" if authorization_context else "public","explicitly supplied",0.99))
    for m in UG_PHONE.finditer(text):
        value=_clean_phone(m.group(0)); key=(value,"phone")
        if key not in seen:
            seen.add(key); found.append(Contact(value,"phone","authorized_private" if authorization_context else "public","explicitly supplied",0.97))
    for m in URL.finditer(text):
        url=m.group(0).rstrip(".,)"); host=urlparse(url).netloc.lower()
        if "whatsapp" in host or "wa.me" in host: continue
        key=(url,"url")
        if key not in seen:
            seen.add(key); found.append(Contact(url,"url","authorized_private" if authorization_context else "public","explicitly supplied",0.95))
    for m in HANDLE.finditer(text):
        key=(m.group(0).lower(),"username")
        if key not in seen:
            seen.add(key); found.append(Contact(m.group(0),"username","authorized_private" if authorization_context else "public","explicitly supplied",0.90))
    return found
