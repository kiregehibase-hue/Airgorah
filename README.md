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


## Built-in packet capture (Windows 10/11)

Airgorah now uses Windows Packet Monitor (`pktmon`), an in-box Windows packet-capture utility. The capture workflow does not require Npcap, Wireshark, or `dumpcap`. Windows writes a temporary ETL capture, and Airgorah converts it to PCAPNG when you stop the session.

### Use packet capture

1. Download and extract the repository on the Windows 10/11 computer.
2. Run `start-local.bat` and keep the local helper and Vite terminal windows open.
3. If Windows reports that capture needs elevation, close Airgorah and run `start-local.bat` using **Run as administrator**, then approve the UAC prompt.
4. Open `http://127.0.0.1:5173` and scroll to **Passive Packet Capture**.
5. Choose **Detect interfaces**. The built-in engine captures at Windows physical network-adapter components.
6. Choose **Start capture**, generate the traffic you want to diagnose on your own PC or an authorized network, then choose **Stop capture**.
7. Airgorah converts the ETL log to a PCAPNG file in the local `captures` folder. Download it from the capture panel or open it with a PCAPNG-compatible analyzer.

The capture buffer is limited to 100 MB in circular mode; it overwrites the oldest buffered data when full. Stop the capture to finalize the PCAPNG file. The local API binds only to `127.0.0.1:8765` and capture controls are restricted to local app origins. GitHub Pages cannot access the local Windows packet-capture service.

**Limitations:** This is Windows network-stack capture, not 802.11 monitor mode. It records packets visible at the selected Windows network-stack capture points; it does not collect nearby devices' over-the-air Wi-Fi frames or guarantee visibility into every device's traffic. It is not a replacement for a monitor-mode adapter, router capture, or managed switch mirror. Captures may contain private network metadata or content; store and share them carefully. Packet count display after conversion requires Wireshark's optional `tshark` command-line utility.


## Defensive capture analysis and audit reports

After stopping a local capture, choose **Analyze handshake traffic** in Passive Packet Capture. When Wireshark's `tshark` is installed, Airgorah reports EAPOL metadata and counts visible 802.11 deauthentication, disassociation, beacon, and probe-response frames. This is passive triage only: elevated deauthentication counts are not proof of malicious activity. Windows Packet Monitor commonly captures network-stack/Ethernet frames rather than raw 802.11 management traffic; a zero count can mean those frames were not visible in that file.

The Live Wi-Fi Security Audit highlights repeated SSIDs across multiple BSSIDs as an observation and exports a JSON report. Multiple BSSIDs are normal for mesh and multi-AP deployments; verify them against a trusted access-point inventory before drawing conclusions. No active probing, packet injection, disconnection, rogue AP creation, credential collection, or password cracking is performed.
