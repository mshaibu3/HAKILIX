import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Boxes,
  BrainCircuit,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Cpu,
  Factory,
  Gauge,
  HardHat,
  HeartPulse,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  Orbit,
  Pause,
  Play,
  Radar,
  ShieldCheck,
  Sparkles,
  Truck,
  Waves,
  Wind,
  X,
  Zap,
} from 'lucide-react';

interface WebsiteProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

type IndustryKey = 'care' | 'construction' | 'manufacturing' | 'warehouse' | 'energy' | 'mining';
type MenuKey = 'technology' | 'industries' | 'research' | null;

const cycle = [
  { label: 'Sense', detail: 'Capture the physical signals that matter.', icon: Radar },
  { label: 'Understand', detail: 'Fuse signals into a live picture of context.', icon: Network },
  { label: 'Predict', detail: 'Estimate emerging risk before the incident.', icon: BrainCircuit },
  { label: 'Decide', detail: 'Evaluate urgency, policy and the right response.', icon: Gauge },
  { label: 'Alert / Act', detail: 'Coordinate people, software and machines.', icon: Zap },
  { label: 'Learn', detail: 'Use outcomes to improve the next decision.', icon: Orbit },
];

const capabilityGroups = [
  { title: 'Perception', copy: 'Radar, LiDAR, vision and spatial sensing.', icon: Radar },
  { title: 'Fusion', copy: 'Multimodal signals become one operational picture.', icon: Network },
  { title: 'Prediction', copy: 'Risk models, anomaly detection and trajectories.', icon: BrainCircuit },
  { title: 'Edge', copy: 'Low-latency intelligence where events happen.', icon: Cpu },
  { title: 'Autonomy', copy: 'Agents connect prediction to controlled action.', icon: Orbit },
  { title: 'Security', copy: 'Identity, permissions and cyber-physical trust.', icon: ShieldCheck },
];

const industries: Record<IndustryKey, {
  name: string;
  eyebrow: string;
  headline: string;
  copy: string;
  sensors: string[];
  output: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  scene: 'care' | 'industrial' | 'factory' | 'warehouse' | 'energy' | 'mine';
}> = {
  care: {
    name: 'Care',
    eyebrow: 'Hakilix Guardian — Care',
    headline: 'Predictive fall intelligence without cameras or wearables.',
    copy: 'Privacy-first ambient sensing to recognise movement change, estimate elevated fall risk and detect a fall when it occurs.',
    sensors: ['mmWave radar', 'Ambient motion', 'Room occupancy', 'Environmental data', 'Care information'],
    output: 'Fall risk increasing · care-team review recommended',
    icon: HeartPulse,
    accent: '#7dd3fc',
    scene: 'care',
  },
  construction: {
    name: 'Construction',
    eyebrow: 'Hakilix Guardian — Construction',
    headline: 'Predict risk before worker and equipment paths collide.',
    copy: 'Combine spatial position, movement and site context to identify developing collision and hazard states.',
    sensors: ['Cameras', 'UWB', 'Wearables', 'Radar', 'Environmental sensors'],
    output: 'Trajectory conflict predicted · intervention recommended',
    icon: HardHat,
    accent: '#fbbf24',
    scene: 'industrial',
  },
  manufacturing: {
    name: 'Manufacturing',
    eyebrow: 'Hakilix Guardian — Manufacturing',
    headline: 'Understand human and machine risk together.',
    copy: 'Fuse equipment condition with worker context instead of treating safety and predictive maintenance as separate problems.',
    sensors: ['Cameras', 'Vibration', 'Temperature', 'Machine telemetry', 'UWB'],
    output: 'Combined operational risk elevated',
    icon: Factory,
    accent: '#a7f3d0',
    scene: 'factory',
  },
  warehouse: {
    name: 'Warehousing',
    eyebrow: 'Hakilix Guardian — Warehousing',
    headline: 'Spatial intelligence for mixed autonomous environments.',
    copy: 'Model humans, forklifts and autonomous mobile robots in the same live spatial risk picture.',
    sensors: ['Cameras', 'LiDAR', 'UWB', 'Forklift telemetry'],
    output: 'Forklift-worker convergence detected',
    icon: Truck,
    accent: '#c4b5fd',
    scene: 'warehouse',
  },
  energy: {
    name: 'Energy',
    eyebrow: 'Hakilix Guardian — Energy',
    headline: 'Find developing asset risk before failure becomes downtime.',
    copy: 'Combine thermal, vibration and environmental signals with remote inspection for critical infrastructure.',
    sensors: ['Thermal', 'Vibration', 'Gas', 'Cameras', 'Drones / robots'],
    output: 'Failure probability increasing · inspection recommended',
    icon: Wind,
    accent: '#67e8f9',
    scene: 'energy',
  },
  mining: {
    name: 'Mining',
    eyebrow: 'Hakilix Guardian — Mining',
    headline: 'Intelligence before human exposure.',
    copy: 'Build an underground risk picture from spatial, environmental and robotic sensing in difficult physical environments.',
    sensors: ['Gas', 'LiDAR', 'Radar', 'UWB', 'Robots', 'Environmental sensors'],
    output: 'Hazard state detected · autonomous inspection advised',
    icon: Building2,
    accent: '#fb7185',
    scene: 'mine',
  },
};

const scenarioSteps = [
  { title: 'Physical signals enter', text: 'Radar and UWB establish position and movement.' },
  { title: 'Context is constructed', text: 'Hakilix understands the worker, vehicle and operating zone together.' },
  { title: 'Trajectory is predicted', text: 'The paths begin to converge before either person reaches the hazard point.' },
  { title: 'Risk state rises', text: 'The intelligence core classifies the developing interaction as elevated risk.' },
  { title: 'Action is coordinated', text: 'The right person or system receives a controlled intervention.' },
  { title: 'Outcome becomes learning', text: 'The event and response feed the next risk assessment.' },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,.8)]" />
      {children}
    </div>
  );
}

function RiskScene({ mode = 'hero', accent = '#6ee7b7' }: { mode?: 'hero' | 'care' | 'industrial' | 'factory' | 'warehouse' | 'energy' | 'mine'; accent?: string }) {
  const isCare = mode === 'care';
  return (
    <div className="relative h-full min-h-[390px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#090e11] shadow-[0_40px_120px_rgba(0,0,0,.45)]">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_38%,rgba(16,185,129,.12),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(56,189,248,.08),transparent_26%)]" />

      <motion.div
        className="absolute left-[16%] top-[20%] h-52 w-52 rounded-full border border-emerald-300/20"
        animate={{ scale: [0.82, 1.18], opacity: [0.1, 0.42, 0.08] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute left-[24%] top-[29%] h-24 w-24 rounded-full border border-emerald-300/30"
        animate={{ scale: [0.72, 1.5], opacity: [0.25, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
      />

      <div className="absolute left-[31%] top-[43%] flex flex-col items-center">
        <div className="h-7 w-7 rounded-full border border-white/30 bg-white/10 shadow-[0_0_24px_rgba(255,255,255,.12)]" />
        <div className="mt-1 h-16 w-8 rounded-t-2xl border border-white/25 bg-white/[0.06]" />
        <div className="flex gap-2">
          <div className="h-14 w-2 origin-top -rotate-6 rounded-full bg-white/20" />
          <div className="h-14 w-2 origin-top rotate-6 rounded-full bg-white/20" />
        </div>
      </div>

      {!isCare && (
        <motion.div
          className="absolute right-[15%] top-[49%] h-14 w-28 rounded-xl border border-amber-300/30 bg-amber-300/10"
          animate={{ x: [18, -12, 18] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute -bottom-2 left-3 h-4 w-4 rounded-full border-2 border-[#090e11] bg-white/60" />
          <div className="absolute -bottom-2 right-3 h-4 w-4 rounded-full border-2 border-[#090e11] bg-white/60" />
        </motion.div>
      )}

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 500" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`risk-${mode}`} x1="0" x2="1">
            <stop offset="0" stopColor={accent} stopOpacity="0.15" />
            <stop offset="0.72" stopColor={accent} stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <motion.path
          d={isCare ? 'M250 350 C300 315 330 280 365 225' : 'M250 350 C345 314 440 286 615 280'}
          fill="none"
          stroke={`url(#risk-${mode})`}
          strokeWidth="2"
          strokeDasharray="7 10"
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{ duration: 2.1, repeat: Infinity, repeatDelay: 0.8 }}
        />
      </svg>

      {!isCare && (
        <motion.div
          className="absolute left-[52%] top-[51%] h-24 w-24 rounded-full border border-rose-400/30 bg-rose-400/[0.045]"
          animate={{ scale: [0.8, 1.16, 0.8], opacity: [0.22, 0.6, 0.22] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
      )}

      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-xl">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">Live spatial model</span>
      </div>

      <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-xl">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">Signal</div>
          <div className="mt-1 text-xs font-semibold text-white/80">{isCare ? 'Ambient motion shift' : 'Trajectory convergence'}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-xl">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">Hakilix</div>
          <div className="mt-1 text-xs font-semibold text-white/80">Context understood</div>
        </div>
        <div className="rounded-2xl border border-rose-300/15 bg-rose-300/[0.055] p-3 backdrop-blur-xl">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-rose-200/45">Risk state</div>
          <div className="mt-1 text-xs font-semibold text-rose-100">{isCare ? 'Fall risk increasing' : 'Elevated · act early'}</div>
        </div>
      </div>
    </div>
  );
}

export default function HakilixWebsite({ onLoginClick, onRegisterClick }: WebsiteProps) {
  const [menu, setMenu] = useState<MenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState<IndustryKey>('care');
  const [cycleIndex, setCycleIndex] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [scenarioPlaying, setScenarioPlaying] = useState(true);

  const industry = industries[activeIndustry];

  useEffect(() => {
    if (!scenarioPlaying) return;
    const id = window.setInterval(() => {
      setScenarioIndex((current) => (current + 1) % scenarioSteps.length);
    }, 2300);
    return () => window.clearInterval(id);
  }, [scenarioPlaying]);

  const navItems = useMemo(() => [
    { key: 'technology' as const, label: 'Technology' },
    { key: 'industries' as const, label: 'Industries' },
    { key: 'research' as const, label: 'Research' },
  ], []);

  const closeAndScroll = (id: string) => {
    setMenu(null);
    setMobileOpen(false);
    scrollToId(id);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#06090b] font-sans text-white selection:bg-emerald-300 selection:text-[#06110d]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#06090b]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button onClick={() => closeAndScroll('top')} className="flex items-center gap-3 text-left" aria-label="Hakilix Labs home">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/[0.07]">
              <Orbit className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-sm font-black tracking-[0.18em]">HAKILIX</div>
              <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/35">Labs</div>
            </div>
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => setMenu(item.key)}
                onMouseLeave={() => setMenu(null)}
              >
                <button
                  className="flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium text-white/62 transition hover:bg-white/[0.04] hover:text-white"
                  onClick={() => setMenu(menu === item.key ? null : item.key)}
                  aria-expanded={menu === item.key}
                >
                  {item.label}<ChevronDown className={`h-3.5 w-3.5 transition ${menu === item.key ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {menu === item.key && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.99 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-1/2 top-[52px] w-[720px] -translate-x-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1013]/98 p-3 shadow-[0_30px_100px_rgba(0,0,0,.6)] backdrop-blur-2xl"
                    >
                      {item.key === 'technology' && (
                        <div className="grid grid-cols-[1.05fr_1fr_.8fr] gap-2">
                          <button onClick={() => closeAndScroll('core')} className="group rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.045] p-5 text-left hover:bg-emerald-300/[0.075]">
                            <Cpu className="mb-7 h-5 w-5 text-emerald-300" />
                            <div className="text-sm font-bold">Hakilix Intelligence Core</div>
                            <div className="mt-2 text-xs leading-5 text-white/45">The reusable engine powering sensing, prediction and controlled response.</div>
                            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-emerald-200">Explore platform <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" /></div>
                          </button>
                          <div className="rounded-2xl p-4">
                            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">Technologies</div>
                            {['Predictive intelligence', 'Sensor fusion', 'Edge AI', 'Autonomous agents', 'Physical AI', 'Cybersecurity'].map((label) => (
                              <button key={label} onClick={() => closeAndScroll('technology')} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs text-white/65 hover:bg-white/[0.045] hover:text-white">
                                {label}<ChevronRight className="h-3 w-3 text-white/20" />
                              </button>
                            ))}
                          </div>
                          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">
                            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">Explore</div>
                            {[
                              ['How it works', 'cycle'],
                              ['See Hakilix think', 'demo'],
                              ['Security architecture', 'security'],
                            ].map(([label, id]) => (
                              <button key={label} onClick={() => closeAndScroll(id)} className="mb-1 block w-full rounded-lg px-2 py-2 text-left text-xs text-white/60 hover:bg-white/[0.045] hover:text-white">{label}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.key === 'industries' && (
                        <div className="grid grid-cols-3 gap-2">
                          {(Object.keys(industries) as IndustryKey[]).map((key) => {
                            const itemData = industries[key];
                            const Icon = itemData.icon;
                            return (
                              <button
                                key={key}
                                onClick={() => { setActiveIndustry(key); closeAndScroll('industries'); }}
                                className="group rounded-2xl border border-transparent p-4 text-left transition hover:border-white/10 hover:bg-white/[0.035]"
                              >
                                <div className="mb-5 grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.035]">
                                  <Icon className="h-4 w-4 text-white/65" />
                                </div>
                                <div className="text-sm font-semibold text-white/90">{itemData.name}</div>
                                <div className="mt-1 text-[11px] leading-4 text-white/40">{itemData.headline}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {item.key === 'research' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => closeAndScroll('research')} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 text-left hover:bg-white/[0.04]">
                            <BrainCircuit className="mb-8 h-5 w-5 text-cyan-300" />
                            <div className="text-sm font-semibold">Autonomous Risk Intelligence R&D</div>
                            <div className="mt-2 text-xs leading-5 text-white/45">Perception → context → prediction → intervention → physical autonomy.</div>
                          </button>
                          <button onClick={() => closeAndScroll('physical-ai')} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 text-left hover:bg-white/[0.04]">
                            <Boxes className="mb-8 h-5 w-5 text-violet-300" />
                            <div className="text-sm font-semibold">Physical AI</div>
                            <div className="mt-2 text-xs leading-5 text-white/45">Connecting predictive intelligence with machines, robotics and edge systems.</div>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <button onClick={() => closeAndScroll('company')} className="rounded-xl px-4 py-3 text-sm font-medium text-white/62 transition hover:bg-white/[0.04] hover:text-white">Company</button>
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <button onClick={onLoginClick} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/[0.045] hover:text-white">Portal</button>
            <button onClick={() => closeAndScroll('contact')} className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white px-4 py-2.5 text-sm font-bold text-[#07100c] transition hover:bg-emerald-200">
              Contact <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </button>
          </div>

          <button onClick={() => setMobileOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] lg:hidden" aria-label="Toggle navigation">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="border-t border-white/[0.06] bg-[#080c0f] px-5 py-5 lg:hidden">
              <div className="mx-auto grid max-w-3xl gap-2">
                {[
                  ['Technology', 'core'],
                  ['Industries', 'industries'],
                  ['Research', 'research'],
                  ['Company', 'company'],
                ].map(([label, id]) => (
                  <button key={label} onClick={() => closeAndScroll(id)} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 text-left text-sm font-semibold text-white/80">
                    {label}<ChevronRight className="h-4 w-4 text-white/30" />
                  </button>
                ))}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={onLoginClick} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70">Portal</button>
                  <button onClick={() => closeAndScroll('contact')} className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black">Contact</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top">
        <section className="relative min-h-screen overflow-hidden pt-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(16,185,129,.12),transparent_26%),radial-gradient(circle_at_86%_20%,rgba(56,189,248,.08),transparent_22%)]" />
          <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-[1500px] items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-12 lg:pb-20 lg:pt-16">
            <div className="relative z-10 max-w-2xl">
              <SectionLabel>Hakilix Labs · Deep Technology</SectionLabel>
              <h1 className="max-w-[850px] text-[clamp(3.2rem,7.8vw,7.8rem)] font-black leading-[0.86] tracking-[-0.065em]">
                Autonomous<br />
                <span className="text-white/35">Risk Intelligence</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-white/55 sm:text-xl">
                Intelligence for the physical world — designed to sense changing environments, predict emerging risk and enable action before incidents occur.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button onClick={() => scrollToId('cycle')} className="group flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-black transition hover:bg-emerald-200">
                  Explore the technology <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                <button onClick={() => scrollToId('demo')} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3.5 text-sm font-semibold text-white/78 transition hover:bg-white/[0.07]">
                  <Play className="h-4 w-4" /> See it in action
                </button>
              </div>
              <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/[0.07] pt-6 font-mono text-[9px] uppercase tracking-[0.18em] text-white/28">
                <span>Predictive intelligence</span><span>Physical AI</span><span>Edge systems</span><span>Security by design</span>
              </div>
            </div>
            <div className="relative h-[520px] lg:h-[650px]">
              <RiskScene mode="hero" />
              <div className="absolute -bottom-5 left-6 right-6 flex justify-center">
                <div className="rounded-full border border-white/10 bg-[#0c1215]/90 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40 backdrop-blur-xl">
                  Sense → Understand → Predict → Decide → Alert / Act → Learn
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-white/[0.015]">
          <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-9 sm:px-8 md:grid-cols-3 lg:px-12">
            {[
              ['One intelligence core', 'A reusable architecture rather than six disconnected products.'],
              ['Multiple physical environments', 'Care, construction, manufacturing, warehousing, energy and mining.'],
              ['One operating principle', 'Understand risk early enough to change the outcome.'],
            ].map(([title, copy]) => (
              <div key={title} className="flex gap-4">
                <CircleDot className="mt-1 h-4 w-4 shrink-0 text-emerald-300/70" />
                <div><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-xs leading-5 text-white/38">{copy}</div></div>
              </div>
            ))}
          </div>
        </section>

        <section id="cycle" className="scroll-mt-24 py-28 sm:py-36">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-14 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <div>
                <SectionLabel>What is Autonomous Risk Intelligence?</SectionLabel>
                <h2 className="max-w-xl text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">Move intelligence earlier in the risk lifecycle.</h2>
                <p className="mt-6 max-w-lg text-base leading-7 text-white/45">Most systems react after a threshold is crossed. Hakilix is being designed to recognise the signals that appear before the incident.</p>
              </div>
              <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.02] p-3 sm:p-5">
                <div className="grid gap-2 md:grid-cols-6">
                  {cycle.map((item, index) => {
                    const Icon = item.icon;
                    const active = cycleIndex === index;
                    return (
                      <button key={item.label} onMouseEnter={() => setCycleIndex(index)} onFocus={() => setCycleIndex(index)} onClick={() => setCycleIndex(index)} className={`rounded-2xl border p-4 text-left transition ${active ? 'border-emerald-300/25 bg-emerald-300/[0.065]' : 'border-transparent hover:border-white/[0.07] hover:bg-white/[0.025]'}`}>
                        <Icon className={`h-5 w-5 ${active ? 'text-emerald-300' : 'text-white/32'}`} />
                        <div className={`mt-7 text-xs font-bold ${active ? 'text-white' : 'text-white/52'}`}>{item.label}</div>
                        <div className="mt-2 hidden text-[10px] leading-4 text-white/34 md:block">{item.detail}</div>
                      </button>
                    );
                  })}
                </div>
                <motion.div key={cycleIndex} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-black/20 p-5 md:hidden">
                  <div className="text-sm font-semibold">{cycle[cycleIndex].label}</div>
                  <div className="text-xs leading-5 text-white/42">{cycle[cycleIndex].detail}</div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section id="core" className="scroll-mt-24 border-y border-white/[0.07] bg-[#080d10] py-28 sm:py-36">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-16 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <div>
                <SectionLabel>Hakilix Intelligence Core</SectionLabel>
                <h2 className="text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">One core. Different signals. Different risks.</h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/44">The industry changes. The intelligence architecture does not. Hakilix combines sensing, prediction, controlled autonomy and security into a reusable platform.</p>
                <button onClick={() => scrollToId('technology')} className="mt-8 flex items-center gap-2 text-sm font-semibold text-emerald-200">Explore capabilities <ArrowRight className="h-4 w-4" /></button>
              </div>
              <div className="relative rounded-[2rem] border border-white/[0.08] bg-black/20 p-6 sm:p-8">
                <div className="absolute inset-x-12 top-1/2 h-px bg-gradient-to-r from-transparent via-emerald-300/25 to-transparent" />
                <div className="relative grid gap-3 sm:grid-cols-2">
                  {capabilityGroups.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]">
                        <Icon className="h-5 w-5 text-white/42 transition group-hover:text-emerald-300" />
                        <div className="mt-7 text-sm font-bold">{item.title}</div>
                        <div className="mt-2 text-xs leading-5 text-white/38">{item.copy}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="industries" className="scroll-mt-24 py-28 sm:py-36">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <SectionLabel>Industry applications</SectionLabel>
              <h2 className="text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">Different environments. One intelligence architecture.</h2>
            </div>

            <div className="mt-12 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(Object.keys(industries) as IndustryKey[]).map((key) => {
                const item = industries[key];
                const active = activeIndustry === key;
                return (
                  <button key={key} onClick={() => setActiveIndustry(key)} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${active ? 'border-white/20 bg-white text-black' : 'border-white/[0.08] bg-white/[0.02] text-white/45 hover:bg-white/[0.05] hover:text-white/75'}`}>
                    {item.name}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeIndustry} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }} className="mt-8 grid gap-8 rounded-[2.25rem] border border-white/[0.08] bg-white/[0.018] p-4 sm:p-6 lg:grid-cols-[.86fr_1.14fr] lg:p-8">
                <div className="flex flex-col justify-between px-2 py-3 sm:p-5">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">{industry.eyebrow}</div>
                    <h3 className="mt-5 text-3xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl">{industry.headline}</h3>
                    <p className="mt-5 max-w-xl text-sm leading-6 text-white/44">{industry.copy}</p>
                  </div>
                  <div className="mt-10">
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">Signals</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {industry.sensors.map((sensor) => <span key={sensor} className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] text-white/48">{sensor}</span>)}
                    </div>
                    <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                      <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/25">Intelligence output</div>
                      <div className="mt-2 text-xs font-semibold" style={{ color: industry.accent }}>{industry.output}</div>
                    </div>
                  </div>
                </div>
                <RiskScene mode={industry.scene} accent={industry.accent} />
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <section id="demo" className="scroll-mt-24 border-y border-white/[0.07] bg-[#080d10] py-28 sm:py-36">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-14 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
              <div>
                <SectionLabel>See Hakilix think</SectionLabel>
                <h2 className="text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">Prediction should be visible, not buried in a dashboard.</h2>
                <p className="mt-6 max-w-lg text-base leading-7 text-white/44">This simulated sequence shows how physical signals become context, prediction and controlled intervention.</p>
                <div className="mt-8 flex items-center gap-3">
                  <button onClick={() => setScenarioPlaying((v) => !v)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07]" aria-label={scenarioPlaying ? 'Pause simulation' : 'Play simulation'}>
                    {scenarioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setScenarioIndex((scenarioIndex + 1) % scenarioSteps.length)} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-white/65 hover:bg-white/[0.07]">Next state</button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-black/20">
                <div className="grid min-h-[520px] lg:grid-cols-[1.25fr_.75fr]">
                  <div className="relative border-b border-white/[0.07] p-5 lg:border-b-0 lg:border-r">
                    <RiskScene mode="industrial" accent="#fbbf24" />
                    <div className="absolute left-9 top-9 rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-amber-200/75">Simulation · step {scenarioIndex + 1}/6</div>
                  </div>
                  <div className="p-5 sm:p-7">
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">Reasoning sequence</div>
                    <div className="mt-5 space-y-2">
                      {scenarioSteps.map((step, index) => {
                        const active = scenarioIndex === index;
                        const complete = index < scenarioIndex;
                        return (
                          <button key={step.title} onClick={() => { setScenarioIndex(index); setScenarioPlaying(false); }} className={`w-full rounded-2xl border p-4 text-left transition ${active ? 'border-emerald-300/25 bg-emerald-300/[0.055]' : 'border-white/[0.055] bg-white/[0.018] hover:bg-white/[0.035]'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[9px] font-bold ${active ? 'border-emerald-300/50 bg-emerald-300 text-black' : complete ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200' : 'border-white/10 text-white/25'}`}>{index + 1}</div>
                              <div className={`text-xs font-semibold ${active ? 'text-white' : 'text-white/50'}`}>{step.title}</div>
                            </div>
                            {active && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-9 mt-2 text-[11px] leading-5 text-white/42">{step.text}</motion.p>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="technology" className="scroll-mt-24 py-28 sm:py-36">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <SectionLabel>Deep technology</SectionLabel>
                <h2 className="text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-5xl">Built for events that happen in the real world.</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
                {[
                  ['Edge intelligence', 'Local inference lowers latency, reduces unnecessary data movement and improves resilience.', Cpu, 'Intelligence where risk happens.'],
                  ['Sensor fusion', 'No single sensor sees the whole environment. Hakilix combines signals into context.', Network, 'One operational picture.'],
                  ['Autonomous agents', 'Prediction can trigger controlled workflows while consequential actions remain governed.', Orbit, 'From prediction to coordinated action.'],
                  ['Physical AI', 'Research connects intelligence with machines, robots and spatial systems.', Boxes, 'Intelligence beyond the screen.'],
                ].map(([title, copy, Icon, kicker]) => {
                  const IconComponent = Icon as React.ComponentType<{ className?: string }>;
                  return (
                    <div key={title as string} className="min-h-[260px] rounded-[1.75rem] border border-white/[0.07] bg-white/[0.02] p-6 transition hover:border-white/15 hover:bg-white/[0.035]">
                      <IconComponent className="h-5 w-5 text-emerald-300/70" />
                      <div className="mt-16 font-mono text-[9px] uppercase tracking-[0.18em] text-white/28">{kicker as string}</div>
                      <h3 className="mt-3 text-xl font-bold tracking-[-0.02em]">{title as string}</h3>
                      <p className="mt-3 text-xs leading-5 text-white/40">{copy as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="scroll-mt-24 border-y border-white/[0.07] bg-white/[0.015] py-24 sm:py-28">
          <div className="mx-auto grid max-w-[1500px] gap-12 px-5 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:px-12">
            <div>
              <SectionLabel>Cybersecurity</SectionLabel>
              <h2 className="text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">Autonomy requires authority.</h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/44">When AI can influence a physical environment, every meaningful action must be authenticated, authorised and auditable.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ['Identity', LockKeyhole], ['Permission', ShieldCheck], ['Action', Zap], ['Audit', Layers3],
              ].map(([label, Icon], index) => {
                const IconComponent = Icon as React.ComponentType<{ className?: string }>;
                return (
                  <div key={label as string} className="relative rounded-2xl border border-white/[0.07] bg-[#080d10] p-5">
                    <IconComponent className="h-5 w-5 text-white/48" />
                    <div className="mt-10 text-sm font-bold">{label as string}</div>
                    {index < 3 && <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden h-3.5 w-3.5 text-emerald-300/40 sm:block" />}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="physical-ai" className="scroll-mt-24 py-28 sm:py-36">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="overflow-hidden rounded-[2.4rem] border border-white/[0.08] bg-[radial-gradient(circle_at_70%_40%,rgba(124,58,237,.14),transparent_28%),#090d11] p-7 sm:p-10 lg:p-14">
              <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
                <div>
                  <SectionLabel>Physical AI</SectionLabel>
                  <h2 className="text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">Intelligence beyond the screen.</h2>
                  <p className="mt-6 max-w-xl text-base leading-7 text-white/44">Hakilix is researching how predictive intelligence can connect safely with machines, robotics and edge systems that operate in physical environments.</p>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 sm:gap-4">
                  {[
                    ['Physical world', Waves], ['Hakilix Core', Cpu], ['Human / machine / robot', Boxes],
                  ].map(([label, Icon], index) => {
                    const IconComponent = Icon as React.ComponentType<{ className?: string }>;
                    return (
                      <React.Fragment key={label as string}>
                        <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-4 text-center sm:p-6">
                          <IconComponent className="mx-auto h-5 w-5 text-violet-300" />
                          <div className="mt-4 text-[10px] font-semibold text-white/60 sm:text-xs">{label as string}</div>
                        </div>
                        {index < 2 && <ArrowRight className="h-4 w-4 text-violet-300/35" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="research" className="scroll-mt-24 border-y border-white/[0.07] bg-[#080d10] py-28 sm:py-36">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <SectionLabel>Research & development</SectionLabel>
              <h2 className="text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">Researching the foundations of Autonomous Risk Intelligence.</h2>
            </div>
            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {['Perception', 'Context', 'Prediction', 'Intervention', 'Physical autonomy'].map((label, index) => (
                <div key={label} className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <div className="font-mono text-[9px] text-emerald-300/55">0{index + 1}</div>
                  <div className="mt-16 text-sm font-bold">{label}</div>
                  {index < 4 && <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden h-3.5 w-3.5 text-white/20 lg:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="company" className="scroll-mt-24 py-28 sm:py-36">
          <div className="mx-auto grid max-w-[1500px] gap-14 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:px-12">
            <div><SectionLabel>Hakilix Labs</SectionLabel></div>
            <div>
              <h2 className="max-w-5xl text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">Building intelligence before the incident.</h2>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/46">Hakilix Labs is a deep-technology research and development company building Autonomous Risk Intelligence systems for the physical world. The Hakilix Intelligence Core combines multimodal sensing, sensor fusion, edge AI, predictive intelligence, autonomous agents and cybersecurity.</p>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ['Category', 'Autonomous Risk Intelligence'],
                  ['Platform', 'Hakilix Intelligence Core'],
                  ['Operating cycle', 'Sense → Understand → Predict → Act → Learn'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5">
                    <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/25">{label}</div>
                    <div className="mt-3 text-sm font-semibold text-white/70">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 px-5 pb-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[2.5rem] border border-emerald-300/15 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,.18),transparent_30%),#0a100d] px-6 py-16 text-center sm:px-10 sm:py-24">
            <Sparkles className="mx-auto h-6 w-6 text-emerald-300" />
            <div className="mt-7 font-mono text-[9px] uppercase tracking-[0.22em] text-white/34">Hakilix Labs</div>
            <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-black leading-[1] tracking-[-0.05em] sm:text-7xl">Build safer, more intelligent physical environments.</h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-white/45">For research collaborations, pilots, engineering partnerships and strategic conversations.</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a href="mailto:scientific@hakilix.co.uk" className="group flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-black transition hover:bg-emerald-200">Contact Hakilix Labs <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></a>
              <button onClick={onRegisterClick} className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-white/70 hover:bg-white/[0.07]">Explore access</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.025]"><Orbit className="h-4 w-4 text-emerald-300/70" /></div>
            <div><div className="text-xs font-black tracking-[0.16em]">HAKILIX LABS</div><div className="mt-1 text-[9px] text-white/25">Autonomous Risk Intelligence for the Physical World</div></div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/28">
            <button onClick={() => scrollToId('core')}>Intelligence Core</button>
            <button onClick={() => scrollToId('industries')}>Industries</button>
            <button onClick={() => scrollToId('research')}>Research</button>
            <button onClick={onLoginClick}>Portal</button>
            <a href="https://www.hakilix.co.uk/" target="_blank" rel="noreferrer">hakilix.co.uk</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
