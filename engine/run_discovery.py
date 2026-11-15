import os

from dexta.discovery import discover, load_registry, write_source_records

registry = os.environ.get("DEXTA_SOURCE_REGISTRY_PATH", "data/sources.json")
if not any(source.source_type == "public" for source in load_registry(registry)):
    raise SystemExit("No enabled public sources in the discovery registry. Existing output preserved.")
records = discover(registry)
if not records:
    raise SystemExit(
        "No public source records discovered. Check data/sources.json for enabled, "
        "authorized sources and review source_error messages above. Existing output "
        "is preserved rather than replaced with an empty file."
    )

write_source_records(records)
print(f"discovered_sources={len(records)}")
