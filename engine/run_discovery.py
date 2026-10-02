from dexta.discovery import discover, write_source_records

records = discover()
write_source_records(records)
print(f"discovered_sources={len(records)}")
