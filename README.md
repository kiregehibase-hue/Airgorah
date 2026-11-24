# Airgorah

Airgorah is a React + TypeScript interface for exploring Wi-Fi security concepts. The web interface includes a demo scanner, a Windows-only local helper for read-only nearby Wi-Fi discovery, and a local password recovery lab for viewing credentials already saved in the current Windows user profile. The Attack Lab remains a non-transmitting simulation; it does not send disruptive frames, disconnect devices, create rogue access points, capture handshakes, or collect credentials.

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## GitHub Pages
The repository includes a GitHub Actions workflow for static deployment. In repository Settings → Pages, select **GitHub Actions** as the source. Pushes to `main` trigger the workflow.

## Scope and safety
This is a browser-based frontend only. GitHub Pages cannot host privileged Linux services, wireless drivers, monitor-mode adapters, or background daemons. The Attack Lab intentionally remains a non-transmitting simulation.

## Real-time nearby Wi-Fi scan (Windows 10/11)

The hosted GitHub Pages site cannot access a computer's wireless adapter by itself. For real nearby-network discovery, run the included local helper on the **same Windows computer and browser**:

1. Install Python 3 if it is not already installed: https://www.python.org/downloads/windows/
2. Download this repository (Code → Download ZIP) and extract it.
3. Double-click `start-local-scanner.bat`. If Windows asks about network access, keep the helper restricted to private/local access; it binds only to `127.0.0.1`.
4. Keep the terminal window open.
5. Open https://kiregehibase-hue.github.io/Airgorah/ and select **Real Scan** in the Wi-Fi Scanner section.

The local helper uses Windows' built-in `netsh wlan show networks mode=bssid` command and refreshes the displayed results every five seconds. It reports SSID, BSSID, signal percentage, channel, band estimate, and advertised security type. Hidden SSIDs may be shown as hidden; vendor and connected-client counts are not inferred.

If Real Scan cannot connect, confirm the terminal says the service is running at `http://127.0.0.1:8765`, then refresh the page. The **Demo Scan** button remains available without the helper.

Privacy and scope: the helper listens only on loopback and allows the Airgorah GitHub Pages origin plus local development origins. It performs read-only nearby Wi-Fi discovery; it does not connect to access points, transmit disruptive frames, disconnect clients, capture credentials, or collect handshakes. This helper currently supports Windows 10/11 only.

## Local Wi-Fi password recovery (Windows 10/11)

The **Password Lab** can list Wi-Fi profiles already saved by Windows for the current user and, after the user selects one and presses **Reveal saved password**, ask Windows to display that profile's stored key. It cannot discover or reveal passwords for nearby networks that have never been saved on this PC.

For this feature, run both the local scanner helper and the web app on the same PC:
1. Download and extract the repository ZIP.
2. Double-click `start-local.bat` (or start `local_scanner.py` and the Vite app separately).
3. Keep both terminal windows open.
4. Open `http://127.0.0.1:5173` and scroll to **Password Lab**.
5. Choose **Load saved Wi-Fi profiles**, select one of your saved networks, then choose **Reveal saved password**.

The password endpoint is served only by the loopback helper and accepts requests from the local development origins. Password values are returned only when explicitly requested and are not written to a file or log. The hosted GitHub Pages site cannot access saved Windows profiles; use the local app.

The strength tester runs in the browser and does not send the typed value to the helper. Its score is a simple educational heuristic, not a password-cracking-time estimate.


## Passive packet capture (Windows 10/11)

Airgorah includes an optional local passive packet-capture panel. It uses Wireshark's `dumpcap` utility with Npcap to capture packets visible to one interface selected by the user. It does not inject packets, disconnect devices, perform monitor-mode attacks, or extract credentials or packet payloads.

### Install the capture dependencies

1. Install Npcap from the official page: https://npcap.com/#download
2. Install Wireshark for Windows from https://www.wireshark.org/download.html. The Wireshark installer includes `dumpcap.exe`; keep the Npcap component enabled if the installer offers it.
3. Restart Windows if requested.
4. Start Airgorah with `start-local.bat`. Keep the local helper and Vite terminal windows open.
5. Open `http://127.0.0.1:5173`, then scroll to **Passive Packet Capture**.
6. Choose **Detect interfaces**, select only an interface and traffic you own or are explicitly authorized to monitor, and choose **Start capture**.
7. Choose **Stop capture** to finalize the PCAPNG file. The file is saved in the repository's local `captures` folder; use **Download PCAPNG** to save a copy through the local app.

The capture API binds only to `127.0.0.1:8765` and accepts capture controls only from the local development app. The capture panel is unavailable on the hosted GitHub Pages site because browsers cannot access local Npcap interfaces remotely. Capture files may contain private network metadata or content; protect and delete them when no longer needed. Packet counts are reported after dumpcap finalizes the capture; while capturing, the panel shows elapsed time and file growth.
