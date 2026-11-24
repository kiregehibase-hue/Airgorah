# Airgorah

Airgorah is a React + TypeScript interface for exploring Wi-Fi security concepts. The web interface includes a demo scanner and a separate Windows-only local scanner helper for read-only nearby Wi-Fi discovery. The Attack Lab remains a non-transmitting simulation; it does not send disruptive frames, disconnect devices, create rogue access points, capture handshakes, or collect credentials.

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
