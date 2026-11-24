import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type CaptureInterface = { id: string; name: string };
type CaptureStatus = {
  available?: boolean;
  engine?: string;
  running?: boolean;
  interface_name?: string;
  filename?: string;
  elapsed_seconds?: number;
  file_bytes?: number;
  packet_count?: number | null;
  error?: string;
  message?: string;
};
const API = 'http://127.0.0.1:8765';

export default function CaptureLab() {
  const [interfaces, setInterfaces] = useState<CaptureInterface[]>([]);
  const [selected, setSelected] = useState('');
  const [status, setStatus] = useState<CaptureStatus>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState<{ eapol_frames: number; eapol_key_frames: number; deauth_frames?: number; disassoc_frames?: number; beacon_frames?: number; probe_response_frames?: number; management_visibility?: string; message?: string; error?: string } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [archive, setArchive] = useState<Array<{ filename: string; size_bytes: number; created_at: string }>>([]);
  const [archiveMessage, setArchiveMessage] = useState('');

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(API + '/api/capture/status', { cache: 'no-store' });
      const data = await response.json() as CaptureStatus;
      setStatus(data);
    } catch {
      setStatus({ available: false, error: 'Local helper is not running. Start start-local.bat on this PC.' });
    }
  }, []);

  const loadInterfaces = useCallback(async () => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(API + '/api/capture/interfaces', { cache: 'no-store' });
      const data = await response.json() as { interfaces?: CaptureInterface[]; error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not list capture interfaces.');
      setInterfaces(data.interfaces || []);
      setSelected(current => current || data.interfaces?.[0]?.id || '');
      setMessage(data.interfaces?.length ? 'Windows Packet Monitor is ready. Capture only on devices and networks you are authorized to monitor.' : 'No capture interfaces were reported.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not reach the local capture service.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 2000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const loadArchive = async () => {
    setArchiveMessage('Loading saved captures…');
    try {
      const response = await fetch(API + '/api/capture/archive', { cache: 'no-store' });
      const data = await response.json() as { captures?: Array<{ filename: string; size_bytes: number; created_at: string }>; error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not load capture archive.');
      setArchive(data.captures || []);
      setArchiveMessage((data.captures || []).length ? 'Saved local packet captures.' : 'No saved captures yet. Start and stop a capture to create one.');
    } catch (error) {
      setArchiveMessage(error instanceof Error ? error.message : 'Could not load capture archive.');
    }
  };

  const analyzeCapture = async () => {
    if (!status.filename || status.running) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const response = await fetch(API + '/api/capture/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: status.filename }),
        cache: 'no-store',
      });
      const data = await response.json() as { eapol_frames?: number; eapol_key_frames?: number; deauth_frames?: number; disassoc_frames?: number; beacon_frames?: number; probe_response_frames?: number; management_visibility?: string; message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || 'Capture analysis failed.');
      setAnalysis({ eapol_frames: data.eapol_frames || 0, eapol_key_frames: data.eapol_key_frames || 0, deauth_frames: data.deauth_frames || 0, disassoc_frames: data.disassoc_frames || 0, beacon_frames: data.beacon_frames || 0, probe_response_frames: data.probe_response_frames || 0, management_visibility: data.management_visibility, message: data.message });
    } catch (error) {
      setAnalysis({ eapol_frames: 0, eapol_key_frames: 0, error: error instanceof Error ? error.message : 'Capture analysis failed.' });
    } finally {
      setAnalyzing(false);
    }
  };

  const startCapture = async () => {
    if (!selected) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(API + '/api/capture/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interface_id: selected }), cache: 'no-store',
      });
      const data = await response.json() as CaptureStatus;
      if (!response.ok) throw new Error(data.error || 'Could not start capture.');
      setStatus(data);
      setMessage(data.message || 'Capture started.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Capture could not be started.');
    } finally { setBusy(false); }
  };

  const stopCapture = async () => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(API + '/api/capture/stop', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: '{}', cache: 'no-store',
      });
      const data = await response.json() as CaptureStatus;
      if (!response.ok) throw new Error(data.error || 'Could not stop capture.');
      setStatus(data);
      setMessage(data.message || 'Capture stopped.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Capture could not be stopped.');
    } finally { setBusy(false); }
  };

  const bytes = status.file_bytes || 0;
  const sizeLabel = bytes >= 1024 * 1024 ? (bytes / (1024 * 1024)).toFixed(2) + ' MB' : (bytes / 1024).toFixed(1) + ' KB';

  return (
    <section id="capture" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">Built-in Windows Packet Monitor · no Npcap required</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Passive Packet Capture</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Capture packets visible at Windows network adapters using the built-in Packet Monitor. Save PCAPNG files locally without Npcap or Wireshark. No packet injection or network disruption.</p>
        </motion.div>

        <div className="rounded-2xl bg-[#0d0d15] border border-cyan-400/15 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 text-white">◉</div>
              <div><h3 className="text-white font-semibold">Local capture engine</h3><p className="text-xs text-gray-500">Windows pktmon · loopback API only</p></div>
            </div>
            <span className={'text-xs px-3 py-1.5 rounded-full border ' + (status.running ? 'bg-red-500/10 border-red-400/30 text-red-300' : 'bg-white/5 border-white/10 text-gray-400')}>
              {status.running ? '● CAPTURING' : '○ STOPPED'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-100/80 mb-5">
            Capture only on your own device or networks you are authorized to monitor. Packet files may contain private metadata or content. This engine captures at Windows network adapters; it does not provide Wi-Fi monitor mode or collect nearby devices' over-the-air traffic.
          </div>

          <div className="grid md:grid-cols-[1fr_auto_auto] gap-3 items-end">
            <label className="text-xs text-gray-400">Capture scope
              <select value={selected} disabled={status.running || busy} onChange={e => setSelected(e.target.value)} className="mt-2 w-full rounded-lg bg-black/40 border border-white/10 text-white px-3 py-3 text-sm">
                {interfaces.length === 0 && <option value="">Detect Windows Packet Monitor</option>}
                {interfaces.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <button onClick={loadInterfaces} disabled={busy || status.running} className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 disabled:opacity-50 text-sm">{busy ? 'Please wait…' : 'Detect interfaces'}</button>
            {!status.running ? (
              <button onClick={startCapture} disabled={busy || !selected} className="px-5 py-3 rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-50 text-sm font-semibold">Start capture</button>
            ) : (
              <button onClick={stopCapture} disabled={busy} className="px-5 py-3 rounded-lg bg-red-500/15 border border-red-400/30 text-red-200 hover:bg-red-500/25 disabled:opacity-50 text-sm font-semibold">Stop capture</button>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-5">
            <div className="rounded-xl bg-black/30 border border-white/5 p-4"><div className="text-xs text-gray-500 mb-1">Elapsed</div><div className="text-xl text-white font-semibold tabular-nums">{Math.floor(status.elapsed_seconds || 0)} sec</div></div>
            <div className="rounded-xl bg-black/30 border border-white/5 p-4"><div className="text-xs text-gray-500 mb-1">Capture file size</div><div className="text-xl text-white font-semibold">{sizeLabel}</div></div>
            <div className="rounded-xl bg-black/30 border border-white/5 p-4"><div className="text-xs text-gray-500 mb-1">Packets captured</div><div className="text-xl text-white font-semibold">{status.packet_count == null ? (status.running ? 'Live · see file growth' : '—') : status.packet_count.toLocaleString()}</div></div>
          </div>

          {status.filename && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-400/20 flex flex-wrap items-center justify-between gap-3">
              <div><div className="text-xs text-emerald-300 mb-1">Saved capture</div><code className="text-sm text-gray-200 break-all">{status.filename}</code></div>
              {!status.running && <a href={API + '/api/capture/download?name=' + encodeURIComponent(status.filename)} className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 text-sm">Download PCAPNG</a>}
            </div>
          )}
          {status.filename && !status.running && (
            <div className="mt-4">
              <button onClick={analyzeCapture} disabled={analyzing} className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-200 text-sm disabled:opacity-50">
                {analyzing ? 'Analyzing EAPOL frames…' : 'Analyze handshake traffic'}
              </button>
              {analysis && (
                <div className="mt-3 rounded-xl bg-black/30 border border-white/5 p-4 text-sm">
                  {analysis.error ? <p className="text-amber-200">{analysis.error}</p> : <>
                    <div className="grid grid-cols-2 gap-3">
                      <div><div className="text-xs text-gray-500">EAPOL frames</div><div className="text-xl text-white font-semibold">{analysis.eapol_frames}</div></div>
                      <div><div className="text-xs text-gray-500">EAPOL-Key frames</div><div className="text-xl text-white font-semibold">{analysis.eapol_key_frames}</div></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      <div><div className="text-xs text-gray-500">Deauth frames</div><div className="text-lg text-amber-200 font-semibold">{analysis.deauth_frames ?? '—'}</div></div>
                      <div><div className="text-xs text-gray-500">Disassociation</div><div className="text-lg text-amber-200 font-semibold">{analysis.disassoc_frames ?? '—'}</div></div>
                      <div><div className="text-xs text-gray-500">Beacons</div><div className="text-lg text-white font-semibold">{analysis.beacon_frames ?? '—'}</div></div>
                      <div><div className="text-xs text-gray-500">Probe responses</div><div className="text-lg text-white font-semibold">{analysis.probe_response_frames ?? '—'}</div></div>
                    </div>
                    {analysis.management_visibility && <p className="mt-3 text-xs text-gray-500">{analysis.management_visibility}</p>}
                    <p className="mt-3 text-xs text-gray-400">{analysis.message}</p>
                  </>}
                </div>
              )}
            </div>
          )}
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h4 className="text-white font-semibold">Packet capture archive</h4><p className="text-xs text-gray-500">Saved PCAPNG files on this Windows PC · latest 100</p></div>
              <button onClick={loadArchive} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-xs hover:bg-white/10">Refresh archive</button>
            </div>
            {archiveMessage && <p className="mt-3 text-xs text-gray-400" role="status">{archiveMessage}</p>}
            {archive.length > 0 && <div className="mt-3 space-y-2">
              {archive.map(item => (
                <div key={item.filename} className="rounded-lg bg-black/30 border border-white/5 p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0"><code className="text-xs text-gray-200 break-all">{item.filename}</code><p className="mt-1 text-[11px] text-gray-500">{new Date(item.created_at).toLocaleString()} · {(item.size_bytes / (1024 * 1024)).toFixed(2)} MB</p></div>
                  <a href={API + '/api/capture/download?name=' + encodeURIComponent(item.filename)} className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-200 text-xs">Download</a>
                </div>
              ))}
            </div>}
          </div>
          {message && <p className="mt-4 text-sm text-gray-300 break-words" role="status">{message}</p>}
          {status.error && <p className="mt-4 text-sm text-amber-200 break-words" role="alert">{status.error}</p>}
          <p className="mt-4 text-[11px] text-gray-500">Uses Windows Packet Monitor (pktmon), included with supported Windows 10/11. Npcap and Wireshark are not required for capture. Windows may require administrator permission; if capture is denied, close Airgorah and run start-local.bat as administrator. The ETL buffer is limited to 100 MB in circular mode; stop the capture to convert it to PCAPNG in the local <code>captures</code> folder. This captures traffic visible at the PC's network stack, not 802.11 monitor-mode frames or all traffic from every device. The hosted GitHub Pages site cannot access this local service; run Airgorah locally.</p>
        </div>
      </div>
    </section>
  );
}
