#!/usr/bin/env python3
"""Read-only HTTPS checks of the private, isolated DENTIX staging host."""

from __future__ import annotations

import base64
import ctypes
import hashlib
import json
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urljoin, urlparse
from zipfile import ZipFile

PRIVATE_STAGE = Path.home() / "Library/Application Support/DENTIX/PR06-Staging"
CANDIDATE = Path.home() / "Downloads/DENTIX_PRODUCTION_RELEASE_CANDIDATE_CURRENT.zip"
SOURCE_SHA = "9bc26e9a9ecaf50ae957d14f67a55bbddb0cdeef"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        return None


def keychain_password(service: str, account: str) -> str:
    framework = ctypes.CDLL("/System/Library/Frameworks/Security.framework/Security")
    find = framework.SecKeychainFindGenericPassword
    find.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_char_p,
                     ctypes.c_uint32, ctypes.c_char_p, ctypes.POINTER(ctypes.c_uint32),
                     ctypes.POINTER(ctypes.c_void_p), ctypes.POINTER(ctypes.c_void_p)]
    find.restype = ctypes.c_int32
    free = framework.SecKeychainItemFreeContent
    free.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
    free.restype = ctypes.c_int32
    service_bytes, account_bytes = service.encode(), account.encode()
    length, pointer = ctypes.c_uint32(), ctypes.c_void_p()
    status = find(None, len(service_bytes), service_bytes, len(account_bytes),
                  account_bytes, ctypes.byref(length), ctypes.byref(pointer), None)
    if status != 0 or not pointer.value:
        raise ValueError("STAGING_AUTH_UNAVAILABLE")
    try:
        return ctypes.string_at(pointer, length.value).decode()
    finally:
        free(None, pointer)


def request(url: str, *, method: str = "GET", credential: str | None = None,
            headers: dict | None = None, max_bytes: int = 4_000_000) -> tuple[int, dict, bytes]:
    supplied = dict(headers or {})
    if credential:
        supplied["Authorization"] = "Basic " + base64.b64encode(credential.encode()).decode()
    query = urllib.request.Request(url, method=method, headers=supplied)
    opener = urllib.request.build_opener(NoRedirect())
    try:
        response = opener.open(query, timeout=15)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        return response.code, dict(response.headers), response.read(max_bytes)


def verify() -> dict:
    config = PRIVATE_STAGE / "review.json"
    if (not config.is_file() or config.is_symlink() or config.stat().st_mode & 0o077
            or PRIVATE_STAGE.stat().st_mode & 0o077):
        raise ValueError("PRIVATE_CONFIG_UNSAFE")
    data = json.loads(config.read_text())
    base = data.get("url", "")
    parsed = urlparse(base)
    if (data.get("site_id") != "DENTIX" or parsed.scheme != "https"
            or parsed.hostname != data.get("label", "") + ".dentix.ua"
            or parsed.path != "/" or parsed.query or parsed.fragment or parsed.port):
        raise ValueError("STAGING_SCOPE_INVALID")
    secret = keychain_password(data["auth_keychain_service"],
                               data["auth_keychain_account"])
    if not secret:
        raise ValueError("STAGING_AUTH_UNAVAILABLE")
    credential = data["auth_keychain_account"] + ":" + secret
    with ZipFile(CANDIDATE) as archive:
        manifest = json.loads(archive.read("route-manifest.json"))
    if manifest.get("site_id") != "DENTIX" or len(manifest.get("routes", [])) != 12:
        raise ValueError("ROUTE_MANIFEST_INVALID")
    unauth, _, _ = request(base)
    if unauth != 401:
        raise ValueError("UNAUTHENTICATED_NOT_401")
    paths = [row["path"] for row in manifest["routes"]]
    for path in paths:
        target = urljoin(base, path.lstrip("/"))
        for method in ("GET", "HEAD"):
            status, headers, body = request(target, method=method, credential=credential)
            if status != 200 or "noindex" not in headers.get("X-Robots-Tag", "").lower():
                raise ValueError("ROUTE_OR_HEADER_FAILED")
            if method == "GET" and b'name="robots" content="noindex,nofollow,noarchive"' not in body:
                raise ValueError("META_NOINDEX_FAILED")
    status, _, body = request(urljoin(base, "robots.txt"), credential=credential)
    if status != 200 or b"Disallow: /" not in body:
        raise ValueError("ROBOTS_DISALLOW_FAILED")
    status, headers, body = request(urljoin(base, ".dentix-version"), credential=credential)
    if status != 200 or body.strip().decode() != SOURCE_SHA:
        raise ValueError("VERSION_MARKER_FAILED")
    if headers.get("X-Dentix-Release") != SOURCE_SHA:
        raise ValueError("RELEASE_HEADER_FAILED")
    status, _, body = request(urljoin(base, "not-a-real-dentix-pr06-path"), credential=credential)
    if status != 404 or b"404" not in body:
        raise ValueError("CUSTOM_404_FAILED")
    status, headers, _ = request(urljoin(base, "likari"), credential=credential)
    if status != 301 or urlparse(headers.get("Location", "")).path != "/likari/":
        raise ValueError("EXACT_301_FAILED")
    status, _, _ = request(urljoin(base, "likari/"), credential=credential)
    if status != 200:
        raise ValueError("REDIRECT_LOOP_OR_TARGET_FAILED")
    status, _, _ = request(urljoin(base, "sayt-nahoditsya-na-tehnicheskom-obsluzh/"),
                           credential=credential)
    if status != 410:
        raise ValueError("EXACT_410_FAILED")
    status, _, _ = request(base + "?p=1", credential=credential)
    if status != 503:
        raise ValueError("LEGACY_QUERY_GATE_FAILED")
    status, headers, _ = request(base + "?url=https://example.org/", credential=credential)
    if status != 200 or "example.org" in headers.get("Location", ""):
        raise ValueError("OPEN_PROXY_GUARD_FAILED")
    overlay = PRIVATE_STAGE / "overlay"
    for suffix in (".mp4", ".webp"):
        media = next(overlay.rglob("*" + suffix), None)
        if media is None:
            raise ValueError("MEDIA_MISSING")
        relative = media.relative_to(overlay).as_posix()
        target = urljoin(base, relative)
        status, headers, body = request(target, credential=credential,
                                        headers={"Range": "bytes=0-1023"})
        if status != 206 or len(body) != 1024 or "noindex" not in headers.get("X-Robots-Tag", "").lower():
            raise ValueError("MEDIA_RANGE_FAILED")
        status, _, _ = request(target, method="HEAD", credential=credential)
        if status != 200:
            raise ValueError("MEDIA_HEAD_FAILED")
    matches = 0
    for local in overlay.rglob("*"):
        if not local.is_file() or local.name == ".htaccess" or ".vite" in local.parts:
            continue
        relative = local.relative_to(overlay).as_posix()
        for attempt in range(2):
            try:
                status, _, body = request(urljoin(base, relative), credential=credential,
                                          max_bytes=local.stat().st_size + 1)
                break
            except TimeoutError:
                if attempt:
                    raise ValueError("REMOTE_FILE_TIMEOUT") from None
        if status != 200 or hashlib.sha256(body).digest() != hashlib.sha256(local.read_bytes()).digest():
            raise ValueError("REMOTE_FILE_HASH_MISMATCH")
        matches += 1
    if matches != 58:
        raise ValueError("REMOTE_FILE_SET_MISMATCH")
    return {"site_id": "DENTIX", "status": "PASS", "routes_get": 12,
            "routes_head": 12, "unauthenticated_401": True, "authenticated_200": True,
            "custom_404": True, "exact_301": True, "exact_410": True,
            "redirect_loop": False, "open_proxy": False, "noindex": True,
            "media_range": True, "remote_file_hashes": matches,
            "source_sha": SOURCE_SHA}


if __name__ == "__main__":
    try:
        print(json.dumps(verify()))
    except Exception as error:
        print(json.dumps({"site_id": "DENTIX", "status": "BLOCKED",
                          "blocker": str(error) if isinstance(error, ValueError)
                          else "STAGING_QA_FAILED"}))
        raise SystemExit(2)
