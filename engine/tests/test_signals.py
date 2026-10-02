from dexta.signals import classify

def test_buyer():
    s=classify("Looking for Toyota Harrier 2018, budget 45m, can someone import from Japan?")
    assert s.is_buyer and s.score >= 70 and s.intent_type == "import"

def test_seller_rejected():
    s=classify("Toyota Harrier 2018 for sale, price 45m, contact seller")
    assert not s.is_buyer and s.intent_type == "reject"
