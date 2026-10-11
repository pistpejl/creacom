#!/usr/bin/env python3
"""Kryptera dokument för den lösenordsskyddade sidan docs/.

Användning:
    export CREACOM_DOCS_PASSWORD='...'   # aldrig i repot
    python3 tools/encrypt_docs.py \
        --affarsplan /sökväg/creacom-affarsplan-v3.pdf \
        --business-case /sökväg/creacom-business-case.xlsx \
        --demovideo /sökväg/creacom-testdemo.mp4

Alla argument är valfria: filer som inte anges behåller sin befintliga
krypterade fil och sin post i manifest.json (så man kan kryptera om en enda fil).

Varje fil krypteras med AES-256-GCM. Nyckeln härleds ur lösenordet med
PBKDF2-HMAC-SHA256 (600 000 iterationer) och ett slumpmässigt 16-byte salt.
Varje fil får eget salt och egen 12-byte IV. Utdata:
    docs/files/<namn>.enc   (chiffertext || 16-byte GCM-tagg, samma format som Web Crypto)
    docs/manifest.json      (filnamn, visningsnamn, storlek, salt, iv, iterationer – inga hemligheter)

Lösenordet läses ENDAST från miljövariabeln CREACOM_DOCS_PASSWORD.
Kräver: pip install cryptography
"""
import argparse
import base64
import json
import os
import sys
from pathlib import Path

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ITERATIONS = 600_000
ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"

# id, utdatafil, nedladdningsnamn, visningsnamn, MIME-typ
DOCUMENTS = [
    ("affarsplan", "affarsplan-v3.pdf.enc", "creacom-affarsplan-v3.pdf",
     "Affärsplan v3 (PDF)", "application/pdf"),
    ("business-case", "business-case.xlsx.enc", "creacom-business-case.xlsx",
     "Business case (Excel)",
     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    ("demovideo", "creacom-testdemo.mp4.enc", "creacom-testdemo.mp4",
     "Demovideo: så går ett test till (MP4)", "video/mp4"),
]


def derive_key(password: bytes, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITERATIONS)
    return kdf.derive(password)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--affarsplan", type=Path, help="Affärsplanen (PDF) i klartext, utanför repot")
    ap.add_argument("--business-case", type=Path, help="Business case (XLSX) i klartext, utanför repot")
    ap.add_argument("--demovideo", type=Path, help="Demovideon (MP4) i klartext, utanför repot")
    args = ap.parse_args()

    password = os.environ.get("CREACOM_DOCS_PASSWORD")
    if not password:
        print("Fel: miljövariabeln CREACOM_DOCS_PASSWORD saknas.", file=sys.stderr)
        return 1
    pw = password.encode("utf-8")

    sources = {"affarsplan": args.affarsplan, "business-case": args.business_case,
               "demovideo": args.demovideo}
    if not any(sources.values()):
        print("Fel: ange minst en fil att kryptera.", file=sys.stderr)
        return 1
    (DOCS / "files").mkdir(parents=True, exist_ok=True)

    old = {}
    if (DOCS / "manifest.json").exists():
        old = {e["id"]: e for e in json.loads((DOCS / "manifest.json").read_text(encoding="utf-8"))["files"]}

    entries = []
    for doc_id, enc_name, filename, display, mime in DOCUMENTS:
        src = sources[doc_id]
        if src is None:
            if doc_id in old:
                entries.append(old[doc_id])  # behåll befintlig krypterad fil oförändrad
            continue
        data = src.read_bytes()
        salt = os.urandom(16)
        iv = os.urandom(12)
        ct = AESGCM(derive_key(pw, salt)).encrypt(iv, data, None)
        (DOCS / "files" / enc_name).write_bytes(ct)
        entries.append({
            "id": doc_id,
            "file": f"files/{enc_name}",
            "filename": filename,
            "name": display,
            "mime": mime,
            "size": len(data),
            "salt": base64.b64encode(salt).decode(),
            "iv": base64.b64encode(iv).decode(),
        })
        print(f"Krypterade {src.name} -> docs/files/{enc_name} ({len(data)} byte)")

    manifest = {
        "version": 1,
        "cipher": "AES-256-GCM",
        "kdf": {"name": "PBKDF2", "hash": "SHA-256", "iterations": ITERATIONS},
        "files": entries,
    }
    (DOCS / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Skrev docs/manifest.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
