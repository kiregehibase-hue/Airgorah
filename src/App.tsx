import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============ ICONS ============
const Icons = {
  Wifi: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Terminal: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Cpu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Github: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Layers: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Server: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  ),
  Radar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m15.77 16.67 1.56 1.56"/>
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Crosshair: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Stop: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <rect x="5" y="5" width="14" height="14" rx="2"/>
    </svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Skull: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/>
    </svg>
  ),
  Radio: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M4.93 19.07a10 10 0 0 1 0-14.14"/><path d="M7.76 16.24a6 6 0 0 1 0-8.48"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M16.24 7.76a6 6 0 0 1 0 8.48"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Key: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="8" cy="15" r="5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3"/><path d="m18.5 4.5 3 3"/>
    </svg>
  ),
};

// ============ ANIMATED BACKGROUND ============
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }}
        animate={{ x: [0, 100, -50, 0], y: [0, -50, 100, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(80px)' }}
        animate={{ x: [0, -100, 50, 0], y: [0, 50, -100, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ============ NAVIGATION ============
function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Scanner', href: '#scanner' },
    { label: 'Attack Lab', href: '#attack' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Build', href: '#build' },
    { label: 'CI/CD', href: '#pipeline' },
    { label: 'Install', href: '#install' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
            <div className="w-5 h-5"><Icons.Wifi /></div>
          </div>
          <span className="text-lg font-bold text-white">Airgorah</span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">v0.9.0</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a key={l.href} href={l.href} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="https://github.com/martin-olivier/airgorah" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-white/10 transition-all text-sm text-gray-200">
            <div className="w-4 h-4"><Icons.Github /></div>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 text-yellow-400"><Icons.Star /></div>
              4.8k
            </span>
          </a>
          <button onClick={() => setOpen(!open)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 text-white">
            <div className="w-5 h-5">{open ? <Icons.Close /> : <Icons.Menu />}</div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {links.map(l => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ============ HERO ============
function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Open Source WiFi Security Audit
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
            Audit your WiFi with{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              precision
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A modern GTK4 application for capturing PMKID and performing WPA handshake attacks. Built in Rust with a daemon/client architecture.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <a href="#install" className="group px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <div className="w-4 h-4"><Icons.Download /></div>
              Get Started
              <div className="w-4 h-4 group-hover:translate-x-1 transition-transform"><Icons.Arrow /></div>
            </a>
            <a href="https://github.com/martin-olivier/airgorah" target="_blank" rel="noreferrer" className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white font-semibold transition-all flex items-center gap-2">
              <div className="w-4 h-4"><Icons.Github /></div>
              View on GitHub
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'GitHub Stars', value: '4.8k', accent: 'from-yellow-500/20 to-orange-500/20' },
              { label: 'Version', value: 'v0.9.0', accent: 'from-purple-500/20 to-pink-500/20' },
              { label: 'Architectures', value: '2', accent: 'from-cyan-500/20 to-blue-500/20' },
              { label: 'License', value: 'MIT', accent: 'from-green-500/20 to-emerald-500/20' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`relative p-5 rounded-2xl bg-gradient-to-br ${s.accent} border border-white/5 backdrop-blur-sm`}
              >
                <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ FEATURES ============
function Features() {
  const features = [
    {
      icon: <Icons.Lock />,
      title: 'PMKID Capture',
      desc: 'Capture PMKID from access points without any client association. Faster and more reliable than traditional WPA handshakes.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Icons.Shield />,
      title: 'WPA Handshake',
      desc: 'Full support for capturing 4-way WPA/WPA2 handshakes with intelligent deauthentication and targeted client selection.',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: <Icons.Layers />,
      title: 'Wayland & X11',
      desc: 'Native support for both Wayland and X11 display servers. Works seamlessly on modern Linux desktop environments.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Icons.Zap />,
      title: 'GTK4 Interface',
      desc: 'Beautiful, responsive GTK4 interface built with libadwaita. Modern design that feels at home on any Linux desktop.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <Icons.Server />,
      title: 'Daemon Architecture',
      desc: 'Privilege separation through a dedicated daemon. The GUI runs unprivileged while the daemon handles sensitive operations.',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: <Icons.Package />,
      title: 'Multi-Distro',
      desc: 'Native packages for Debian/Ubuntu (.deb), Fedora/RHEL (.rpm), and Arch Linux (.pkg.tar.zst). Plus AUR support.',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-purple-400 mb-3">Features</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Everything you need</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Professional-grade WiFi auditing capabilities wrapped in a modern, user-friendly interface.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} p-2.5 text-white mb-5 shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ WIFI SCANNER ============
type WiFiNetwork = {
  id: string;
  ssid: string;
  bssid: string;
  signal: number;
  channel: number;
  frequency: '2.4' | '5';
  security: 'WPA3' | 'WPA2' | 'WPA' | 'WEP' | 'Open';
  vendor: string;
  clients: number;
};

const SSID_POOL = [
  'Home_Network_5G', 'TP-Link_A7F2', 'NETGEAR-Office', 'xfinitywifi', 'ATT5G-3K9P',
  'Verizon-FiOS-2B4', 'Google-Fi-Guest', 'Starbucks-WiFi', 'Airport_Free_WiFi',
  'Hidden_Network', 'IoT_Devices', 'Printer_HP_Laser', 'SmartHome_Hub',
  'Gaming-PC-Host', 'Neighbor_WiFi', 'FBI_Surveillance_Van', 'Pretty_Fly_For_A_WiFi',
  'Tell_My_WiFi_Love_Her', 'The_Promised_LAN', 'Wu_Tang_LAN', 'Dropbox',
  'Linksys02847', 'ASUS_RT-AC68U', 'Virgin_Media-XY3', 'SkyNet_Guest',
];

const VENDORS = [
  'TP-Link', 'Netgear', 'Linksys', 'ASUS', 'D-Link', 'Cisco', 'Ubiquiti',
  'Huawei', 'Xiaomi', 'Aruba', 'Ruckus', 'Synology', 'Apple', 'Samsung',
];

const SECURITIES: WiFiNetwork['security'][] = ['WPA3', 'WPA2', 'WPA2', 'WPA2', 'WPA', 'WEP', 'Open'];

function randomMac(): string {
  const hex = '0123456789ABCDEF';
  let mac = '';
  for (let i = 0; i < 6; i++) {
    mac += hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)];
    if (i < 5) mac += ':';
  }
  return mac;
}

function generateNetwork(): WiFiNetwork {
  const freq = Math.random() > 0.4 ? '5' : '2.4';
  const baseChannel = freq === '5' ? [36, 40, 44, 48, 149, 153, 157, 161][Math.floor(Math.random() * 8)]
    : [1, 6, 11, 3, 8, 2, 9][Math.floor(Math.random() * 7)];
  return {
    id: Math.random().toString(36).slice(2),
    ssid: SSID_POOL[Math.floor(Math.random() * SSID_POOL.length)],
    bssid: randomMac(),
    signal: Math.floor(Math.random() * 70) + 20,
    channel: baseChannel,
    frequency: freq as '2.4' | '5',
    security: SECURITIES[Math.floor(Math.random() * SECURITIES.length)],
    vendor: VENDORS[Math.floor(Math.random() * VENDORS.length)],
    clients: Math.floor(Math.random() * 8),
  };
}

function SignalBars({ strength }: { strength: number }) {
  const bars = strength > 75 ? 4 : strength > 50 ? 3 : strength > 25 ? 2 : 1;
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={`w-1 rounded-sm transition-all ${
            i <= bars
              ? strength > 50 ? 'bg-green-400' : strength > 25 ? 'bg-yellow-400' : 'bg-red-400'
              : 'bg-white/10'
          }`}
          style={{ height: `${i * 25}%` }}
        />
      ))}
    </div>
  );
}

function RadarVisualization({ networks, scanning }: { networks: WiFiNetwork[]; scanning: boolean }) {
  return (
    <div className="relative aspect-square w-full max-w-md mx-auto">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border border-white/5">
        {[0.25, 0.5, 0.75, 1].map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/5"
            style={{
              left: `${50 - r * 50}%`,
              top: `${50 - r * 50}%`,
              width: `${r * 100}%`,
              height: `${r * 100}%`,
            }}
          />
        ))}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5" />
        <div className="absolute top-1/2 left-1/2 w-[141%] h-px bg-white/5 origin-left -translate-y-1/2 rotate-45" />
        <div className="absolute top-1/2 left-1/2 w-[141%] h-px bg-white/5 origin-left -translate-y-1/2 -rotate-45" />
      </div>

      {scanning && (
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-1/2 origin-top-left"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(139,92,246,0.3) 60deg, transparent 90deg)',
            }}
          />
        </motion.div>
      )}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)]">
        <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-50" />
      </div>

      <AnimatePresence>
        {networks.slice(0, 12).map((net, i) => {
          const angle = (i * 137.5) * (Math.PI / 180);
          const distance = (100 - net.signal) / 100 * 45 + 5;
          const x = 50 + Math.cos(angle) * distance;
          const y = 50 + Math.sin(angle) * distance;
          const color = net.security === 'Open' ? 'bg-red-400' : net.security === 'WEP' ? 'bg-yellow-400' : 'bg-green-400';
          return (
            <motion.div
              key={net.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-lg cursor-pointer`}
                style={{ boxShadow: `0 0 12px currentColor` }}
              />
              <motion.div
                className={`absolute w-6 h-6 rounded-full ${color} opacity-30 -top-1.5 -left-1.5`}
                animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                <div className="px-2 py-1 rounded-md bg-black/90 border border-white/10 text-xs whitespace-nowrap text-white">
                  {net.ssid}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-600">-30 dBm</div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-600">-50 dBm</div>
      <div className="absolute top-1/2 left-[calc(25%+4px)] -translate-y-1/2 text-[10px] font-mono text-gray-600">-70 dBm</div>
    </div>
  );
}

function WiFiScanner({ networks, setNetworks, scanning, setScanning }: {
  networks: WiFiNetwork[];
  setNetworks: (fn: (prev: WiFiNetwork[]) => WiFiNetwork[]) => void;
  scanning: boolean;
  setScanning: (v: boolean) => void;
}) {
  const [filter, setFilter] = useState<'all' | '2.4' | '5'>('all');
  const [secFilter, setSecFilter] = useState<'all' | WiFiNetwork['security']>('all');
  const [sortBy, setSortBy] = useState<'signal' | 'ssid' | 'channel'>('signal');
  const scanInterval = useRef<number | null>(null);

  const startScan = () => {
    if (scanInterval.current !== null) window.clearInterval(scanInterval.current);
    setScanning(true);
    setNetworks(() => []);
    const initial = Array.from({ length: 6 }, () => generateNetwork());
    setNetworks(() => initial);
    scanInterval.current = window.setInterval(() => {
      setNetworks(prev => {
        const newNet = generateNetwork();
        const updated = prev.map(n => ({
          ...n,
          signal: Math.max(10, Math.min(95, n.signal + Math.floor(Math.random() * 10) - 5))
        }));
        if (updated.length < 15 && Math.random() > 0.3) {
          return [...updated, newNet];
        }
        return updated;
      });
    }, 1500);
  };

  const stopScan = () => {
    setScanning(false);
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (scanInterval.current) clearInterval(scanInterval.current);
    };
  }, []);

  const filtered = networks
    .filter(n => filter === 'all' || n.frequency === filter)
    .filter(n => secFilter === 'all' || n.security === secFilter)
    .sort((a, b) => {
      if (sortBy === 'signal') return b.signal - a.signal;
      if (sortBy === 'ssid') return a.ssid.localeCompare(b.ssid);
      return a.channel - b.channel;
    });

  const avgSignal = networks.length > 0
    ? Math.round(networks.reduce((s, n) => s + n.signal, 0) / networks.length)
    : 0;

  const securedCount = networks.filter(n => n.security !== 'Open' && n.security !== 'WEP').length;

  return (
    <section id="scanner" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">Network Discovery</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Live WiFi Scanner
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover nearby networks in real-time. Visualize signal strength, channels, and security posture at a glance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${scanning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm font-mono text-gray-300">
                {scanning ? 'Scanning...' : networks.length > 0 ? 'Scan complete' : 'Idle'}
              </span>
              <span className="text-xs text-gray-500 font-mono">· {networks.length} networks</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={scanning ? stopScan : startScan}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  scanning
                    ? 'bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20'
                    : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40'
                }`}
              >
                <div className="w-4 h-4">
                  {scanning ? <Icons.Close /> : <Icons.Radar />}
                </div>
                {scanning ? 'Stop Scan' : 'Start Scan'}
              </button>
              {networks.length > 0 && (
                <button
                  onClick={() => setNetworks(() => [])}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Clear"
                >
                  <div className="w-4 h-4"><Icons.Refresh /></div>
                </button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-0 lg:divide-x divide-white/5">
            <div className="p-8">
              <RadarVisualization networks={filtered} scanning={scanning} />
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <div className="text-2xl font-bold text-white">{networks.length}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Total</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <div className="text-2xl font-bold text-green-400">{securedCount}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Secured</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{avgSignal}%</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Avg Signal</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="p-4 border-b border-white/5 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500 mr-2">
                  <div className="w-3 h-3"><Icons.Filter /></div>
                  Filter:
                </div>
                <div className="flex gap-1">
                  {(['all', '2.4', '5'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                        filter === f
                          ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                          : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'All' : `${f} GHz`}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 ml-auto">
                  {(['signal', 'ssid', 'channel'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all capitalize ${
                        sortBy === s
                          ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                          : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-2 border-b border-white/5 flex flex-wrap gap-1.5">
                {(['all', 'WPA3', 'WPA2', 'WPA', 'WEP', 'Open'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSecFilter(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
                      secFilter === s
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-transparent border border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto max-h-[500px]">
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600">
                        <div className="w-8 h-8"><Icons.Radar /></div>
                      </div>
                      <div className="text-gray-400 text-sm mb-1">
                        {scanning ? 'Searching for networks...' : 'No networks discovered'}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {scanning ? 'This may take a moment' : 'Click "Start Scan" to begin'}
                      </div>
                    </div>
                  ) : (
                    filtered.map((net, i) => (
                      <motion.div
                        key={net.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.02 }}
                        className="group px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <SignalBars strength={net.signal} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium text-white truncate">{net.ssid}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                net.security === 'WPA3' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                net.security === 'WPA2' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                net.security === 'WPA' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                net.security === 'WEP' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {net.security}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                                {net.frequency} GHz
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500">
                              <span>{net.bssid}</span>
                              <span>·</span>
                              <span>Ch {net.channel}</span>
                              <span>·</span>
                              <span>{net.vendor}</span>
                              <span>·</span>
                              <span>{net.clients} clients</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-white">{net.signal}%</div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-start gap-3"
        >
          <div className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5"><Icons.Radar /></div>
          <div className="text-xs text-cyan-200/80">
            <span className="font-semibold text-cyan-300">Demo mode:</span> This interactive preview simulates the real scanner. In the actual Airgorah application, network discovery is performed via the privileged daemon using monitor-mode capable adapters.
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ ATTACK LAB ============
type AttackType = 'deauth' | 'pmkid' | 'handshake' | 'beacon' | 'evil_twin';

type AttackConfig = {
  id: AttackType;
  name: string;
  shortName: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  command: string;
  details: string[];
};

const ATTACKS: AttackConfig[] = [
  {
    id: 'deauth',
    name: 'Deauthentication Attack',
    shortName: 'DEAUTH',
    description: 'Send forged deauthentication frames to disconnect clients from the target AP. Used to capture WPA handshakes when clients reconnect.',
    color: 'from-red-500 to-orange-500',
    icon: <Icons.Zap />,
    command: 'SIMULATION ONLY — no deauthentication frames are transmitted',
    details: [
      'Sends management frames (type 0, subtype 12)',
      'Broadcast or targeted to specific client',
      'Triggers client reconnection',
      'Captures 4-way handshake on reconnect',
    ],
  },
  {
    id: 'pmkid',
    name: 'PMKID Capture',
    shortName: 'PMKID',
    description: 'Extract the PMKID (Pairwise Master Key Identifier) from the first EAPOL message. Works without any clients connected.',
    color: 'from-purple-500 to-pink-500',
    icon: <Icons.Key />,
    command: 'SIMULATION ONLY — no PMKID capture is performed',
    details: [
      'No client association required',
      'Faster than handshake capture',
      'Works on WPA2 networks',
      'Single frame capture',
    ],
  },
  {
    id: 'handshake',
    name: 'WPA Handshake Capture',
    shortName: 'HANDSHAKE',
    description: 'Passively capture the 4-way WPA/WPA2 handshake when a client authenticates to the target access point.',
    color: 'from-cyan-500 to-blue-500',
    icon: <Icons.Lock />,
    command: 'SIMULATION ONLY — no wireless handshake is captured',
    details: [
      'Captures EAPOL frames (4-way handshake)',
      'Requires active client connection',
      'Combine with deauth for faster capture',
      'Output: .cap file for cracking',
    ],
  },
  {
    id: 'beacon',
    name: 'Beacon Flood',
    shortName: 'BEACON',
    description: 'Flood the airwaves with fake beacon frames to create hundreds of fake access points, disrupting network discovery.',
    color: 'from-yellow-500 to-orange-500',
    icon: <Icons.Radio />,
    command: 'SIMULATION ONLY — no beacon frames are transmitted',
    details: [
      'Generates fake AP beacons',
      'Customizable SSID templates',
      'Adjustable transmission rate',
      'Disrupts client scanning',
    ],
  },
  {
    id: 'evil_twin',
    name: 'Evil Twin (Rogue AP)',
    shortName: 'EVIL TWIN',
    description: 'Create a rogue access point with the same SSID as the target to trick clients into connecting, enabling credential capture.',
    color: 'from-pink-500 to-rose-500',
    icon: <Icons.Skull />,
    command: 'SIMULATION ONLY — no access point is created',
    details: [
      'Clones target SSID and BSSID',
      'Higher signal than legitimate AP',
      'Can capture credentials',
      'Requires DHCP/DNS setup',
    ],
  },
];

// Key icon fallback
const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

// Patch the missing Key icon
(Icons as any).Key = KeyIcon;

type LogEntry = {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'packet';
  message: string;
};

function AttackLab({ networks }: { networks: WiFiNetwork[] }) {
  const [selectedAttack, setSelectedAttack] = useState<AttackType>('deauth');
  const [target, setTarget] = useState<WiFiNetwork | null>(null);
  const [running, setRunning] = useState(false);
  const [packets, setPackets] = useState(0);
  const [clients, setClients] = useState(0);
  const [handshakeCaptured, setHandshakeCaptured] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const attack = ATTACKS.find(a => a.id === selectedAttack)!;

  const addLog = (type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev.slice(-100), { id: Math.random().toString(36).slice(2), time, type, message }]);
  };

  const startAttack = () => {
    if (running) return;
    if (!target) {
      addLog('error', 'No target selected. Please select a network from the scanner.');
      return;
    }
    setRunning(true);
    setPackets(0);
    setClients(0);
    setHandshakeCaptured(false);
    setElapsed(0);

    addLog('warning', 'SIMULATION MODE: no radio packets are sent, no clients are disconnected, and no credentials or captures are collected.');
    addLog('info', `Starting simulated ${attack.name} against demo network "${target.ssid}" (${target.bssid})`);
    addLog('info', `Demo interface: virtual · Channel: ${target.channel} · Frequency: ${target.frequency} GHz`);
    addLog('info', attack.command);

    setTimeout(() => {
      addLog('success', 'Virtual monitor-mode indicator enabled (simulation only)');
      addLog('info', `Hopping to channel ${target.channel}...`);
    }, 400);

    setTimeout(() => {
      addLog('success', `Virtual channel set to ${target.channel} (${target.frequency} GHz)`);
    }, 900);

    // Packet generation
    intervalRef.current = window.setInterval(() => {
      const pktInc = Math.floor(Math.random() * 40) + 20;
      setPackets(p => p + pktInc);
      setClients(Math.floor(Math.random() * 3) + 1);

      const r = Math.random();
      if (r < 0.3) {
        const mac = randomMac();
        if (selectedAttack === 'deauth') {
          addLog('packet', `[SIMULATED] Deauthentication event preview for demo client ${mac}`);
        } else if (selectedAttack === 'pmkid') {
          addLog('packet', `[SIMULATED] PMKID event preview for demo AP ${mac}`);
        } else if (selectedAttack === 'handshake') {
          addLog('packet', `[SIMULATED] Handshake state preview for demo client ${mac}`);
        } else if (selectedAttack === 'beacon') {
          addLog('packet', `[SIMULATED] Beacon-discovery event preview (no transmission)`);
        } else {
          addLog('packet', `[SIMULATED] Rogue-AP detection scenario for "${target.ssid}" (no AP created)`);
        }
      } else if (r < 0.5) {
        addLog('info', `Packets: ${packets + pktInc} · Clients: ${Math.floor(Math.random() * 3) + 1} · Signal: -${Math.floor(Math.random() * 40) + 30} dBm`);
      }

      // Simulate handshake capture for relevant attacks
      if ((selectedAttack === 'handshake' || selectedAttack === 'deauth') && !handshakeCaptured && Math.random() > 0.85) {
        setHandshakeCaptured(true);
        addLog('success', '✓ Demo handshake scenario completed. No capture file was created.');
      }

      if (selectedAttack === 'pmkid' && !handshakeCaptured && Math.random() > 0.9) {
        setHandshakeCaptured(true);
        addLog('success', '✓ Demo PMKID scenario completed. No capture file was created.');
      }
    }, 600);

    timerRef.current = window.setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
  };

  const stopAttack = () => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    addLog('warning', `Simulation stopped. ${packets} synthetic events displayed; zero packets transmitted.`);
    addLog('info', 'Simulation ended. No wireless interface was changed.');
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const logColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'packet': return 'text-cyan-300';
      default: return 'text-gray-400';
    }
  };

  return (
    <section id="attack" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-red-400 mb-3">Offensive Security</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Attack Lab
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Execute WiFi security audits with professional-grade attacks. Test your network's resilience against real-world threats.
          </p>
        </motion.div>

        {/* Legal warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-3"
        >
          <div className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"><Icons.Alert /></div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-red-300 mb-1">Authorized Use Only</div>
            <div className="text-xs text-red-200/70">
              These tools must only be used on networks you own or have explicit written permission to test. Unauthorized use is illegal in most jurisdictions. This demo is a simulation for educational purposes.
            </div>
            <label className="flex items-center gap-2 mt-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-red-500/30 bg-red-500/10 accent-red-500"
              />
              <span className="text-xs text-red-200/80 group-hover:text-red-200 transition-colors">
                I understand and have authorization to use these tools
              </span>
            </label>
          </div>
        </motion.div>

        {/* Attack type selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6"
        >
          {ATTACKS.map(a => (
            <button
              key={a.id}
              onClick={() => !running && setSelectedAttack(a.id)}
              disabled={running}
              className={`group relative p-4 rounded-xl border transition-all text-left ${
                selectedAttack === a.id
                  ? `bg-gradient-to-br ${a.color} bg-opacity-10 border-white/20 shadow-lg`
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
              } ${running ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${a.color} p-2 text-white mb-3 ${
                selectedAttack === a.id ? 'shadow-lg' : 'opacity-70 group-hover:opacity-100'
              } transition-opacity`}>
                {a.icon}
              </div>
              <div className="text-[10px] font-mono text-gray-500 mb-0.5">{a.shortName}</div>
              <div className="text-sm font-semibold text-white">{a.name.split(' ')[0]}</div>
              {selectedAttack === a.id && (
                <motion.div
                  layoutId="attack-indicator"
                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Main attack panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-br from-[#0d0d15] to-[#0a0a0f] border border-white/5 overflow-hidden"
        >
          {/* Attack header */}
          <div className={`p-6 border-b border-white/5 bg-gradient-to-r ${attack.color} bg-opacity-5`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${attack.color} p-3 text-white shadow-lg`}>
                  {attack.icon}
                </div>
                <div>
                  <div className="text-xs font-mono text-gray-500 mb-1">ATTACK MODULE</div>
                  <h3 className="text-xl font-bold text-white mb-1">{attack.name}</h3>
                  <p className="text-sm text-gray-400 max-w-xl">{attack.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {running ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-mono text-red-300">ACTIVE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    <span className="text-xs font-mono text-gray-400">STANDBY</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-0 lg:divide-x divide-white/5">
            {/* Left: Target + Controls */}
            <div className="p-6 space-y-5">
              <div>
                <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-3 h-3"><Icons.Crosshair /></div>
                  Target Selection
                </div>
                <select
                  value={target?.id || ''}
                  onChange={(e) => setTarget(networks.find(n => n.id === e.target.value) || null)}
                  disabled={running}
                  className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white font-mono disabled:opacity-50 focus:border-purple-500/50 focus:outline-none transition-colors"
                >
                  <option value="">
                    {networks.length === 0 ? '— Run scanner first —' : '— Select target network —'}
                  </option>
                  {networks.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.ssid} · {n.bssid} · {n.security}
                    </option>
                  ))}
                </select>
                {target && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1.5"
                  >
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-500">SSID</span>
                      <span className="text-white">{target.ssid}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-500">BSSID</span>
                      <span className="text-purple-300">{target.bssid}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-500">Channel</span>
                      <span className="text-cyan-300">{target.channel} ({target.frequency} GHz)</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-500">Security</span>
                      <span className="text-green-300">{target.security}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-500">Signal</span>
                      <span className="text-white">-{100 - target.signal} dBm</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div>
                <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">Command Preview</div>
                <div className="p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-xs text-green-300 overflow-x-auto">
                  <span className="text-gray-600">$</span> {attack.command
                    .replace('<BSSID>', target?.bssid || '<BSSID>')
                    .replace('<CH>', target ? String(target.channel) : '<CH>')
                    .replace('<SSID>', target?.ssid || '<SSID>')
                  }
                </div>
              </div>

              <div>
                <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">Attack Details</div>
                <ul className="space-y-1.5">
                  {attack.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <div className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5"><Icons.Check /></div>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={running ? stopAttack : startAttack}
                disabled={!agreed || !target}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  running
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                    : `bg-gradient-to-r ${attack.color} text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed`
                }`}
              >
                <div className="w-4 h-4">
                  {running ? <Icons.Stop /> : <Icons.Play />}
                </div>
                {running ? 'Stop Attack' : 'Launch Attack'}
              </button>
              {(!agreed || !target) && (
                <div className="text-[10px] text-center text-gray-500 mt-2">
                  {!agreed ? 'Accept the authorization notice above' : 'Select a target network to continue'}
                </div>
              )}
            </div>

            {/* Middle: Live stats + visualization */}
            <div className="p-6">
              <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-3 h-3"><Icons.Activity /></div>
                Live Telemetry
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Packets</div>
                  <motion.div
                    key={packets}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-white font-mono"
                  >
                    {packets.toLocaleString()}
                  </motion.div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Clients</div>
                  <div className="text-2xl font-bold text-cyan-400 font-mono">{clients}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Elapsed</div>
                  <div className="text-2xl font-bold text-purple-400 font-mono">{formatTime(elapsed)}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Rate</div>
                  <div className="text-2xl font-bold text-orange-400 font-mono">
                    {running ? Math.floor(packets / Math.max(1, elapsed)) : 0}<span className="text-xs text-gray-500">/s</span>
                  </div>
                </div>
              </div>

              {/* Attack visualization */}
              <div className="relative aspect-square w-full max-w-[280px] mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5">
                  {[0.25, 0.5, 0.75, 1].map((r, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full border border-white/5"
                      style={{
                        left: `${50 - r * 50}%`,
                        top: `${50 - r * 50}%`,
                        width: `${r * 100}%`,
                        height: `${r * 100}%`,
                      }}
                    />
                  ))}
                </div>

                {/* Attacker (center) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${attack.color} flex items-center justify-center text-white p-2 shadow-lg`}>
                    {attack.icon}
                  </div>
                  {running && (
                    <>
                      <motion.div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${attack.color} opacity-30`}
                        animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${attack.color} opacity-30`}
                        animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                      />
                      <motion.div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${attack.color} opacity-30`}
                        animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
                      />
                    </>
                  )}
                </div>

                {/* Target */}
                {target && (
                  <div className="absolute top-[15%] left-1/2 -translate-x-1/2">
                    <div className={`w-8 h-8 rounded-lg bg-white/5 border ${running ? 'border-red-500/50' : 'border-white/10'} flex items-center justify-center p-1.5 text-white relative`}>
                      <Icons.Wifi />
                      {running && (
                        <motion.div
                          className="absolute inset-0 rounded-lg border-2 border-red-500"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <div className="text-[9px] font-mono text-center text-gray-500 mt-1 max-w-[80px] truncate">
                      {target.ssid}
                    </div>
                  </div>
                )}

                {/* Attack beam */}
                {running && target && (
                  <motion.div
                    className="absolute top-[22%] left-1/2 w-0.5 h-[28%] origin-top"
                    style={{
                      background: `linear-gradient(to bottom, transparent, ${selectedAttack === 'deauth' ? '#ef4444' : selectedAttack === 'pmkid' ? '#a855f7' : '#06b6d4'}, transparent)`,
                    }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  />
                )}

                {/* Clients (for deauth/handshake) */}
                {running && (selectedAttack === 'deauth' || selectedAttack === 'handshake') && (
                  <>
                    {[
                      { x: 20, y: 70 },
                      { x: 80, y: 75 },
                      { x: 15, y: 40 },
                    ].slice(0, clients).map((pos, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute w-2 h-2 rounded-full bg-green-400"
                        style={{ left: `${pos.x}%`, top: `${pos.y}%`, boxShadow: '0 0 8px #4ade80' }}
                      />
                    ))}
                  </>
                )}

                {/* Fake APs for beacon flood */}
                {running && selectedAttack === 'beacon' && (
                  <>
                    {Array.from({ length: 8 }).map((_, i) => {
                      const angle = (i * 45) * (Math.PI / 180);
                      const x = 50 + Math.cos(angle) * 35;
                      const y = 50 + Math.sin(angle) * 35;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                          className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400"
                          style={{ left: `${x}%`, top: `${y}%`, boxShadow: '0 0 6px #facc15' }}
                        />
                      );
                    })}
                  </>
                )}
              </div>

              {/* Handshake status */}
              <div className={`p-3 rounded-xl border ${
                handshakeCaptured
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/[0.02] border-white/5'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${handshakeCaptured ? 'bg-green-400' : 'bg-gray-500'}`} />
                    <span className="text-xs font-mono text-gray-300">
                      {selectedAttack === 'pmkid' ? 'PMKID' : 'Handshake'} Status
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${handshakeCaptured ? 'text-green-400' : 'text-gray-500'}`}>
                    {handshakeCaptured ? '✓ CAPTURED' : 'WAITING'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Live console */}
            <div className="p-6 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-3 h-3"><Icons.Terminal /></div>
                  Live Console
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/60" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                  <div className="w-2 h-2 rounded-full bg-green-500/60" />
                </div>
              </div>

              <div
                ref={logRef}
                className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-[11px] leading-relaxed"
              >
                {logs.length === 0 ? (
                  <div className="text-gray-600 text-center py-8">
                    <div className="mb-2">// Console output will appear here</div>
                    <div className="text-gray-700">// Launch an attack to begin</div>
                  </div>
                ) : (
                  logs.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2 mb-0.5"
                    >
                      <span className="text-gray-600 flex-shrink-0">[{log.time}]</span>
                      <span className={logColor(log.type)}>{log.message}</span>
                    </motion.div>
                  ))
                )}
                {running && (
                  <motion.div
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-purple-400 mt-1"
                  >
                    <span className="text-gray-600">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span> ▊
                  </motion.div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setLogs([])}
                  className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  Clear Console
                </button>
                <button
                  onClick={() => {
                    const text = logs.map(l => `[${l.time}] ${l.message}`).join('\n');
                    void navigator.clipboard?.writeText(text).catch(() => {});
                  }}
                  className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <div className="w-3 h-3"><Icons.Copy /></div>
                  Export Log
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-3"
        >
          <div className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5"><Icons.Alert /></div>
          <div className="text-xs text-red-200/80">
            <span className="font-semibold text-red-300">Simulation mode:</span> This interactive demo visualizes attack concepts. The real Airgorah application executes these attacks through the privileged <code className="px-1 py-0.5 rounded bg-red-500/10 text-red-300 font-mono">airgorahd</code> daemon using monitor-mode capable adapters (e.g., Alfa AWUS036ACH, TP-Link TL-WN722N).
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ ARCHITECTURE ============
function Architecture() {
  const crates = [
    { name: 'airgorah', desc: 'GTK4 GUI client', color: 'from-purple-500 to-pink-500', icon: <Icons.Layers /> },
    { name: 'airgorahd', desc: 'Privileged daemon', color: 'from-cyan-500 to-blue-500', icon: <Icons.Server /> },
    { name: 'airgorah-cli', desc: 'Command-line interface', color: 'from-green-500 to-emerald-500', icon: <Icons.Terminal /> },
  ];

  return (
    <section id="architecture" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">Architecture</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Workspace of 3 crates</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Clean separation of concerns with IPC over Unix socket.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {crates.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-white/10 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} p-2.5 text-white mb-4`}>
                {c.icon}
              </div>
              <div className="font-mono text-sm text-purple-300 mb-1">{c.name}</div>
              <div className="text-gray-400 text-sm">{c.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 border border-white/5"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 p-2.5 text-white">
                <Icons.Zap />
              </div>
              <div>
                <div className="text-white font-semibold">Unix Socket IPC</div>
                <div className="text-gray-400 text-sm">Secure, low-latency communication between client and daemon</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono">airgorah</span>
              <span className="text-gray-500">⇄</span>
              <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono">airgorahd</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ DOCKER BUILD ============
function DockerBuild() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    void navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const dockerfile = `FROM rust:latest AS builder
WORKDIR /build
RUN apt-get update && apt-get install -y \\
    libgtk-4-dev \\
    libadwaita-1-dev \\
    pkg-config \\
    && rm -rf /var/lib/apt/lists/*
COPY . .
RUN cargo build --release`;

  const buildCmd = 'docker build . -t airgorah_builder';
  const runCmd = 'docker run --rm -v $PWD:/workspace airgorah_builder';

  const deps = [
    { name: 'Rust', version: 'latest', color: 'from-orange-500 to-red-500' },
    { name: 'GTK4', version: 'libgtk-4-dev', color: 'from-purple-500 to-pink-500' },
    { name: 'libadwaita', version: '1.x', color: 'from-cyan-500 to-blue-500' },
    { name: 'pkg-config', version: 'build tool', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <section id="build" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-green-400 mb-3">Build Environment</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Reproducible Docker builds</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">All dependencies isolated in a container. Build once, run anywhere.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-[#0d0d15] border border-white/5 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="ml-3 text-xs font-mono text-gray-400">Dockerfile</span>
              </div>
              <button onClick={() => copy(dockerfile, 'dockerfile')} className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <div className="w-4 h-4">{copied === 'dockerfile' ? <Icons.Check /> : <Icons.Copy />}</div>
              </button>
            </div>
            <pre className="p-5 text-sm font-mono text-gray-300 overflow-x-auto leading-relaxed">
              <code>{dockerfile}</code>
            </pre>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="rounded-2xl bg-[#0d0d15] border border-white/5 p-5">
              <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Step 1 · Build image</div>
              <div className="flex items-center justify-between gap-3">
                <code className="text-sm font-mono text-purple-300 flex-1 truncate">{buildCmd}</code>
                <button onClick={() => copy(buildCmd, 'build')} className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors flex-shrink-0">
                  <div className="w-4 h-4">{copied === 'build' ? <Icons.Check /> : <Icons.Copy />}</div>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0d0d15] border border-white/5 p-5">
              <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Step 2 · Run build</div>
              <div className="flex items-center justify-between gap-3">
                <code className="text-sm font-mono text-cyan-300 flex-1 truncate">{runCmd}</code>
                <button onClick={() => copy(runCmd, 'run')} className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors flex-shrink-0">
                  <div className="w-4 h-4">{copied === 'run' ? <Icons.Check /> : <Icons.Copy />}</div>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border border-white/5 p-5">
              <div className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-wider">Generated packages</div>
              <div className="flex flex-wrap gap-2">
                {['airgorah_x86_64.deb', 'airgorah_aarch64.deb', 'airgorah_x86_64.rpm', 'airgorah_aarch64.rpm', 'airgorah_x86_64.pkg.tar.zst', 'airgorah_aarch64.pkg.tar.zst'].map(p => (
                  <span key={p} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {deps.map(d => (
            <div key={d.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${d.color} mb-3`} />
              <div className="text-white font-semibold text-sm">{d.name}</div>
              <div className="text-xs text-gray-500 font-mono">{d.version}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============ CI/CD PIPELINE ============
function Pipeline() {
  const stages = [
    {
      name: 'Linter',
      icon: <Icons.Check />,
      color: 'from-purple-500 to-pink-500',
      items: ['cargo clippy', 'cargo fmt --check'],
    },
    {
      name: 'Build',
      icon: <Icons.Cpu />,
      color: 'from-cyan-500 to-blue-500',
      items: ['x86_64 · ubuntu-24.04', 'aarch64 · ubuntu-24.04-arm'],
    },
    {
      name: 'Release',
      icon: <Icons.Download />,
      color: 'from-green-500 to-emerald-500',
      items: ['Draft release', 'Auto-generated notes', '6 packages uploaded'],
    },
  ];

  return (
    <section id="pipeline" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-pink-400 mb-3">CI/CD</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">GitHub Actions pipeline</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Fully automated from lint to release. Triggered on push and pull requests.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 relative">
          <div className="hidden md:block absolute top-1/2 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-green-500/30 -translate-y-1/2" />

          {stages.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} p-2.5 text-white shadow-lg`}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-mono">Stage {i + 1}</div>
                    <div className="text-white font-semibold">{s.name}</div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {s.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                      <div className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5"><Icons.Check /></div>
                      <span className="font-mono text-xs">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 p-6 rounded-2xl bg-[#0d0d15] border border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Trigger conditions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">on: push</span>
            <span className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">on: pull_request</span>
            <span className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-mono">refs/tags/v*</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ INSTALLATION ============
function Installation() {
  const [tab, setTab] = useState<'deb' | 'rpm' | 'arch'>('deb');
  const [copied, setCopied] = useState(false);

  const tabs = {
    deb: {
      label: 'Debian / Ubuntu',
      ext: '.deb',
      icon: '🐧',
      color: 'from-purple-500 to-pink-500',
      commands: [
        { label: 'Download', cmd: 'wget https://github.com/martin-olivier/airgorah/releases/latest/download/airgorah_`arch`.deb' },
        { label: 'Install', cmd: 'sudo apt update && sudo apt install ./airgorah_`arch`.deb' },
      ],
    },
    rpm: {
      label: 'Fedora / RHEL',
      ext: '.rpm',
      icon: '🎩',
      color: 'from-cyan-500 to-blue-500',
      commands: [
        { label: 'Download', cmd: 'wget https://github.com/martin-olivier/airgorah/releases/latest/download/airgorah_`arch`.rpm' },
        { label: 'Install', cmd: 'sudo dnf update && sudo dnf install ./airgorah_`arch`.rpm' },
      ],
    },
    arch: {
      label: 'Arch Linux',
      ext: '.pkg.tar.zst',
      icon: '🏔️',
      color: 'from-cyan-500 to-blue-500',
      commands: [
        { label: 'AUR helper', cmd: 'yay -S airgorah' },
        { label: 'Or download', cmd: 'wget https://github.com/martin-olivier/airgorah/releases/latest/download/airgorah_`arch`.pkg.tar.zst' },
        { label: 'Install', cmd: 'sudo pacman -U airgorah_`arch`.pkg.tar.zst' },
      ],
    },
  };

  const current = tabs[tab];

  const copyAll = () => {
    const text = current.commands.map(c => `# ${c.label}\n${c.cmd}`).join('\n\n');
    void navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="install" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">Installation</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Get up and running</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Native packages for every major Linux distribution.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-[#0d0d15] border border-white/5 overflow-hidden"
        >
          <div className="flex border-b border-white/5">
            {(Object.keys(tabs) as Array<keyof typeof tabs>).map(key => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${
                  tab === key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{tabs[key].icon}</span>
                  <span>{tabs[key].label}</span>
                </div>
                {tab === key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tabs[key].color}`}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                {current.label} · {current.ext}
              </div>
              <button onClick={copyAll} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-colors">
                <div className="w-3.5 h-3.5">{copied ? <Icons.Check /> : <Icons.Copy />}</div>
                {copied ? 'Copied' : 'Copy all'}
              </button>
            </div>

            <div className="space-y-3">
              {current.commands.map((c, i) => (
                <motion.div
                  key={c.cmd}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="text-xs font-mono text-gray-500 w-20 flex-shrink-0 uppercase tracking-wider">{c.label}</div>
                  <code className="flex-1 text-sm font-mono text-green-300 overflow-x-auto">
                    <span className="text-gray-600 mr-2">$</span>{c.cmd}
                  </code>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="text-xs text-yellow-200/80">
                  Replace <code className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 font-mono">`arch`</code> with <code className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 font-mono">x86_64</code> or <code className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 font-mono">aarch64</code> depending on your architecture.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ TECH STACK ============
function TechStack() {
  const techs = [
    { name: 'Rust', desc: 'Systems language', color: 'from-orange-500 to-red-500' },
    { name: 'GTK4', desc: 'Modern UI toolkit', color: 'from-purple-500 to-pink-500' },
    { name: 'libadwaita', desc: 'GNOME design', color: 'from-blue-500 to-cyan-500' },
    { name: 'Docker', desc: 'Build isolation', color: 'from-cyan-500 to-blue-500' },
    { name: 'GitHub Actions', desc: 'CI/CD automation', color: 'from-gray-400 to-gray-600' },
    { name: 'Unix Sockets', desc: 'IPC mechanism', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block text-xs font-mono uppercase tracking-widest text-orange-400 mb-3">Tech Stack</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Built with modern tools</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {techs.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all text-center"
            >
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${t.color} mb-3 opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div className="text-white font-semibold text-sm mb-1">{t.name}</div>
              <div className="text-xs text-gray-500">{t.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ FOOTER ============
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white">
              <div className="w-5 h-5"><Icons.Wifi /></div>
            </div>
            <div>
              <div className="text-white font-semibold">Airgorah</div>
              <div className="text-xs text-gray-500">WiFi security audit tool</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <a href="https://github.com/martin-olivier/airgorah" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
              <div className="w-4 h-4"><Icons.Github /></div>
              GitHub
            </a>
            <a href="#install" className="text-gray-400 hover:text-white transition-colors">Install</a>
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
          </div>

          <div className="text-xs text-gray-500">
            MIT License · Made with <span className="text-red-400">♥</span> for Linux
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============ APP ============
export default function App() {
  const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
  const [scanning, setScanning] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white antialiased">
      <AnimatedBackground />
      <Navigation />
      <main>
        <Hero />
        <Features />
        <WiFiScanner
          networks={networks}
          setNetworks={setNetworks}
          scanning={scanning}
          setScanning={setScanning}
        />
        <AttackLab networks={networks} />
        <Architecture />
        <DockerBuild />
        <Pipeline />
        <Installation />
        <TechStack />
      </main>
      <Footer />
    </div>
  );
}