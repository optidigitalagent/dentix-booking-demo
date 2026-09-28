#!/usr/bin/env python3
"""DENTIX-only, fail-closed Mirohost routine runner.

All receipts and browser state live outside Git. Credentials are read from the
private access directory at runtime and are never passed as command arguments.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import ipaddress
import json
import os
import re
import shutil
import ssl
import subprocess
import sys
import tempfile
import urllib.request
from datetime import datetime, timezone
from ftplib import FTP_TLS
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile


SITE_ID = "DENTIX"
SERVER = "hvh34.mirohost.net"
BACKUP_DIR = "/tmp/backup-2026-09-28-00-49-25-UTC"
BACKUP_NAMES = (
    "backup-2026-09-28-00-49-25-UTC-dentix.ua.tar.gz",
    "backup-2026-09-28-00-49-25-UTC-home.tar.gz",
    "backup-2026-09-28-00-49-25-UTC-mysql-dump-newdentix.sql.gz",
)
PHASES = (
    "panel-audit", "ensure-ftp-ip", "download-backups", "create-staging",
    "upload-candidate", "verify-staging", "cleanup-temporary-access", "all",
)
PRIVATE = Path.home() / "Downloads" / "DENTIX_PRIVATE_ACCESS"
BACKUPS = Path.home() / "Downloads" / "DENTIX_PRIVATE_BACKUPS"
REPO = Path(__file__).resolve().parents[4]


class Blocked(Exception):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


def require_private() -> None:
    for name in ("Pass.txt", "Mirohost Dentix.docx"):
        path = PRIVATE / name
        if not path.is_file() or path.is_symlink() or path.stat().st_mode & 0o077:
            raise Blocked("PRIVATE_INPUT_UNAVAILABLE_OR_UNSAFE")
    if not PRIVATE.is_dir() or PRIVATE.stat().st_mode & 0o077:
        raise Blocked("PRIVATE_DIRECTORY_UNSAFE")


def credentials() -> dict[str, str]:
    require_private()
    lines = (PRIVATE / "Pass.txt").read_text(errors="replace").splitlines()
    if len(lines) < 11 or not lines[9].strip() or not lines[10].strip():
        raise Blocked("FTP_CREDENTIALS_UNAVAILABLE")
    with ZipFile(PRIVATE / "Mirohost Dentix.docx") as archive:
        root = ElementTree.fromstring(archive.read("word/document.xml"))
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    paragraphs = [
        "".join(node.text or "" for node in p.findall(".//w:t", ns))
        for p in root.findall(".//w:p", ns)
    ]
    # The supplied document labels the control-panel pair explicitly as CP.
    pairs = [re.search(r"(?i)\bCP\s+Login\s*:\s*(\S+)\s+Password\s*:\s*(\S+)", p)
             for p in paragraphs]
    pair = next((p for p in pairs if p), None)
    if pair is None:
        raise Blocked("PANEL_CREDENTIALS_UNAVAILABLE")
    return {"panel_login": pair.group(1), "panel_password": pair.group(2),
            "ftp_login": lines[9].strip(), "ftp_password": lines[10].strip()}


def safe_state_dir(explicit: str | None) -> Path:
    if explicit:
        path = Path(explicit).resolve()
        if path.is_relative_to(REPO) or not path.is_dir() or path.stat().st_mode & 0o077:
            raise Blocked("PRIVATE_STATE_DIRECTORY_UNSAFE")
        return path
    path = Path(tempfile.mkdtemp(prefix="dentix-pr06-", dir="/tmp"))
    os.chmod(path, 0o700)
    return path


def receipt(state: Path, phase: str, details: dict) -> Path:
    payload = {"site_id": SITE_ID, "phase": phase,
               "recorded_at": datetime.now(timezone.utc).isoformat(), **details}
    path = state / (phase + ".json")
    temp = state / ("." + phase + ".tmp")
    with temp.open("w") as output:
        json.dump(payload, output, ensure_ascii=False, indent=2)
        output.write("\n")
        output.flush()
        os.fsync(output.fileno())
    os.chmod(temp, 0o600)
    os.replace(temp, path)
    return path


def panel(phase: str, state: Path, dry_run: bool) -> dict:
    if dry_run:
        return {"status": "DRY_RUN", "temporary_profile": "ISOLATED"}
    module = os.environ.get("PLAYWRIGHT_MODULE_PATH", "")
    if not module or not Path(module).is_file():
        raise Blocked("PLAYWRIGHT_MODULE_UNAVAILABLE")
    secret = credentials()
    profile = state / "playwright-profile"
    profile.mkdir(mode=0o700, exist_ok=True)
    command = ["node", str(Path(__file__).with_name("panel.mjs")), phase,
               str(profile)]
    result = subprocess.run(command, input=json.dumps({
        "login": secret["panel_login"], "password": secret["panel_password"]
    }), text=True, capture_output=True, env={**os.environ,
        "PLAYWRIGHT_MODULE_PATH": module}, timeout=90, check=False)
    # panel.mjs emits only a fixed schema; never include stderr or raw page text.
    try:
        data = json.loads(result.stdout)
        if data.get("site_id") != SITE_ID:
            raise ValueError()
    except (json.JSONDecodeError, ValueError):
        raise Blocked("PANEL_AUTOMATION_FAILED") from None
    if result.returncode or data.get("status") != "PASS":
        raise Blocked(data.get("blocker", "PANEL_AUTOMATION_FAILED"))
    return data


def public_ipv4() -> str:
    with urllib.request.urlopen("https://api.ipify.org", timeout=15) as response:
        value = response.read(64).decode().strip()
    if ipaddress.ip_address(value).version != 4:
        raise Blocked("PUBLIC_IPV4_UNAVAILABLE")
    return value


def filevault_on() -> bool:
    result = subprocess.run(["/usr/bin/fdesetup", "status"], text=True,
                            capture_output=True, timeout=15, check=False)
    return result.returncode == 0 and result.stdout.strip() == "FileVault is On."


def download_backups(state: Path, dry_run: bool) -> dict:
    if dry_run:
        return {"status": "DRY_RUN", "expected_files": list(BACKUP_NAMES),
                "destination_class": "PRIVATE_LOCAL"}
    if not filevault_on():
        raise Blocked("FILEVAULT_OFF_ENCRYPTED_CONTAINER_REQUIRED")
    secret = credentials()
    # Determine once. The exact address is deliberately omitted from receipts.
    public_ipv4()
    BACKUPS.mkdir(mode=0o700, exist_ok=True)
    os.chmod(BACKUPS, 0o700)
    entries = []
    ftp = FTP_TLS(context=ssl.create_default_context(), timeout=25)
    try:
        ftp.connect(SERVER, 21)
        ftp.login(secret["ftp_login"], secret["ftp_password"])
        ftp.prot_p()
        ftp.voidcmd("TYPE I")
        ftp.cwd(BACKUP_DIR)
        for name in BACKUP_NAMES:
            before = ftp.size(name)
            if before is None or before <= 0:
                raise Blocked("REMOTE_BACKUP_SIZE_UNAVAILABLE")
            final = BACKUPS / name
            if final.exists():
                if final.stat().st_size != before:
                    raise Blocked("LOCAL_BACKUP_SIZE_CONFLICT")
                raw = final.read_bytes()
                digest = hashlib.sha256(raw).hexdigest()
                with gzip.open(final, "rb") as source:
                    while source.read(1024 * 1024):
                        pass
            else:
                temp = BACKUPS / ("." + name + ".partial")
                digest_state = hashlib.sha256()
                size = 0
                with temp.open("wb") as output:
                    os.chmod(temp, 0o600)

                    def write(block: bytes) -> None:
                        nonlocal size
                        output.write(block)
                        digest_state.update(block)
                        size += len(block)

                    ftp.retrbinary("RETR " + name, write, blocksize=262144)
                    output.flush()
                    os.fsync(output.fileno())
                if before != size or ftp.size(name) != size:
                    raise Blocked("REMOTE_BACKUP_SIZE_CHANGED")
                with gzip.open(temp, "rb") as source:
                    while source.read(1024 * 1024):
                        pass
                os.replace(temp, final)
                os.chmod(final, 0o600)
                digest = digest_state.hexdigest()
            entries.append({"name": name, "size": before, "sha256": digest,
                            "gzip": "PASS"})
        sums = BACKUPS / "SHA256SUMS.txt"
        sums.write_text("".join(f"{item['sha256']}  {item['name']}\n" for item in entries))
        os.chmod(sums, 0o600)
    except Blocked:
        raise
    except Exception:
        raise Blocked("FTPS_BACKUP_DOWNLOAD_FAILED") from None
    finally:
        try:
            ftp.quit()
        except Exception:
            pass
    return {"status": "PASS", "files": entries,
            "encryption": "FILEVAULT_ON", "storage_class": "PRIVATE_LOCAL_ONLY"}


def blocked_dependent_phase(phase: str, dry_run: bool) -> dict:
    if dry_run:
        return {"status": "DRY_RUN", "requires": "PANEL_PROVEN_ISOLATED_ROOT"}
    raise Blocked("STAGING_ISOLATION_NOT_PROVEN" if phase in
                  ("create-staging", "upload-candidate", "verify-staging")
                  else "PANEL_MUTATION_NOT_VERIFIED")


def run_phase(phase: str, state: Path, dry_run: bool) -> dict:
    if phase == "panel-audit":
        return panel(phase, state, dry_run)
    if phase == "download-backups":
        return download_backups(state, dry_run)
    if phase in ("ensure-ftp-ip", "create-staging", "cleanup-temporary-access"):
        return panel(phase, state, dry_run)
    return blocked_dependent_phase(phase, dry_run)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("phase", choices=PHASES)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--state-dir", help="existing private 0700 directory outside Git")
    args = parser.parse_args()
    state = safe_state_dir(args.state_dir)
    phases = PHASES[:-1] if args.phase == "all" else (args.phase,)
    try:
        for phase in phases:
            try:
                details = run_phase(phase, state, args.dry_run)
            except Blocked as error:
                details = {"status": "BLOCKED", "blocker": error.code}
                receipt(state, phase, details)
                print(json.dumps({"site_id": SITE_ID, "phase": phase, **details,
                                  "receipt": str(state / (phase + ".json"))}))
                return 2
            receipt(state, phase, details)
            print(json.dumps({"site_id": SITE_ID, "phase": phase,
                              "status": details["status"],
                              "receipt": str(state / (phase + ".json"))}))
        return 0
    finally:
        # The caller can retain sanitized receipts; Chromium state is never retained.
        shutil.rmtree(state / "playwright-profile", ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
