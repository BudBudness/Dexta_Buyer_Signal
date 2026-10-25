from dexta.discovery import discover, write_source_records

records = discover()
if not records:
    raise SystemExit(
        "No public source records discovered. Check data/sources.json for enabled, "
        "authorized sources and review source_error messages above. Existing output "
        "is preserved rather than replaced with an empty file."
    )

write_source_records(records)
print(f"discovered_sources={len(records)}")
