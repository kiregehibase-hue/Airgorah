#!/usr/bin/env python3
"""Local, read-only Windows Wi-Fi scan bridge for the Airgorah web UI.

Uses Windows' built-in netsh WLAN scan results. Binds only to loopback.
No packet injection, deauthentication, credential capture, or network login.
"""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from datetime import datetime, timezone
import json
import re
import subprocess
import sys
import ctypes
import time

HOST = "127.0.0.1"
PORT = 8765
ALLOWED_ORIGINS = {
    "https://kiregehibase-hue.github.io",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}
# Credential-recovery routes are intentionally restricted to the local app.
SAVED_PROFILE_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}

def classify_security(authentication: str, encryption: str) -> str:
    value = (authentication + " " + encryption).lower()
    if "wpa3" in value:
        return "WPA3"
    if "wpa2" in value:
        return "WPA2"
    if "wpa" in value:
        return "WPA"
    if "wep" in value:
        return "WEP"
    return "Open"

def request_windows_wifi_scan():
    """Ask Windows WLAN AutoConfig to perform a fresh passive scan."""
    if sys.platform != "win32":
        return
    class GUID(ctypes.Structure):
        _fields_ = [
            ("Data1", ctypes.c_uint32), ("Data2", ctypes.c_uint16),
            ("Data3", ctypes.c_uint16), ("Data4", ctypes.c_ubyte * 8),
        ]
    class WLAN_INTERFACE_INFO(ctypes.Structure):
        _fields_ = [("InterfaceGuid", GUID), ("strInterfaceDescription", ctypes.c_wchar * 256), ("isState", ctypes.c_int)]
    class WLAN_INTERFACE_INFO_LIST(ctypes.Structure):
        _fields_ = [("dwNumberOfItems", ctypes.c_uint32), ("dwIndex", ctypes.c_uint32), ("InterfaceInfo", WLAN_INTERFACE_INFO * 1)]

    wlan = ctypes.WinDLL("wlanapi.dll")
    handle = ctypes.c_void_p()
    negotiated = ctypes.c_uint32()
    result = wlan.WlanOpenHandle(2, None, ctypes.byref(negotiated), ctypes.byref(handle))
    if result != 0:
        raise RuntimeError(f"Windows WLAN service could not open a scan handle (error {result}).")
    listing = ctypes.c_void_p()
    try:
        result = wlan.WlanEnumInterfaces(handle, None, ctypes.byref(listing))
        if result != 0:
            raise RuntimeError(f"Could not enumerate wireless adapters (error {result}).")
        header = ctypes.cast(listing, ctypes.POINTER(WLAN_INTERFACE_INFO_LIST)).contents
        if header.dwNumberOfItems == 0:
            raise RuntimeError("Windows reports no Wi-Fi adapter. Enable Wi-Fi or connect a wireless adapter.")
        base = listing.value + WLAN_INTERFACE_INFO_LIST.InterfaceInfo.offset
        requested = 0
        for index in range(header.dwNumberOfItems):
            item = ctypes.cast(base + index * ctypes.sizeof(WLAN_INTERFACE_INFO), ctypes.POINTER(WLAN_INTERFACE_INFO)).contents
            status = wlan.WlanScan(handle, ctypes.byref(item.InterfaceGuid), None, None, None)
            if status == 0:
                requested += 1
        if requested == 0:
            raise RuntimeError("Windows could not start a Wi-Fi scan. Check that the WLAN AutoConfig service is running.")
    finally:
        if listing:
            wlan.WlanFreeMemory(listing)
        wlan.WlanCloseHandle(handle, None)
    time.sleep(3)

def scan_networks():
    if sys.platform != "win32":
        raise RuntimeError("This first local scanner helper currently supports Windows 10/11 only.")
    # Explicitly request a fresh scan before reading Windows' visible networks.
    # WlanScan is asynchronous; request_windows_wifi_scan waits briefly for results.
    request_windows_wifi_scan()
    result = subprocess.run(
        ["netsh", "wlan", "show", "networks", "mode=bssid"],
        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=20,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    if result.returncode != 0:
        message = (result.stderr or result.stdout or "netsh scan failed").strip()
        raise RuntimeError(message[:300])

    networks = []
    current_ssid = ""
    authentication = ""
    encryption = ""
    current = None

    def save():
        if current is None:
            return
        channel = current.get("channel", 0)
        networks.append({
            "ssid": current_ssid.strip() or "(Hidden network)",
            "bssid": current.get("bssid", ""),
            "signal": current.get("signal", 0),
            "channel": channel,
            "frequency": "2.4" if channel and channel <= 14 else "5",
            "security": classify_security(authentication, encryption),
            "vendor": "Unknown",
        })

    for raw in result.stdout.splitlines():
        line = raw.strip()
        m = re.match(r"SSID\s+\d+\s*:\s*(.*)$", line, re.I)
        if m:
            save()
            current_ssid = m.group(1)
            authentication = ""
            encryption = ""
            current = None
            continue
        m = re.match(r"Authentication\s*:\s*(.*)$", line, re.I)
        if m:
            authentication = m.group(1)
            continue
        m = re.match(r"Encryption\s*:\s*(.*)$", line, re.I)
        if m:
            encryption = m.group(1)
            continue
        m = re.match(r"BSSID\s+\d+\s*:\s*([0-9a-f:.-]+)", line, re.I)
        if m:
            save()
            current = {"bssid": m.group(1).upper(), "signal": 0, "channel": 0}
            continue
        if current is not None:
            m = re.match(r"Signal\s*:\s*(\d+)\s*%", line, re.I)
            if m:
                current["signal"] = int(m.group(1))
                continue
            m = re.match(r"Channel\s*:\s*(\d+)", line, re.I)
            if m:
                current["channel"] = int(m.group(1))

    save()
    return networks

class Handler(BaseHTTPRequestHandler):
    def add_cors_headers(self):
        origin = self.headers.get("Origin", "")
        is_saved_profile_route = self.path.startswith("/api/saved-")
        allowed = SAVED_PROFILE_ORIGINS if is_saved_profile_route else ALLOWED_ORIGINS
        if origin in allowed:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        methods = "GET, POST, OPTIONS" if is_saved_profile_route else "GET, OPTIONS"
        self.send_header("Access-Control-Allow-Methods", methods)
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Cache-Control", "no-store")

    def send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.add_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.add_cors_headers()
        self.end_headers()

    def list_saved_wifi_profiles(self):
        result = subprocess.run(
            ["netsh", "wlan", "show", "profiles"],
            capture_output=True, text=True, encoding="utf-8", errors="replace",
            timeout=15, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        if result.returncode != 0:
            raise RuntimeError((result.stderr or result.stdout or "Could not list saved Wi-Fi profiles").strip()[:300])
        profiles = []
        for line in result.stdout.splitlines():
            match = re.search(r"All User Profile\s*:\s*(.*)$", line, re.I)
            if match:
                name = match.group(1).strip()
                if name and name not in profiles:
                    profiles.append(name)
        return profiles

    def do_GET(self):
        if self.path == "/health":
            self.send_json(200, {"ok": True, "service": "Airgorah local Wi-Fi scanner"})
            return
        if self.path == "/api/saved-profiles":
            if self.headers.get("Origin", "") not in SAVED_PROFILE_ORIGINS:
                self.send_json(403, {"error": "Saved profile access is available only from the local Airgorah app."})
                return
            try:
                self.send_json(200, {"profiles": self.list_saved_wifi_profiles()})
            except Exception as exc:
                self.send_json(500, {"error": str(exc)})
            return
        if self.path != "/api/scan":
            self.send_json(404, {"error": "Not found"})
            return
        try:
            items = scan_networks()
            self.send_json(200, {
                "networks": items,
                "scanned_at": datetime.now(timezone.utc).isoformat(),
            })
        except Exception as exc:
            self.send_json(500, {"error": str(exc)})

    def do_POST(self):
        if self.path != "/api/saved-profile-password":
            self.send_json(404, {"error": "Not found"})
            return
        if self.headers.get("Origin", "") not in SAVED_PROFILE_ORIGINS:
            self.send_json(403, {"error": "Password recovery is allowed only from the local Airgorah app."})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 4096:
                self.send_json(400, {"error": "Invalid request size."})
                return
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            profile = payload.get("profile") if isinstance(payload, dict) else None
            if not isinstance(profile, str) or not profile.strip():
                self.send_json(400, {"error": "Select a saved Wi-Fi profile."})
                return
            # Only accept a profile name returned by Windows for this account.
            if profile not in self.list_saved_wifi_profiles():
                self.send_json(404, {"error": "That profile is not saved under this Windows account."})
                return
            result = subprocess.run(
                ["netsh", "wlan", "show", "profile", f"name={profile}", "key=clear"],
                capture_output=True, text=True, encoding="utf-8", errors="replace",
                timeout=15, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
            )
            if result.returncode != 0:
                self.send_json(500, {"error": (result.stderr or result.stdout or "Windows could not read this profile").strip()[:300]})
                return
            password = None
            for line in result.stdout.splitlines():
                match = re.search(r"Key Content\s*:\s*(.*)$", line, re.I)
                if match:
                    password = match.group(1).strip()
                    break
            self.send_json(200, {"profile": profile, "password": password})
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
            self.send_json(400, {"error": "Invalid JSON request."})
        except Exception as exc:
            self.send_json(500, {"error": str(exc)[:300]})

    def log_message(self, fmt, *args):
        print("[Airgorah] " + (fmt % args))

if __name__ == "__main__":
    if sys.platform != "win32":
        print("This helper currently requires Windows 10/11.")
        raise SystemExit(1)
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Airgorah local Wi-Fi scanner running at http://{HOST}:{PORT}")
    print("Keep this window open while using Real Scan in Airgorah. Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Airgorah local scanner...")
    finally:
        server.server_close()
