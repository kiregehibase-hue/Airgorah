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
        base = ctypes.addressof(listing.contents) + WLAN_INTERFACE_INFO_LIST.InterfaceInfo.offset
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
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
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

    def do_GET(self):
        if self.path == "/health":
            self.send_json(200, {"ok": True, "service": "Airgorah local Wi-Fi scanner"})
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
