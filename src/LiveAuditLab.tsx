import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Network = {
  ssid: string;
  bssid: string;
  signal: number;
  channel: number;
  frequency: string;
  security: string;
};

type ScanResponse = { networks?: Network[]; scanned_at?: string; error?: string };

const API = 'http://127.0.0.1:8765';

function assess(security: string) {
  const value = (security || '').toUpperCase();
  if (value === 'OPEN' || value.includes('WEP')) {
    return { level: 'High risk', detail: 'Open or legacy WEP protection. Use WPA2-AES or WPA3.', style: 'text-red-300 border-red-400/20 bg-red-500/10' };
  }
  if (value === 'WPA' || value.includes('WPA ')) {
    return { level: 'Weak', detail: 'Legacy WPA detected. Upgrade the access point to WPA2-AES or WPA3.', style: 'text-amber-200 border-amber-400/20 bg-amber-500/10' };
  }
  if (value.includes('WPA2')) {
    return { level: 'Good', detail: 'WPA2 detected. Prefer WPA3 where all devices support it.', style: 'text-cyan-200 border-cyan-400/20 bg-cyan-500/10' };
  }
  if (value.includes('WPA3')) {
    return { level: 'Strong', detail: 'WPA3 is advertised by this access point.', style: 'text-emerald-200 border-emerald-400/20 bg-emerald-500/10' };
  }
  return { level: 'Unknown', detail: 'Windows did not report a recognized security mode.', style: 'text-gray-300 border-white/10 bg-white/5' };
}

export default function LiveAuditLab() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [scannedAt, setScannedAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Live monitoring starts automatically. Windows WLAN refreshes the nearby access-point list every 15 seconds.');
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const runAudit = useCallback(async () => {
    setBusy(true);
    setError('');
    setMessage('Scanning nearby Wi-Fi networks using Windows WLAN…');
    try {
      const response = await fetch(API + '/api/scan', { cache: 'no-store' });
      const data = await response.json() as ScanResponse;
      if (!response.ok) throw new Error(data.error || 'The local scanner could not complete the scan.');
      const found = Array.isArray(data.networks) ? data.networks : [];
      setNetworks(found);
      setScannedAt(data.scanned_at || new Date().toISOString());
      setMessage(found.length ? `Live scan complete: ${found.length} access point(s) detected.` : 'Scan completed, but Windows reported no visible access points.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the local scanner. Start start-local.bat on this PC.');
      setMessage('');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    void runAudit();
    const timer = window.setInterval(() => { void runAudit(); }, 15000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, runAudit]);

  const highRisk = networks.filter(n => ['OPEN', 'WEP'].some(v => (n.security || '').toUpperCase().includes(v))).length;
  const weak = networks.filter(n => (n.security || '').toUpperCase() === 'WPA').length;
  const ssidGroups = networks.reduce<Record<string, Network[]>>((groups, network) => {
    const key = (network.ssid || '').trim();
    if (key && key !== '(Hidden network)') (groups[key] ||= []).push(network);
    return groups;
  }, {});
  const repeatedSsids = Object.entries(ssidGroups).filter(([, aps]) => new Set(aps.map(ap => ap.bssid)).size > 1);
  const exportReport = () => {
    const report = {
      application: 'Airgorah', generated_at: new Date().toISOString(), scanned_at: scannedAt,
      scope: 'Nearby access points advertised to this Windows adapter; passive/read-only',
      summary: { access_points: networks.length, open_or_wep: highRisk, legacy_wpa: weak, repeated_ssid_groups: repeatedSsids.length },
      observations: repeatedSsids.map(([ssid, aps]) => ({ ssid, bssids: aps.map(ap => ap.bssid), note: 'Multiple BSSIDs advertise this SSID. This can be normal multi-AP roaming; verify against your known AP inventory.' })),
      access_points: networks
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'airgorah-wifi-audit.json'; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="live-audit" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-emerald-300 mb-3">Live · Read-only · Windows WLAN</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Live Wi-Fi Security Audit</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Assess real nearby access points reported by your Windows Wi-Fi adapter. Updates from your real Windows WLAN adapter every 15 seconds; no network connection attempts or attack traffic are sent.</p>
        </motion.div>

        <div className="rounded-2xl bg-[#0d0d15] border border-emerald-400/15 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-white font-semibold">Local network assessment</h3>
              <p className="text-xs text-gray-500 mt-1">Uses the existing loopback-only Airgorah scanner API</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-300">
                <input type="checkbox" checked={autoRefresh} onChange={event => setAutoRefresh(event.target.checked)} className="accent-emerald-400" />
                Auto-refresh every 15 seconds
              </label>
              {networks.length > 0 && <button onClick={exportReport} className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 text-sm">Export JSON report</button>}
              <button onClick={runAudit} disabled={busy} className="px-5 py-3 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-100 hover:bg-emerald-500/25 disabled:opacity-50 text-sm font-semibold">
                {busy ? 'Scanning…' : 'Run live security audit'}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-black/30 border border-white/5 p-4 mb-5">
            <p className="text-sm text-gray-200" role="status">{message}</p>
            {error && <p className="text-sm text-amber-200 mt-2" role="alert">{error}</p>}
            {scannedAt && <p className="text-xs text-gray-500 mt-2">Scanned: {new Date(scannedAt).toLocaleString()}</p>}
          </div>

          {networks.length > 0 && <>
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              <div className="rounded-xl bg-black/30 border border-white/5 p-4"><p className="text-xs text-gray-500">Access points</p><p className="text-2xl text-white font-semibold">{networks.length}</p></div>
              <div className="rounded-xl bg-black/30 border border-red-400/10 p-4"><p className="text-xs text-gray-500">Open / WEP</p><p className="text-2xl text-red-200 font-semibold">{highRisk}</p></div>
              <div className="rounded-xl bg-black/30 border border-amber-400/10 p-4"><p className="text-xs text-gray-500">Legacy WPA</p><p className="text-2xl text-amber-200 font-semibold">{weak}</p></div>
            </div>

            {repeatedSsids.length > 0 && <div className="rounded-xl bg-amber-500/5 border border-amber-400/20 p-4 mb-5">
              <p className="text-sm text-amber-100 font-semibold">Repeated SSID observations · {repeatedSsids.length}</p>
              <p className="text-xs text-gray-400 mt-1">The same network name is advertised by multiple BSSIDs. This is common in mesh and multi-access-point networks and is not proof of an evil twin. Compare BSSIDs with your trusted access-point inventory.</p>
              <ul className="mt-2 space-y-1">{repeatedSsids.map(([ssid, aps]) => <li key={ssid} className="text-xs text-gray-300"><span className="font-semibold">{ssid}</span> · {aps.length} BSSIDs</li>)}</ul>
            </div>}
            <div className="space-y-3">
              {networks.map((network, index) => {
                const result = assess(network.security);
                return (
                  <div key={network.bssid + '-' + index} className="rounded-xl bg-black/30 border border-white/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white font-semibold break-words">{network.ssid || '(Hidden network)'}</p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">{network.bssid}</p>
                      </div>
                      <span className={'text-xs rounded-full border px-3 py-1.5 ' + result.style}>{result.level}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      <div><p className="text-[11px] text-gray-500">Security</p><p className="text-sm text-gray-200">{network.security || 'Unknown'}</p></div>
                      <div><p className="text-[11px] text-gray-500">Signal</p><p className="text-sm text-gray-200">{network.signal}%</p></div>
                      <div><p className="text-[11px] text-gray-500">Channel</p><p className="text-sm text-gray-200">{network.channel || 'Unknown'}</p></div>
                      <div><p className="text-[11px] text-gray-500">Band estimate</p><p className="text-sm text-gray-200">{network.frequency ? network.frequency + ' GHz' : 'Unknown'}</p></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">{result.detail}</p>
                  </div>
                );
              })}
            </div>
          </>}
          <p className="text-[11px] text-gray-500 mt-5">Security labels are based only on the authentication mode advertised to Windows. They are not proof of exploitability. Run this only where you have permission to assess the environment. The scanner does not send attack frames or collect passwords.</p>
        </div>
      </div>
    </section>
  );
}
