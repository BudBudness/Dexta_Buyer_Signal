"""Make the engine package importable during repository-root pytest runs."""
from pathlib import Path
import sys

ENGINE_DIR = str(Path(__file__).resolve().parent / "engine")
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)
