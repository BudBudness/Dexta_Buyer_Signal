from dataclasses import dataclass, asdict
from typing import Optional

@dataclass(frozen=True)
class SourceRecord:
    source: str
    source_type: str
    source_url: str
    observed_at: int
    text: str
    public_name: Optional[str] = None
    username: Optional[str] = None
    city: Optional[str] = None
    country: str = "Uganda"
    authorization_context: Optional[str] = None
    permission_context: Optional[str] = None

    def to_dict(self):
        return asdict(self)
