import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  HelpCircle, 
  Activity, 
  Waves, 
  Thermometer, 
  DoorClosed, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { Room, DigitalTwinState, Alert, Resident, SensorEvent } from '../types';

interface DigitalTwinViewProps {
  room: Room;
  resident: Resident | null;
  twinState: DigitalTwinState | null;
  onRunScenario: (scenarioId: string) => void;
  isLoading: boolean;
  activeAlert: Alert | null;
  onRefreshData?: () => void;
}

export default function DigitalTwinView({
  room,
  resident,
  twinState,
  onRunScenario,
  isLoading,
  activeAlert,
  onRefreshData
}: DigitalTwinViewProps) {
  const [showHelper, setShowHelper] = useState(false);
  const [activeTab, setActiveTab] = useState<'twin' | 'scenarios' | 'sensor' | 'qr-scan'>('twin');

  const [allResidents, setAllResidents] = useState<Resident[]>([]);
  const [targetResidentId, setTargetResidentId] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isScanning, setIsScanning] = useState(false);

  // Synthesize standalone browser auditory scan feedback beep tones
  const playBeep = (freq = 800, dur = 0.15) => {
    try {
      const actx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + dur);
    } catch (e) {
      // Ignored if blocked by browser autoplay rules
    }
  };

  // Safe vector-grid SVG QR pattern generator
  const renderSimulatedQR = (dataString: string) => {
    const size = 12;
    const grid = Array(size).fill(0).map(() => Array(size).fill(false));
    
    // Classic QR anchor boxes
    const setLocator = (r: number, c: number) => {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (r + i < size && c + j < size) {
            const isBorder = i === 0 || i === 2 || j === 0 || j === 2;
            grid[r + i][c + j] = isBorder || (i === 1 && j === 1);
          }
        }
      }
    };
    setLocator(0, 0);
    setLocator(0, size - 3);
    setLocator(size - 3, 0);

    // Dynamic hash grid configuration
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      hash = (hash << 5) - hash + dataString.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if ((r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3)) {
          continue;
        }
        const bitIndex = (r * size + c) % 32;
        const bitValue = (hash >> bitIndex) & 1;
        grid[r][c] = (bitValue === 1 || (r * c + r + c) % 3 === 0);
      }
    }

    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="w-24 h-24 p-1 bg-white border border-[#E6E2D3] rounded-xl shadow-xs">
        {grid.map((row, r) => 
          row.map((cell, c) => (
            <rect 
              key={`${r}-${c}`} 
              x={c} 
              y={r} 
              width={0.9} 
              height={0.9} 
              fill={cell ? '#0A2A22' : 'transparent'} 
            />
          ))
        )}
      </svg>
    );
  };

  useEffect(() => {
    fetch('/api/residents')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllResidents(data);
          if (data.length > 0) {
            const match = data.find(r => r.id === resident?.id) || data[0];
            if (match) {
              setTargetResidentId(match.id);
            }
          }
        }
      })
      .catch(err => console.error("Could not fetch residents directory for QR scans:", err));
  }, [resident]);

  const handleQRScan = async (scanType: 'enter' | 'leave') => {
    if (!targetResidentId) return;
    setIsScanning(true);
    setScanStatus({ type: null, message: '' });

    // Play scanner click tone
    playBeep(650, 0.08);

    setTimeout(async () => {
      try {
        const response = await fetch('/api/digital-twin/qr-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            residentId: targetResidentId,
            roomId: room.id,
            scanType
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          playBeep(980, 0.12);
          setTimeout(() => playBeep(1310, 0.16), 90);

          setScanStatus({
            type: 'success',
            message: data.message || `Resident scan completed successfully!`
          });

          if (onRefreshData) {
            onRefreshData();
          }
        } else {
          playBeep(260, 0.35);
          setScanStatus({
            type: 'error',
            message: data.error || 'Check authorization and room IDs.'
          });
        }
      } catch (err) {
        playBeep(260, 0.35);
        setScanStatus({
          type: 'error',
          message: 'Server failed to respond to door-edge scanner vectors.'
        });
      } finally {
        setIsScanning(false);
      }
    }, 1100);
  };

  // Convert room relative meter values (e.g. 0-6m width, 0-5m height) to pixel canvas bounds
  const getCoordinates = (x: number, y: number) => {
    const widthInMeters = room.room_geometry?.width || 6;
    const heightInMeters = room.room_geometry?.height || 5;
    
    // Scale to standard SVG width 480, height 360
    const pxX = (x / widthInMeters) * 480;
    const pxY = (y / heightInMeters) * 360;
    return { x: pxX, y: pxY };
  };

  const activityState = twinState?.activity_state || 'In Bed';
  const avatar = twinState?.avatar_position || null;
  const trail = twinState?.movement_trail || [];

  // Color theme for activity statuses
  const getStatusColor = (state: string) => {
    switch (state) {
      case 'Fall Candidate':
        return 'text-[#D98E73] bg-[#D98E73]/15 border-[#D98E73]/30';
      case 'Wandering Risk':
      case 'Near Door':
      case 'Restless':
        return 'text-[#E0A96D] bg-[#E0A96D]/15 border-[#E0A96D]/30';
      case 'Walking':
        return 'text-[#4E6E5D] bg-[#4E6E5D]/15 border-[#4E6E5D]/30';
      case 'In Bed':
        return 'text-[#7A847A] bg-[#7A847A]/15 border-[#7A847A]/30';
      case 'Room Empty':
        return 'text-[#7A847A] bg-[#7A847A]/10 border-[#7A847A]/20';
      default:
        return 'text-[#4E6E5D] bg-[#4E6E5D]/10 border-[#4E6E5D]/20';
    }
  };

  return (
    <div id="digital-twin-component" className="bg-white border border-[#E6E2D3] rounded-[28px] shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
      {/* Header Info */}
      <div className="bg-[#2D3A2D] text-white p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-[#4E6E5D] text-white px-2.5 py-0.5 rounded-full font-bold">TWIN LIVE</span>
            <h3 className="text-lg font-serif italic font-semibold tracking-tight text-white">{room.name} Digital Twin</h3>
          </div>
          <p className="text-xs text-[#A3B18A] mt-1 font-sans">
            {resident ? `Telemetry link active: ${resident.first_name} ${resident.last_name}` : 'Unassigned Physical Room'} 
            {' '} • Continuous 81GHz Non-Contact Radar Sensing
          </p>
        </div>

        <button 
          id="toggle-twin-help"
          onClick={() => setShowHelper(!showHelper)}
          className="text-[#A3B18A] hover:text-white transition p-1.5 hover:bg-white/5 rounded-full focus:outline-none cursor-pointer"
          title="Privacy Information"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Helper Panel */}
      {showHelper && (
        <div className="bg-[#F5F2ED] border-b border-[#E6E2D3] p-5 text-sm text-[#2D3A2D] leading-relaxed flex gap-3 animate-fade-in">
          <Info className="w-4 h-4 text-[#4E6E5D] shrink-0 mt-0.5" />
          <div>
            <strong>SENSING SAFEGUARDS:</strong> This terminal displays room activity vectors reconstructed strictly from ambient sensor wave reflections (Radar gait mapping &amp; thermal infrared signature grids). It is <strong>100% camera-free</strong>, preserves absolute citizen anonymity, conforms to GDPR mandates, and compiles zero high-definition body shapes. Strictly provided as clinical care support: HAKILIX does not diagnostic medical evaluations autonomically.
          </div>
        </div>
      )}

      {/* Layout Tabs */}
      <div className="flex border-b border-[#E6E2D3] bg-[#F5F2ED]/60 p-2.5 gap-2">
        <button
          onClick={() => setActiveTab('twin')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'twin'
              ? 'bg-[#2D3A2D] text-white'
              : 'text-[#7A847A] hover:text-[#2D3A2D]'
          }`}
        >
          Physical Layout Map
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'scenarios'
              ? 'bg-[#2D3A2D] text-white'
              : 'text-[#7A847A] hover:text-[#2D3A2D]'
          }`}
        >
          Inject Test Scenarios
        </button>
        <button
          onClick={() => setActiveTab('sensor')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'sensor'
              ? 'bg-[#2D3A2D] text-white'
              : 'text-[#7A847A] hover:text-[#2D3A2D]'
          }`}
        >
          Sensor Parameters
        </button>
        <button
          onClick={() => setActiveTab('qr-scan')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'qr-scan'
              ? 'bg-[#2D3A2D] text-white'
              : 'text-[#7A847A] hover:text-[#2D3A2D]'
          }`}
        >
          QR Entry/Exit Tracker
        </button>
      </div>

      {/* Primary Twin Canvas */}
      <div className="flex-1 p-6 flex flex-col justify-between bg-[#F5F2ED]/25 relative">
        {activeTab === 'twin' && (
          <div className="flex flex-col items-center justify-center flex-1">
            
            {/* Status Indicators bar */}
            <div className="w-full max-w-lg mb-4 flex items-center justify-between gap-3 p-3 bg-white border border-[#E6E2D3] rounded-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4E6E5D] animate-ping"></span>
                <span className="text-xs text-[#7A847A] font-semibold">Live Status:</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-xl border ${getStatusColor(activityState)}`}>
                  {activityState.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-[#7A847A] font-mono">
                COOP-VECTORS: OK • GATEWAY: UP
              </div>
            </div>

            {/* SVG Visual blueprint */}
            <div className="relative bg-[#F5F2ED] rounded-3xl border-2 border-[#E6E2D3] w-full max-w-lg aspect-[4/3] overflow-hidden shadow-inner">
              
              {/* Radar Area emissions overlay */}
              <svg 
                viewBox="0 0 480 360" 
                className="absolute inset-0 w-full h-full select-none pointer-events-none"
              >
                {/* 81GHz wave emissions sweep lines */}
                <path 
                  d="M 240 10 A 100 100 0 0 1 340 110 L 240 10 Z" 
                  fill="rgba(16, 185, 129, 0.03)" 
                  stroke="rgba(16, 185, 129, 0.1)"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
                <circle 
                  cx="240" 
                  cy="10" 
                  r="60" 
                  fill="none" 
                  stroke="rgba(16, 185, 129, 0.07)" 
                  strokeWidth="1"
                />
                <circle 
                  cx="240" 
                  cy="10" 
                  r="120" 
                  fill="none" 
                  stroke="rgba(16, 185, 129, 0.04)" 
                  strokeWidth="1" 
                />

                {/* Grid guidelines to look professional */}
                <g stroke="#cbd5e1" strokeWidth="0.5" opacity="0.3">
                  <line x1="80" y1="0" x2="80" y2="360" />
                  <line x1="160" y1="0" x2="160" y2="360" />
                  <line x1="240" y1="0" x2="240" y2="360" />
                  <line x1="320" y1="0" x2="320" y2="360" />
                  <line x1="400" y1="0" x2="400" y2="360" />

                  <line x1="0" y1="60" x2="480" y2="60" />
                  <line x1="0" y1="120" x2="480" y2="120" />
                  <line x1="0" y1="180" x2="480" y2="180" />
                  <line x1="0" y1="240" x2="480" y2="240" />
                  <line x1="0" y1="300" x2="480" y2="300" />
                </g>

                {/* Bed bounds (UK Standard Single 900x1900mm, relative scaled) */}
                <g transform="translate(60, 48)">
                  <rect 
                    x="0" 
                    y="0" 
                    width="72" 
                    height="152" 
                    rx="6" 
                    fill="#f1f5f9" 
                    stroke="#94a3b8" 
                    strokeWidth="1.5" 
                  />
                  {/* Pillow */}
                  <rect x="11" y="10" width="50" height="20" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  {/* Sheets fold */}
                  <path d="M 0 60 L 72 75 L 72 152 L 0 152 Z" fill="#e2e8f0" opacity="0.8" />
                  <text 
                    x="36" 
                    y="168" 
                    className="fill-slate-500 font-mono text-[8px] font-semibold text-center select-none" 
                    textAnchor="middle"
                  >
                    UK STANDARD
                  </text>
                  <text 
                    x="36" 
                    y="178" 
                    className="fill-slate-500 font-mono text-[7px] font-semibold text-center select-none" 
                    textAnchor="middle"
                  >
                    SINGLE BED (900x1900)
                  </text>
                </g>

                {/* UK Standard Armchair */}
                <g transform="translate(48, 230)">
                  <rect x="0" y="0" width="50" height="45" rx="4" fill="#f8fafc" stroke="#94a3b8" />
                  <rect x="10" y="8" width="30" height="30" rx="2" fill="#e2e8f0" stroke="#cbd5e1" />
                  <text x="25" y="55" className="fill-slate-500 font-mono text-[8px] text-center" textAnchor="middle">ARMCHAIR</text>
                </g>

                {/* Built-in Wardrobe */}
                <g transform="translate(240, 48)">
                  <rect x="0" y="0" width="80" height="40" rx="2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="40" y1="0" x2="40" y2="40" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="40" y="23" className="fill-slate-500 font-mono text-[8px] text-center" textAnchor="middle">WARDROBE</text>
                </g>

                {/* Bathroom Ensuite Zone (reconstructed, Wet room style) */}
                <g transform="translate(320, 180)">
                  <rect 
                    x="0" 
                    y="0" 
                    width="140" 
                    height="160" 
                    rx="2" 
                    fill="rgba(14, 165, 233, 0.03)" 
                    stroke="#bae6fd" 
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  {/* Toilet visual model */}
                  <ellipse cx="25" cy="30" rx="12" ry="18" fill="#f8fafc" stroke="#bae6fd" strokeWidth="1" />
                  <rect x="5" y="5" width="40" height="12" rx="2" fill="#ffffff" stroke="#bae6fd" strokeWidth="1" />
                  {/* Wet room shower basin */}
                  <rect x="70" y="90" width="60" height="60" rx="4" fill="#ffffff" stroke="#bae6fd" strokeWidth="1" />
                  <circle cx="100" cy="120" r="4" fill="#bae6fd" />
                  {/* Washbasin */}
                  <path d="M 120 15 C 100 15, 100 45, 120 45" fill="#ffffff" stroke="#bae6fd" />
                  
                  <text 
                    x="70" 
                    y="130" 
                    className="fill-sky-500/80 font-mono text-[9px] font-bold select-none" 
                    textAnchor="middle"
                  >
                    WET ROOM EN-SUITE
                  </text>
                </g>

                {/* Room sensor physical node on backwall */}
                <g transform="translate(225, 6)">
                  <rect x="0" y="0" width="30" height="8" rx="2" fill="#1e293b" />
                  <circle cx="15" cy="4" r="2.5" fill="#10b981" />
                </g>

                {/* Entry door representation */}
                <g transform="translate(10, 310)">
                  <path d="M 0 0 C 40 0, 50 30, 50 40" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="0" y1="0" x2="50" y2="0" stroke="#64748b" strokeWidth="2.5" />
                  <text x="55" y="15" className="fill-slate-500 font-mono text-[9px]">DOOR WAY</text>
                </g>

                {/* Historical steps connection lines (glowing path trail to look advanced) */}
                {trail.length > 1 && (
                  <g>
                    {trail.map((pt, index) => {
                      if (index === 0) return null;
                      const prev = getCoordinates(trail[index - 1].x, trail[index - 1].y);
                      const curr = getCoordinates(pt.x, pt.y);
                      return (
                        <line 
                          key={`trail-${index}`}
                          x1={prev.x} 
                          y1={prev.y} 
                          x2={curr.x} 
                          y2={curr.y} 
                          stroke="rgba(16, 185, 129, 0.45)"
                          strokeWidth="2"
                          strokeDasharray="2 3"
                          className="opacity-75"
                        />
                      );
                    })}
                  </g>
                )}

                {/* Live anonymous tracking avatar dot (no camera model) */}
                {avatar && (
                  <g>
                    {/* Glowing outer rings */}
                    <circle 
                      cx={getCoordinates(avatar.x, avatar.y).x}
                      cy={getCoordinates(avatar.x, avatar.y).y}
                      r={activityState === 'Fall Candidate' ? "18" : "11"}
                      fill="none"
                      className={activityState === 'Fall Candidate' ? "stroke-rose-500 fill-rose-500/10 animate-ping" : "stroke-emerald-400 fill-emerald-400/5 animate-pulse"}
                      strokeWidth="1.5"
                    />

                    {/* Accurate sensory point dot */}
                    <circle 
                      cx={getCoordinates(avatar.x, avatar.y).x}
                      cy={getCoordinates(avatar.x, avatar.y).y}
                      r="6.5"
                      fill={activityState === 'Fall Candidate' ? "#f43f5e" : "#10b981"}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="shadow-md"
                    />
                    
                    {/* Position Label Tag */}
                    <g transform={`translate(${getCoordinates(avatar.x, avatar.y).x - 40}, ${getCoordinates(avatar.x, avatar.y).y - 25})`}>
                      <rect x="0" y="0" width="80" height="15" rx="3" fill="#1e293b" opacity="0.9" />
                      <text 
                        x="40" 
                        y="10" 
                        className="fill-white font-mono text-[7.5px] font-black" 
                        textAnchor="middle"
                      >
                        {activityState === 'Fall Candidate' ? 'FALL DETECTED' : `COORDS: ${avatar.x.toFixed(1)}m, ${avatar.y.toFixed(1)}m`}
                      </text>
                    </g>
                  </g>
                )}

              </svg>

              {/* Critical active fall warning overlay */}
              {activeAlert && activeAlert.status === 'New' && (
                <div className="absolute inset-x-0 bottom-0 bg-[#D98E73] text-white p-4 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-white animate-spin shrink-0" />
                    <span className="text-xs font-bold leading-normal">
                      CRITICAL {activeAlert.alert_type.toUpperCase()} ALARM IN ROOM
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#2D3A2D] text-white px-2.5 py-1 rounded-full shadow-xxs">
                    CONFIDENCE: {Math.round(activeAlert.confidence_score * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Room metadata legends */}
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-[#7A847A] font-sans text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#E6E2D3] border border-[#7A847A]/30 rounded-[4px]"></span>
                <span>Bed Enclosure (1.8m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#F5F2ED] border border-[#E6E2D3] rounded-[4px]"></span>
                <span>En-Suite Facility</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#4E6E5D] rounded-full"></span>
                <span>Live Radar Target</span>
              </div>
            </div>
            
          </div>
        )}

        {activeTab === 'sensor' && (
          <div className="bg-white border border-[#E6E2D3] rounded-[28px] p-6 shadow-sm flex-1 max-w-lg mx-auto flex flex-col justify-start w-full">
            <h4 className="text-base font-serif italic font-bold text-[#2D3A2D] mb-4 flex items-center gap-2">
              <Waves className="w-5 h-5 text-[#4E6E5D]" />
              81GHz mmWave Radar &amp; Radiometric Parameters
            </h4>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#F5F2ED]/50 rounded-2xl border border-[#E6E2D3]/40">
                <div className="font-semibold text-[#2D3A2D] font-mono text-[10px] tracking-wider uppercase">RADAR BEAM ANGLE (AZIMUTH)</div>
                <div className="text-[#7A847A] mt-1 leading-relaxed">120° Horizontal, 85° Vertical Field-of-View covering entire bed and toilet vectors.</div>
              </div>

              <div className="p-4 bg-[#F5F2ED]/50 rounded-2xl border border-[#E6E2D3]/40">
                <div className="font-semibold text-[#2D3A2D] font-mono text-[10px] tracking-wider uppercase">RADAR DOPPLER FREQUENCY</div>
                <div className="text-[#7A847A] mt-1 leading-relaxed">81.25 GHz sweep carrier, safe 10mW ERP. Resolves sub-millimeter thoracic motions (breathing rate tracking).</div>
              </div>

              <div className="p-4 bg-[#F5F2ED]/50 rounded-2xl border border-[#E6E2D3]/40">
                <div className="font-semibold text-[#2D3A2D] font-mono text-[10px] tracking-wider uppercase">INFRARED THERMAL ARRAYS</div>
                <div className="text-[#7A847A] mt-1 leading-relaxed">80x60 radiometric grid elements measuring delta temperature contours. Used as physical verification to radar fall candidates.</div>
              </div>

              <div className="p-4 bg-[#F5F2ED]/50 rounded-2xl border border-[#E6E2D3]/40">
                <div className="font-semibold text-[#2D3A2D] font-mono text-[10px] tracking-wider uppercase">CALIBRATION ACCURACY SCORE</div>
                <div className="text-[#4E6E5D] font-bold mt-1">✓ 99.4% Standard Gait Confidence Index • Calibration Checked June 2026</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="bg-white border text-center border-[#E6E2D3] rounded-[28px] p-6 shadow-sm flex-1 max-w-lg mx-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F5F2ED] text-[#4E6E5D] mx-auto mb-3 border border-[#E6E2D3]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-[#2D3A2D] font-serif italic">Demonstration Scenario Injector</h4>
              <p className="text-xs text-[#7A847A] mt-1.5 max-w-sm mx-auto leading-relaxed">
                Trigger simulated ambient sensory events (Radar wave velocity shifts, thermal bed pressures, carbon monoxide indicators) to preview HAKILIX core safety workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 my-4 overflow-y-auto max-h-[240px] pr-1">
              <button
                id="scenario-fall-btn"
                onClick={() => onRunScenario('resident_c_fall_candidate')}
                className="p-3 border border-[#D98E73]/30 hover:border-[#D98E73]/60 rounded-2xl bg-[#D98E73]/5 hover:bg-[#D98E73]/10 text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h5 className="text-xs font-bold text-[#D98E73]">Resident C — Fall Event Demo</h5>
                  <p className="text-[10px] text-[#A6624B] mt-0.5 font-sans">Simulates accelerated vertical radar displacement vector.</p>
                </div>
                <span className="text-[10px] font-semibold bg-[#D98E73] text-white px-2.5 py-1 rounded-full">RUN</span>
              </button>

              <button
                id="scenario-exit-btn"
                onClick={() => onRunScenario('resident_a_night_bed_exit')}
                className="p-3 border border-[#4E6E5D]/30 hover:border-[#4E6E5D]/60 rounded-2xl bg-[#4E6E5D]/5 hover:bg-[#4E6E5D]/10 text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h5 className="text-xs font-bold text-[#4E6E5D]">Resident A — Night-Time Bed Exit</h5>
                  <p className="text-[10px] text-[#2D3A2D]/70 mt-0.5 font-sans">Fires a real-time dementia wander alert near door perimeter.</p>
                </div>
                <span className="text-[10px] font-semibold bg-[#4E6E5D] text-white px-2.5 py-1 rounded-full">RUN</span>
              </button>

              <button
                id="scenario-wander-btn"
                onClick={() => onRunScenario('resident_b_wandering_risk')}
                className="p-3 border border-[#E0A96D]/30 hover:border-[#E0A96D]/60 rounded-2xl bg-[#E0A96D]/5 hover:bg-[#E0A96D]/10 text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h5 className="text-xs font-bold text-[#A66E2E]">Resident B — Wandering Risk Lingering</h5>
                  <p className="text-[10px] text-[#A66E2E]/80 mt-0.5 font-sans">Radar traces long lingering periods close to door entrance.</p>
                </div>
                <span className="text-[10px] font-semibold bg-[#E0A96D] text-white px-2.5 py-1 rounded-full">RUN</span>
              </button>

              <button
                id="scenario-restless-btn"
                onClick={() => onRunScenario('resident_f_restlessness')}
                className="p-3 border border-[#E6E2D3] hover:border-[#A3B18A] rounded-2xl bg-[#F5F2ED]/50 text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h5 className="text-xs font-semibold text-[#2D3A2D]">Resident F — Night Restlessness Cycle</h5>
                  <p className="text-[10px] text-[#7A847A] mt-0.5 font-sans">Thermal body-heat signatures shift frequency inside bed frame.</p>
                </div>
                <span className="text-[10px] font-semibold bg-[#2D3A2D] text-white px-2.5 py-1 rounded-full">RUN</span>
              </button>

              <button
                onClick={() => onRunScenario('resident_g_environmental_discomfort')}
                className="p-3 border border-[#E6E2D3] hover:border-[#A3B18A] rounded-2xl bg-[#F5F2ED]/50 text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h5 className="text-xs font-semibold text-[#2D3A2D]">Resident G — Environmental Discomfort</h5>
                  <p className="text-[10px] text-[#7A847A] mt-0.5 font-sans">Increments heat sensor to 26.5°C over threshold.</p>
                </div>
                <span className="text-[10px] font-semibold bg-[#2D3A2D] text-white px-2.5 py-1 rounded-full">RUN</span>
              </button>

              <button
                onClick={() => onRunScenario('device_tamper')}
                className="p-3 border border-[#E6E2D3] hover:border-[#A3B18A] rounded-2xl bg-[#F5F2ED]/50 text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h5 className="text-xs font-semibold text-[#2D3A2D]">PoE Hardware Tamper Event</h5>
                  <p className="text-[10px] text-[#7A847A] mt-0.5 font-sans">Activates physical tamper alert on device health logs.</p>
                </div>
                <span className="text-[10px] font-semibold bg-[#2D3A2D] text-white px-2.5 py-1 rounded-full">RUN</span>
              </button>
            </div>

            <div className="text-[11px] text-[#7A847A] font-sans mt-1 leading-normal">
              Running any scenario will generate sensor timeline points, trigger active alerts, and update the twin environment instantly.
            </div>
          </div>
        )}
        {activeTab === 'qr-scan' && (
          <div className="bg-white border border-[#E6E2D3] rounded-[28px] p-6 shadow-sm flex-1 max-w-2xl mx-auto flex flex-col md:flex-row gap-6 w-full h-full min-h-[460px]">
            {/* Live Scanner Camera Simulation */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#2D3A2D] font-serif italic mb-1 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Physical Entry &amp; Exit QR Hub
                </h4>
                <p className="text-[11px] text-[#7A847A] leading-relaxed">
                  Identify resident badges at the threshold. Scanning automatically recalibrates the en-suite digital twin with spatial coordinates.
                </p>
              </div>

              {/* Scanning Viewfinder Frame */}
              <div className="relative my-4 aspect-[4/3] bg-stone-900 rounded-2xl overflow-hidden border border-stone-805 flex flex-col items-center justify-center min-h-[220px]">
                
                {/* Simulated Lens Aperture Background lines */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <div className="absolute w-full h-0.5 bg-sky-500 top-1/4"></div>
                  <div className="absolute w-full h-0.5 bg-sky-500 top-2/4"></div>
                  <div className="absolute w-full h-0.5 bg-sky-500 top-3/4"></div>
                  <div className="absolute h-full w-0.5 bg-sky-500 left-1/4"></div>
                  <div className="absolute h-full w-0.5 bg-sky-500 left-2/4"></div>
                  <div className="absolute h-full w-0.5 bg-sky-500 left-3/4"></div>
                </div>

                {/* Corner Frame Indicators */}
                <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-md"></div>
                <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-md"></div>
                <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-md"></div>
                <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-md"></div>

                {/* Laser Scanning Bar Animation */}
                <motion.div 
                  initial={{ top: '15%' }}
                  animate={{ top: '85%' }}
                  transition={{ 
                    duration: 2.2, 
                    repeat: Infinity, 
                    repeatType: 'reverse', 
                    ease: 'easeInOut' 
                  }}
                  className="absolute left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-500/80 z-10"
                />

                {/* Scanner states */}
                {isScanning ? (
                  <div className="text-center z-20 space-y-2">
                    <Activity className="w-8 h-8 text-emerald-400 animate-pulse mx-auto" />
                    <p className="text-[11px] font-mono text-emerald-400 tracking-widest uppercase animate-pulse">DECODING DIGITAL BADGE VECTORS...</p>
                  </div>
                ) : scanStatus.type === 'success' ? (
                  <div className="text-center z-20 space-y-2 p-4 bg-emerald-950/85 rounded-xl border border-emerald-500/30 max-w-[210px] animate-fade-in mx-auto">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold ml-auto mr-auto mb-1 text-sm">✓</div>
                    <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wide">CONFIRMED PASS</p>
                    <p className="text-[9px] text-emerald-200/90 font-sans leading-tight mt-1">{scanStatus.message}</p>
                  </div>
                ) : scanStatus.type === 'error' ? (
                  <div className="text-center z-20 space-y-2 p-4 bg-rose-950/85 rounded-xl border border-rose-500/30 max-w-[210px] animate-fade-in mx-auto">
                    <span className="text-rose-400 font-bold font-mono text-lg block mb-1">⚠</span>
                    <p className="text-[10px] font-mono text-rose-400 uppercase tracking-wide">SCAN ERROR</p>
                    <p className="text-[9px] text-rose-200/90 font-sans leading-tight mt-1">{scanStatus.message}</p>
                    <button onClick={() => setScanStatus({ type: null, message: '' })} className="text-[8px] bg-rose-500 hover:bg-rose-600 text-white px-2 py-0.5 rounded uppercase font-semibold cursor-pointer mt-1">Reset</button>
                  </div>
                ) : (
                  <div className="text-center z-20 text-stone-400 px-6">
                    <HelpCircle className="w-7 h-7 text-stone-500 mx-auto mb-1 animate-pulse" />
                    <p className="text-[10px] font-mono tracking-wider text-stone-300">WAITING FOR RFID / QR CARER BADGE</p>
                    <p className="text-[9px] text-stone-500 mt-1">Select a resident below to simulate scanning their custom secure badge</p>
                  </div>
                )}
              </div>

              {/* Resident select and triggers */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#7A847A] mb-1 font-semibold">Select Resident to Scan</label>
                  <select
                    value={targetResidentId}
                    onChange={(e) => {
                      setTargetResidentId(e.target.value);
                      setScanStatus({ type: null, message: '' });
                    }}
                    disabled={isScanning}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E6E2D3] bg-white text-[#2D3A2D] focus:outline-none focus:border-[#4E6E5D]"
                  >
                    {allResidents.map(res => (
                      <option key={res.id} value={res.id}>
                        {res.first_name} {res.last_name} ({res.resident_reference_code || 'No REF'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQRScan('enter')}
                    disabled={isScanning || !targetResidentId}
                    className="py-2.5 px-3 bg-[#4E6E5D] hover:bg-[#3D5649] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 select-none shadow-sm"
                  >
                    <span>Scan IN (Enter)</span>
                  </button>
                  <button
                    onClick={() => handleQRScan('leave')}
                    disabled={isScanning || !targetResidentId}
                    className="py-2.5 px-3 bg-stone-700 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 select-none shadow-sm"
                  >
                    <span>Scan OUT (Exit)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Resident Badge Display Panel (Right side) */}
            {(() => {
              const selectedRes = allResidents.find(r => r.id === targetResidentId) || resident;
              if (!selectedRes) return (
                <div className="flex-1 bg-stone-50 rounded-2xl border border-dashed border-[#E6E2D3] flex items-center justify-center text-[#7A847A] text-xs h-full min-h-[300px]">
                  No resident selected
                </div>
              );

              return (
                <div className="w-full md:w-64 bg-gradient-to-br from-[#F5F2ED] to-[#E6E2D3]/30 border border-[#E6E2D3] rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                  <div className="space-y-4">
                    {/* Header bar */}
                    <div className="flex justify-between items-center border-b border-[#E6E2D3] pb-2">
                      <div className="leading-none">
                        <span className="text-[8px] font-sans font-extrabold uppercase tracking-widest text-[#4E6E5D]">ROSEWOOD PORTAL</span>
                        <h5 className="text-[10px] font-serif italic text-[#0A2A22] font-black leading-tight">SECURE ACCESS</h5>
                      </div>
                      <span className="text-[7px] font-mono bg-[#4E6E5D] text-white px-1.5 py-0.5 rounded font-black">ID BADGE</span>
                    </div>

                    {/* Badge details */}
                    <div className="flex items-start gap-3">
                      {/* Badge initial logo */}
                      {(() => {
                        const init = `${selectedRes.first_name ? selectedRes.first_name.charAt(0) : ''}${selectedRes.last_name ? selectedRes.last_name.charAt(0) : ''}`.toUpperCase() || 'R';
                        return (
                          <div className="w-11 h-11 rounded-xl bg-white border border-[#E6E2D3] flex items-center justify-center font-bold text-[#4E6E5D] text-sm tracking-wider shadow-xxs shrink-0">
                            {init}
                          </div>
                        );
                      })()}
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-[#7A847A] font-mono leading-none">NAME</p>
                        <h4 className="text-xs font-bold text-[#2D3A2D] truncate mt-0.5">{selectedRes.first_name} {selectedRes.last_name}</h4>
                        <p className="text-[8px] text-[#4E6E5D] font-medium mt-1 uppercase tracking-wider">{selectedRes.care_category}</p>
                      </div>
                    </div>

                    {/* QR Code renderer */}
                    <div className="flex flex-col items-center justify-center pt-2">
                      <div className="mb-1.5 text-center">
                        <span className="text-[8px] font-mono text-[#7A847A] uppercase">SCAN THRESHOLD QR</span>
                      </div>
                      {renderSimulatedQR(selectedRes.resident_reference_code || selectedRes.id)}
                      <span className="text-[8px] font-mono text-[#7A847A] tracking-wider mt-1.5 truncate max-w-full">REF: {selectedRes.resident_reference_code || selectedRes.id}</span>
                    </div>
                  </div>

                  <div className="border-t border-[#E6E2D3]/60 pt-2.5 text-center mt-4">
                    <span className="text-[7.5px] font-mono text-[#7A847A] uppercase tracking-tighter">
                      ROSEWOOD SAFETY INTEGRITY SYSTEM • EST 2026
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
