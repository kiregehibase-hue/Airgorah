import { useState } from 'react';
import { motion } from 'framer-motion';

type ProfileResponse = { profiles?: string[]; error?: string };
type PasswordResponse = { profile?: string; password?: string | null; error?: string };

export default function PasswordSecurityLab() {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [savedPassword, setSavedPassword] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [testPassword, setTestPassword] = useState('');
  const [handshakeFile, setHandshakeFile] = useState<File | null>(null);
  const [handshakeCandidate, setHandshakeCandidate] = useState('');
  const [handshakeBssid, setHandshakeBssid] = useState('');
  const [auditStatus, setAuditStatus] = useState('');
  const [auditBusy, setAuditBusy] = useState(false);

  const loadProfiles = async () => {
    setLoadingProfiles(true);
    setProfileStatus('');
    setSavedPassword('');
    try {
      const response = await fetch('http://127.0.0.1:8765/api/saved-profiles', { cache: 'no-store' });
      const payload = await response.json() as ProfileResponse;
      if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status);
      setProfiles(payload.profiles || []);
      setSelectedProfile((payload.profiles || [])[0] || '');
      setProfileStatus(payload.profiles?.length ? 'Saved Windows Wi-Fi profiles loaded.' : 'No saved Wi-Fi profiles were found.');
    } catch (error) {
      setProfileStatus(error instanceof Error ? error.message : 'Could not reach the local scanner. Start start-local.bat on this PC.');
    } finally {
      setLoadingProfiles(false);
    }
  };

  const revealSavedPassword = async () => {
    if (!selectedProfile) return;
    setRevealing(true);
    setSavedPassword('');
    setProfileStatus('');
    try {
      const response = await fetch('http://127.0.0.1:8765/api/saved-profile-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: selectedProfile }),
        cache: 'no-store',
      });
      const payload = await response.json() as PasswordResponse;
      if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status);
      if (payload.password) {
        setSavedPassword(payload.password);
        setProfileStatus('Password retrieved from this Windows PC’s saved profile.');
      } else {
        setProfileStatus('Windows has no readable saved password for this profile.');
      }
    } catch (error) {
      setProfileStatus(error instanceof Error ? error.message : 'Could not retrieve this saved profile.');
    } finally {
      setRevealing(false);
    }
  };

  const auditHandshake = async () => {
    if (!handshakeFile || !handshakeCandidate) { setAuditStatus('Choose a capture file and enter one candidate password.'); return; }
    setAuditBusy(true); setAuditStatus('Checking one candidate locally…');
    try {
      const encoded = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read the capture file.'));
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.readAsDataURL(handshakeFile);
      });
      const response = await fetch('http://127.0.0.1:8765/api/handshake-audit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: handshakeFile.name, capture_base64: encoded, candidate: handshakeCandidate, bssid: handshakeBssid.trim() }),
        cache: 'no-store',
      });
      const payload = await response.json() as { status?: string; message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status);
      setAuditStatus(payload.message || payload.status || 'Audit completed.');
    } catch (error) { setAuditStatus(error instanceof Error ? error.message : 'The local audit could not be completed.'); }
    finally { setAuditBusy(false); }
  };

  const strength = (() => {
    if (!testPassword) return { score: 0, label: 'Enter a password to test', color: 'bg-gray-600' };
    let score = 0;
    if (testPassword.length >= 12) score++;
    if (testPassword.length >= 16) score++;
    if (/[a-z]/.test(testPassword) && /[A-Z]/.test(testPassword)) score++;
    if (/\d/.test(testPassword)) score++;
    if (/[^A-Za-z0-9]/.test(testPassword)) score++;
    if (/(.)\1{2,}|1234|password|qwerty/i.test(testPassword)) score = Math.max(0, score - 2);
    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
    const colors = ['bg-red-500', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-green-400'];
    return { score, label: labels[score], color: colors[score] };
  })();

  return (
    <section id="password-lab" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">Local credential recovery</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Wi-Fi Password Recovery &amp; Security Lab</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">View credentials already saved in your own Windows user profile and assess password strength locally. This does not recover passwords from nearby networks you have never joined.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-[#0d0d15] border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-2.5 text-white">🔑</div>
              <div><h3 className="text-white font-semibold">Saved Wi-Fi password recovery</h3><p className="text-xs text-gray-500">This Windows PC · local only</p></div>
            </div>
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-200/80 mb-5">Only profiles saved under your current Windows account are available. Passwords are requested only when you press Reveal and are not stored by Airgorah.</div>
            <button onClick={loadProfiles} disabled={loadingProfiles} className="px-4 py-2.5 rounded-lg bg-cyan-500/15 border border-cyan-400/20 text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-50 text-sm font-medium">{loadingProfiles ? 'Loading profiles…' : 'Load saved Wi-Fi profiles'}</button>
            {profiles.length > 0 && <div className="mt-5">
              <label className="block text-xs text-gray-400 mb-2" htmlFor="saved-wifi-profile">Saved network profile</label>
              <select id="saved-wifi-profile" value={selectedProfile} onChange={e => { setSelectedProfile(e.target.value); setSavedPassword(''); }} className="w-full rounded-lg bg-black/40 border border-white/10 text-white px-3 py-3 text-sm">
                {profiles.map(profile => <option key={profile} value={profile} className="bg-[#0d0d15]">{profile}</option>)}
              </select>
              <button onClick={revealSavedPassword} disabled={!selectedProfile || revealing} className="mt-3 px-4 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-50 text-sm font-medium">{revealing ? 'Checking Windows profile…' : 'Reveal saved password'}</button>
            </div>}
            {savedPassword && <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
              <div className="text-xs text-emerald-300 mb-2">Saved password · visible on this device</div>
              <code className="block text-white break-all select-all">{savedPassword}</code>
            </div>}
            {profileStatus && <p className="mt-4 text-xs text-gray-300 break-words" role="status">{profileStatus}</p>}
          </div>

          <div className="rounded-2xl bg-[#0d0d15] border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 text-white">🛡️</div>
              <div><h3 className="text-white font-semibold">Password strength tester</h3><p className="text-xs text-gray-500">Runs locally in your browser</p></div>
            </div>
            <label className="block text-xs text-gray-400 mb-2" htmlFor="airgorah-password-test">Enter a password you own or a sample password</label>
            <input id="airgorah-password-test" type="password" autoComplete="off" value={testPassword} onChange={e => setTestPassword(e.target.value)} placeholder="Type a sample password" className="w-full rounded-lg bg-black/40 border border-white/10 text-white px-3 py-3 text-sm outline-none focus:border-purple-400/50" />
            <div className="mt-4 flex items-center justify-between text-xs"><span className="text-gray-400">Estimated strength</span><span className="text-white font-semibold">{strength.label}</span></div>
            <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden"><div className={'h-full ' + strength.color + ' transition-all'} style={{ width: ((strength.score / 5) * 100) + '%' }} /></div>
            <ul className="mt-5 space-y-2 text-xs text-gray-400">
              <li>• Prefer 16+ characters and unique random passphrases.</li>
              <li>• Avoid names, dates, common words and reused passwords.</li>
              <li>• Use WPA3-Personal or WPA2-AES where supported.</li>
            </ul>
            <p className="mt-4 text-[11px] text-gray-500">This is a simple local heuristic, not a guarantee of crack time. The entered value is not sent to a server or saved.</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#0d0d15] border border-cyan-400/15 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 text-white">🧪</div>
            <div><h3 className="text-white font-semibold">WPA handshake password auditor</h3><p className="text-xs text-gray-500">One candidate · local Windows helper · no wordlists</p></div>
          </div>
          <p className="text-sm text-gray-400 mb-4">Select a genuine capture from your own network and test one password you already know or suspect. Airgorah checks only this candidate; it does not run dictionary or bulk password attempts.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-xs text-gray-400">Capture file (.cap, .pcap, .pcapng)
              <input type="file" accept=".cap,.pcap,.pcapng" onChange={e => { setHandshakeFile(e.target.files?.[0] || null); setAuditStatus(''); }} className="mt-2 block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/15 file:px-3 file:py-2 file:text-cyan-200" />
            </label>
            <label className="text-xs text-gray-400">One candidate WPA/WPA2 password
              <input type="password" autoComplete="off" value={handshakeCandidate} onChange={e => setHandshakeCandidate(e.target.value)} placeholder="Enter one candidate" className="mt-2 w-full rounded-lg bg-black/40 border border-white/10 text-white px-3 py-3 text-sm" />
            </label>
            <label className="text-xs text-gray-400 md:col-span-2">Target BSSID (optional, recommended)
              <input value={handshakeBssid} onChange={e => setHandshakeBssid(e.target.value)} placeholder="AA:BB:CC:DD:EE:FF" className="mt-2 w-full rounded-lg bg-black/40 border border-white/10 text-white px-3 py-3 text-sm" />
            </label>
          </div>
          <button onClick={auditHandshake} disabled={auditBusy || !handshakeFile || !handshakeCandidate} className="mt-4 px-4 py-2.5 rounded-lg bg-cyan-500/15 border border-cyan-400/20 text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-50 text-sm font-medium">{auditBusy ? 'Auditing locally…' : 'Check this candidate'}</button>
          {auditStatus && <p className="mt-4 rounded-lg bg-black/30 p-3 text-sm text-gray-200 break-words" role="status">{auditStatus}</p>}
          <p className="mt-3 text-[11px] text-gray-500">Requires Aircrack-ng installed and available on PATH on this Windows PC. The uploaded capture and single candidate are processed by the loopback helper in temporary files, then deleted. Only audit networks you own or are authorized to test.</p>
        </div>
      </div>
    </section>
  );
}
