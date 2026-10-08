"""Quick manual test: runs real extraction on files in backend/test_files/."""
import asyncio
from pathlib import Path

from pipeline.extract import extract_all

FOLDER = Path(__file__).parent / "test_files"


def load(name: str):
    matches = list(FOLDER.glob(f"{name}.*"))
    if not matches:
        raise SystemExit(f"Missing file: put a '{name}.<ext>' file in {FOLDER}")
    p = matches[0]
    return (p.read_bytes(), p.name, None)


async def show(step, status, output):
    print(f"[{step}] {status}")


async def main():
    out = await extract_all(load("photo"), load("voice"), load("invoice"), on_step=show)
    for k in ("photo", "voice", "invoice"):
        print(f"\n===== {k} =====")
        print(out[k].model_dump_json(indent=2) if out[k] else "FAILED")
    print("\nerrors:", out["errors"] or "none")


asyncio.run(main())
