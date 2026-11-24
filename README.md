# Airgorah

Airgorah is a React + TypeScript interface for exploring Wi-Fi security concepts. The included scanner and Attack Lab are **local simulations**: they generate demo data and synthetic event logs only. They do not access wireless adapters, transmit management frames, disconnect devices, create rogue access points, capture handshakes, or collect credentials.

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
