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
import base64
import binascii
import os
import shutil
import tempfile
import threading
import signal
import urllib.parse

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


CAPTURE_LOCK = threading.Lock()
CAPTURE_STATE = {
    "process": None, "log_handle": None, "started_at": None,
    "file_path": None, "filename": None, "interface_name": None,
    "packet_count": None, "elapsed_seconds": 0, "engine": None, "running": False, "etl_path": None,
}
CAPTURE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "captures")

def find_pktmon():
    """Locate Windows' built-in Packet Monitor; no Npcap or Wireshark required."""
    executable = shutil.which("pktmon")
    if executable:
        return executable
    candidate = os.path.join(os.environ.get("SystemRoot", r"C:\Windows"), "System32", "pktmon.exe")
    return candidate if os.path.isfile(candidate) else None

def find_dumpcap():
    """Find Wireshark's legitimate passive capture utility."""
    executable = shutil.which("dumpcap")
    if executable:
        return executable
    candidates = [
        os.path.join(os.environ.get("ProgramFiles", r"C:\Program Files"), "Wireshark", "dumpcap.exe"),
        os.path.join(os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)"), "Wireshark", "dumpcap.exe"),
    ]
    return next((path for path in candidates if os.path.isfile(path)), None)

def list_capture_interfaces():
    """Expose Windows Packet Monitor's physical-NIC capture scope."""
    if not find_pktmon():
        raise RuntimeError("Windows pktmon was not found. This built-in engine requires supported Windows 10/11.")
    return [{"id": "all", "name": "All physical network adapters (Windows Packet Monitor)"}]

def _capture_packet_count(log_path):
    try:
        with open(log_path, "r", encoding="utf-8", errors="replace") as handle:
            output = handle.read()
        matches = re.findall(r"(?:Packets captured:|Packets: captured)\s*(\d+)", output, re.I)
        return int(matches[-1]) if matches else None
    except OSError:
        return None

def _capture_snapshot_locked():
    started = CAPTURE_STATE.get("started_at")
    running = bool(CAPTURE_STATE.get("running"))
    elapsed = max(0, int(time.time() - started)) if started and running else CAPTURE_STATE.get("elapsed_seconds", 0)
    CAPTURE_STATE["elapsed_seconds"] = elapsed
    file_path = CAPTURE_STATE.get("file_path")
    size_path = CAPTURE_STATE.get("etl_path") if running else file_path
    try:
        file_bytes = os.path.getsize(size_path) if size_path and os.path.isfile(size_path) else 0
    except OSError:
        file_bytes = 0
    return {
        "available": bool(find_pktmon()),
        "engine": "Windows Packet Monitor (pktmon)",
        "running": running,
        "interface_name": CAPTURE_STATE.get("interface_name"),
        "filename": CAPTURE_STATE.get("filename"),
        "elapsed_seconds": elapsed,
        "file_bytes": file_bytes,
        "packet_count": CAPTURE_STATE.get("packet_count"),
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
        is_local_only_route = self.path.startswith(("/api/saved-", "/api/capture/"))
        allowed = SAVED_PROFILE_ORIGINS if is_local_only_route else ALLOWED_ORIGINS
        if origin in allowed:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        methods = "GET, POST, OPTIONS" if is_local_only_route else "GET, OPTIONS"
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


    def analyze_saved_capture(self, length):
        """Summarize EAPOL frames in a completed local capture; never extract payloads."""
        if length < 1 or length > 4096:
            self.send_json(400, {"error": "Invalid capture analysis request."})
            return
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        name = payload.get("filename") if isinstance(payload, dict) else None
        if not isinstance(name, str) or not re.fullmatch(r"airgorah_capture_[0-9]{8}_[0-9]{6}_[0-9]{6}\.pcapng", name):
            self.send_json(400, {"error": "Choose a completed Airgorah capture file."})
            return
        path = os.path.join(CAPTURE_DIR, name)
        if not os.path.isfile(path):
            self.send_json(404, {"error": "Capture file not found. Stop the capture before analyzing it."})
            return
        tshark = shutil.which("tshark")
        if not tshark:
            candidates = [
                os.path.join(os.environ.get("ProgramFiles", r"C:\\Program Files"), "Wireshark", "tshark.exe"),
                os.path.join(os.environ.get("ProgramFiles(x86)", r"C:\\Program Files (x86)"), "Wireshark", "tshark.exe"),
            ]
            tshark = next((item for item in candidates if os.path.isfile(item)), None)
        if not tshark:
            self.send_json(503, {"error": "Wireshark tshark was not found. Install Wireshark with the command-line tools option."})
            return
        try:
            result = subprocess.run(
                [tshark, "-r", path, "-Y", "eapol", "-T", "fields",
                 "-e", "frame.number", "-e", "wlan.sa", "-e", "wlan.da", "-e", "eapol.type"],
                capture_output=True, text=True, encoding="utf-8", errors="replace",
                timeout=60, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
            )
        except subprocess.TimeoutExpired:
            self.send_json(504, {"error": "Capture analysis timed out. Try a smaller capture."})
            return
        if result.returncode != 0:
            detail = (result.stderr or "Wireshark could not parse this capture.").strip()
            self.send_json(422, {"error": detail[-400:]})
            return
        frames = []
        key_frames = 0
        for line in result.stdout.splitlines():
            fields = line.split("\t")
            fields += [""] * (4 - len(fields))
            frame_number, source, destination, eapol_type = fields[:4]
            if eapol_type.strip() == "3":
                key_frames += 1
            if len(frames) < 200:
                frames.append({
                    "frame": frame_number,
                    "source": source or "Not exposed by this link type",
                    "destination": destination or "Not exposed by this link type",
                    "eapol_type": eapol_type or "Unknown",
                })
        self.send_json(200, {
            "filename": name,
            "eapol_frames": len(result.stdout.splitlines()),
            "eapol_key_frames": key_frames,
            "frames": frames,
            "truncated": len(result.stdout.splitlines()) > 200,
            "message": "EAPOL frame summary only. Key frames are not proof of a complete four-way handshake; no packet payloads or passwords were extracted."
        })

    def list_capture_archive(self):
        """List only Airgorah-generated PCAPNG files; do not expose arbitrary paths."""
        try:
            os.makedirs(CAPTURE_DIR, exist_ok=True)
            files = []
            for name in os.listdir(CAPTURE_DIR):
                if not re.fullmatch(r"airgorah_capture_[0-9]{8}_[0-9]{6}_[0-9]{6}\.pcapng", name):
                    continue
                path = os.path.join(CAPTURE_DIR, name)
                if not os.path.isfile(path):
                    continue
                stat = os.stat(path)
                files.append({
                    "filename": name,
                    "size_bytes": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
                })
            files.sort(key=lambda item: item["created_at"], reverse=True)
            self.send_json(200, {"captures": files[:100], "total": len(files)})
        except OSError as exc:
            self.send_json(500, {"error": str(exc)[:250]})

    def capture_interfaces(self):
        try:
            self.send_json(200, {"interfaces": list_capture_interfaces()})
        except Exception as exc:
            self.send_json(503, {"error": str(exc)})

    def capture_status(self):
        payload = _capture_snapshot_locked()
        if not payload["available"]:
            payload["error"] = "Windows pktmon was not found. This feature requires supported Windows 10/11."
        self.send_json(200, payload)

    def start_capture(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 4096:
                self.send_json(400, {"error": "Invalid capture start request."})
                return
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            if not isinstance(payload, dict) or payload.get("interface_id") != "all":
                self.send_json(400, {"error": "Select the Windows Packet Monitor adapter scope."})
                return
            pktmon = find_pktmon()
            if not pktmon:
                self.send_json(503, {"error": "Windows pktmon is unavailable."})
                return
            with CAPTURE_LOCK:
                if CAPTURE_STATE.get("running"):
                    self.send_json(409, {"error": "A packet capture is already running. Stop it first."})
                    return
                os.makedirs(CAPTURE_DIR, exist_ok=True)
                stamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                filename = "airgorah_capture_" + stamp + ".pcapng"
                file_path = os.path.join(CAPTURE_DIR, filename)
                etl_path = os.path.join(CAPTURE_DIR, "airgorah_capture_" + stamp + ".etl")
                command = [pktmon, "start", "--capture", "--comp", "nics", "--pkt-size", "0",
                           "--file-name", etl_path, "--file-size", "100", "--log-mode", "circular"]
                result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8",
                                        errors="replace", timeout=20,
                                        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                output = (result.stdout or "") + "
" + (result.stderr or "")
                if result.returncode != 0:
                    detail = output.strip()[-500:]
                    if re.search(r"administrator|elevat|access is denied|requires elevation", detail, re.I):
                        detail = "Windows requires administrator permission. Close Airgorah, run start-local.bat as administrator, and approve the UAC prompt. " + detail
                    self.send_json(503, {"error": "Windows Packet Monitor could not start. " + detail})
                    return
                CAPTURE_STATE.update({
                    "process": None, "log_handle": None, "log_path": None,
                    "started_at": time.time(), "file_path": file_path, "etl_path": etl_path,
                    "filename": filename, "interface_name": "All physical network adapters",
                    "packet_count": None, "elapsed_seconds": 0, "engine": "pktmon", "running": True,
                })
                result_payload = _capture_snapshot_locked()
            result_payload["message"] = "Airgorah's built-in Windows Packet Monitor started. Capturing packets visible at Windows network adapters."
            self.send_json(200, result_payload)
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
            self.send_json(400, {"error": "Invalid JSON capture request."})
        except Exception as exc:
            self.send_json(500, {"error": str(exc)[:350]})

    def stop_capture(self):
        try:
            with CAPTURE_LOCK:
                if not CAPTURE_STATE.get("running"):
                    result_payload = _capture_snapshot_locked()
                    result_payload["message"] = "No capture is currently running."
                    self.send_json(200, result_payload)
                    return
                pktmon = find_pktmon()
                etl_path = CAPTURE_STATE.get("etl_path")
                file_path = CAPTURE_STATE.get("file_path")
                stopped = subprocess.run([pktmon, "stop"], capture_output=True, text=True,
                                          encoding="utf-8", errors="replace", timeout=30,
                                          creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                if stopped.returncode != 0:
                    detail = ((stopped.stderr or "") + " " + (stopped.stdout or "")).strip()[-400:]
                    self.send_json(500, {"error": "Windows Packet Monitor could not stop cleanly. " + detail})
                    return
                CAPTURE_STATE["running"] = False
                CAPTURE_STATE["elapsed_seconds"] = max(0, int(time.time() - (CAPTURE_STATE.get("started_at") or time.time())))
                if not etl_path or not os.path.isfile(etl_path):
                    self.send_json(500, {"error": "Packet Monitor stopped but its ETL file was not found."})
                    return
                converted = subprocess.run([pktmon, "etl2pcap", etl_path, "--out", file_path],
                                           capture_output=True, text=True, encoding="utf-8",
                                           errors="replace", timeout=120,
                                           creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                if converted.returncode != 0 or not os.path.isfile(file_path):
                    detail = ((converted.stderr or "") + " " + (converted.stdout or "")).strip()[-400:]
                    self.send_json(500, {"error": "Capture stopped, but PCAPNG conversion failed. Original ETL retained at " + str(etl_path) + ". " + detail})
                    return
                try:
                    os.remove(etl_path)
                except OSError:
                    pass
                tshark = shutil.which("tshark")
                if tshark:
                    try:
                        info = subprocess.run([tshark, "-r", file_path, "-T", "fields", "-e", "frame.number"],
                                              capture_output=True, text=True, encoding="utf-8",
                                              errors="replace", timeout=30,
                                              creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                        if info.returncode == 0:
                            CAPTURE_STATE["packet_count"] = len([line for line in info.stdout.splitlines() if line.strip()])
                    except Exception:
                        pass
                result_payload = _capture_snapshot_locked()
                result_payload["message"] = "Capture stopped and saved as PCAPNG by Airgorah's built-in Windows Packet Monitor engine."
            self.send_json(200, result_payload)
        except Exception as exc:
            self.send_json(500, {"error": str(exc)[:350]})

    def download_capture(self):
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        name = params.get("name", [""])[0]
        if not re.fullmatch(r"airgorah_capture_[0-9]{8}_[0-9]{6}_[0-9]{6}\.pcapng", name):
            self.send_json(400, {"error": "Invalid capture filename."})
            return
        path = os.path.join(CAPTURE_DIR, name)
        if not os.path.isfile(path):
            self.send_json(404, {"error": "Capture file not found."})
            return
        try:
            size = os.path.getsize(path)
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Disposition", 'attachment; filename="' + name + '"')
            self.send_header("Content-Length", str(size))
            self.add_cors_headers()
            self.end_headers()
            with open(path, "rb") as handle:
                while True:
                    chunk = handle.read(1024 * 1024)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
        except OSError as exc:
            self.send_json(500, {"error": str(exc)[:250]})

    def do_GET(self):
        if self.path == "/health":
            self.send_json(200, {"ok": True, "service": "Airgorah local Wi-Fi scanner"})
            return
        if self.path == "/api/capture/archive":
            if self.headers.get("Origin", "") not in SAVED_PROFILE_ORIGINS:
                self.send_json(403, {"error": "Capture archive is available only from the local Airgorah app."})
                return
            self.list_capture_archive()
            return
        if self.path == "/api/capture/interfaces":
            if self.headers.get("Origin", "") not in SAVED_PROFILE_ORIGINS:
                self.send_json(403, {"error": "Capture controls are available only from the local Airgorah app."})
                return
            self.capture_interfaces()
            return
        if self.path == "/api/capture/status":
            if self.headers.get("Origin", "") not in SAVED_PROFILE_ORIGINS:
                self.send_json(403, {"error": "Capture status is available only from the local Airgorah app."})
                return
            self.capture_status()
            return
        if self.path.startswith("/api/capture/download?"):
            if self.headers.get("Origin", "") not in SAVED_PROFILE_ORIGINS:
                self.send_json(403, {"error": "Capture downloads are available only from the local Airgorah app."})
                return
            self.download_capture()
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


    def audit_one_handshake_candidate(self, length):
        """Verify exactly one user-supplied candidate against a local capture."""
        if length < 1 or length > 30 * 1024 * 1024:
            self.send_json(400, {"error": "Request too large. Capture files must be 20 MB or smaller."})
            return
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        if not isinstance(payload, dict):
            self.send_json(400, {"error": "Invalid audit request."})
            return
        filename, candidate, encoded = payload.get("filename", ""), payload.get("candidate", ""), payload.get("capture_base64", "")
        bssid = payload.get("bssid", "")
        if not isinstance(filename, str) or os.path.splitext(filename.lower())[1] not in (".cap", ".pcap", ".pcapng"):
            self.send_json(400, {"error": "Choose a .cap, .pcap, or .pcapng capture file."})
            return
        if not isinstance(candidate, str) or not (8 <= len(candidate.encode("utf-8")) <= 63 or re.fullmatch(r"[0-9a-fA-F]{64}", candidate)):
            self.send_json(400, {"error": "Enter one WPA passphrase (8–63 UTF-8 bytes) or a 64-character hexadecimal key."})
            return
        if not isinstance(encoded, str) or not encoded:
            self.send_json(400, {"error": "The capture file is empty or unreadable."})
            return
        if bssid and (not isinstance(bssid, str) or not re.fullmatch(r"(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}", bssid)):
            self.send_json(400, {"error": "BSSID must use the format AA:BB:CC:DD:EE:FF."})
            return
        aircrack = shutil.which("aircrack-ng")
        if not aircrack:
            self.send_json(503, {"error": "Aircrack-ng was not found. Install it on this Windows PC, add aircrack-ng.exe to PATH, then restart start-local.bat."})
            return
        try:
            capture = base64.b64decode(encoded, validate=True)
        except (ValueError, binascii.Error):
            self.send_json(400, {"error": "The uploaded capture data is not valid Base64."})
            return
        if not capture or len(capture) > 20 * 1024 * 1024:
            self.send_json(400, {"error": "Capture file must be between 1 byte and 20 MB."})
            return
        with tempfile.TemporaryDirectory(prefix="airgorah-audit-") as temp_dir:
            capture_path = os.path.join(temp_dir, "capture" + os.path.splitext(filename.lower())[1])
            candidate_path = os.path.join(temp_dir, "candidate.txt")
            with open(capture_path, "wb") as handle:
                handle.write(capture)
            with open(candidate_path, "w", encoding="utf-8", newline="") as handle:
                handle.write(candidate + "\n")
            command = [aircrack, "-a", "2"]
            if bssid:
                command.extend(["-b", bssid])
            command.extend(["-w", candidate_path, capture_path])
            try:
                result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=60, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
            except subprocess.TimeoutExpired:
                self.send_json(504, {"status": "timeout", "message": "Audit timed out. Check that the capture is valid and contains the relevant WPA handshake."})
                return
            output = (result.stdout or "") + "\\n" + (result.stderr or "")
            upper = output.upper()
            if "KEY FOUND!" in upper:
                self.send_json(200, {"status": "match", "message": "PASSWORD MATCH: this candidate matches the WPA handshake in the selected capture."})
            elif "NO VALID WPA HANDSHAKES" in upper or "NO WPA HANDSHAKE" in upper:
                self.send_json(200, {"status": "invalid_capture", "message": "No usable WPA handshake was found for this target. This is not a password mismatch."})
            elif "KEY NOT FOUND" in upper or "PASSphrase NOT IN DICTIONARY".upper() in upper:
                self.send_json(200, {"status": "no_match", "message": "PASSWORD DOES NOT MATCH: the tested candidate did not match this handshake."})
            else:
                detail = output.strip().splitlines()[-1] if output.strip() else "Aircrack-ng returned no diagnostic output."
                self.send_json(422, {"status": "indeterminate", "message": "Could not verify the candidate. Check the capture format, handshake, target BSSID, and Aircrack-ng installation. " + detail[:200]})

    def do_POST(self):
        if self.path == "/api/capture/analyze":
            if self.headers.get("Origin", "") not in SAVED_PROFILE_ORIGINS:
                self.send_json(403, {"error": "Capture analysis is available only from the local Airgorah app."})
                return
            try:
                length = int(self.headers.get("Content-Length", "0"))
                self.analyze_saved_capture(length)
            except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
                self.send_json(400, {"error": "Invalid JSON analysis request."})
            except Exception as exc:
                self.send_json(500, {"error": str(exc)[:350]})
            return
        if self.path in ("/api/capture/start", "/api/capture/stop"):
            if self.headers.get("Origin", "") not in SAVED_PROFILE_ORIGINS:
                self.send_json(403, {"error": "Capture controls are available only from the local Airgorah app."})
                return
            if self.path == "/api/capture/start":
                self.start_capture()
            else:
                self.stop_capture()
            return
        if self.path not in ("/api/saved-profile-password", "/api/handshake-audit"):
            self.send_json(404, {"error": "Not found"})
            return
        if self.headers.get("Origin", "") not in SAVED_PROFILE_ORIGINS:
            self.send_json(403, {"error": "This local security audit is available only from the local Airgorah app."})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if self.path == "/api/handshake-audit":
                self.audit_one_handshake_candidate(length)
                return
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
