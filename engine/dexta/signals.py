import re
from dataclasses import dataclass
from typing import Optional

BUY_PATTERNS = [
    r"\blooking for\b", r"\bsearching for\b", r"\bneed\b", r"\bwanted\b",
    r"\bi want to (?:buy|purchase)\b", r"\bwho can (?:source|import)\b",
    r"\bcan someone source\b", r"\blooking to import\b", r"\bneed someone to bring\b",
]
SELL_PATTERNS = [r"\bfor sale\b", r"\bselling\b", r"\bavailable\b", r"\bprice is\b", r"\bcontact seller\b"]

@dataclass(frozen=True)
class Signal:
    is_buyer: bool
    score: int
    intent_type: str
    urgency: str
    reasons: tuple[str, ...]

def classify(text: str) -> Signal:
    t = text.lower()
    buy = sum(bool(re.search(p,t)) for p in BUY_PATTERNS)
    sell = sum(bool(re.search(p,t)) for p in SELL_PATTERNS)
    reasons=[]
    score=0
    if buy: score += min(55, buy*22); reasons.append("explicit buyer language")
    if re.search(r"\b(?:budget|below|under|within|\d+\s*m(?:illion)?\b)",t): score += 15; reasons.append("budget signal")
    if re.search(r"\b(?:import|from japan|source)\b",t): score += 12; reasons.append("import/source signal")
    if re.search(r"\b(?:today|this month|urgent|asap|immediately)\b",t): score += 10; reasons.append("urgency signal")
    score=min(100,score)
    if sell and not buy: return Signal(False,0,"reject","none",("seller-only language",))
    intent="import" if re.search(r"\b(?:import|from japan|source)\b",t) else "purchase" if buy else "research"
    urgency="hot" if score>=90 else "high" if score>=70 else "medium" if score>=50 else "weak"
    return Signal(score>=50,score,intent,urgency,tuple(reasons))
