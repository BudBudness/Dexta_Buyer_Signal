from dexta.contacts import extract_contacts

def test_uganda_phone_and_whatsapp():
    xs = extract_contacts("Call 0772 123 456 or +256 701 222 333. WhatsApp: https://wa.me/256701222333")
    assert any(x.contact_type == "phone" and x.value == "+256772123456" for x in xs)
    assert any(x.contact_type == "whatsapp" for x in xs)

def test_email_url_handle():
    xs = extract_contacts("Email buyer@example.com, profile @buyer256, https://example.com/contact")
    assert {x.contact_type for x in xs} == {"email", "username", "url"}

def test_authorized_context_requires_approved_status_and_permission():
    xs = extract_contacts(
        "CRM phone 0772123456",
        authorization_context="partner CRM export",
        permission_context="Contractual lead-sharing permission",
        authorization_status="approved",
    )
    assert xs[0].source == "authorized_private"


def test_unverified_context_is_not_labeled_authorized_private():
    xs = extract_contacts(
        "CRM phone 0772123456",
        authorization_context="unverified partner export",
    )
    assert xs[0].source == "public"
