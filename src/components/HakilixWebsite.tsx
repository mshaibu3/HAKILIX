import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Eye, 
  Heart, 
  Award, 
  BookOpen, 
  Check, 
  Database, 
  AlertTriangle, 
  Play, 
  ArrowRight, 
  Lock, 
  Mail, 
  Building, 
  Users, 
  Sparkles,
  Zap,
  ChevronRight,
  Stethoscope,
  Info,
  UserPlus,
  X,
  Shield,
  HelpCircle,
  FileText,
  MapPin,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface WebsiteProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function HakilixWebsite({ onLoginClick, onRegisterClick }: WebsiteProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'solutions' | 'technology' | 'research' | 'sandbox'>('home');
  const [showCookiesBanner, setShowCookiesBanner] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  // Interactive Sandbox Simulator State
  const [patientState, setPatientState] = useState<'standing' | 'sitting' | 'restless' | 'fallen'>('standing');
  const [sensorHz, setSensorHz] = useState<number>(81);
  const [filterThreshold, setFilterThreshold] = useState<number>(65);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  
  // Radar canvas simulation reference
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Interactive Solutions target selector
  const [selectedSolutionCategory, setSelectedSolutionCategory] = useState<'individuals' | 'environments'>('individuals');

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    org: '',
    email: '',
    interest: 'pilot',
    message: '',
    submitted: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('hakilix_cookies_accepted');
    if (!consent) {
      setShowCookiesBanner(true);
    }
  }, []);

  const handleAcceptCookies = (type: 'all' | 'essential') => {
    localStorage.setItem('hakilix_cookies_accepted', type);
    setShowCookiesBanner(false);
  };
  
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactForm(prev => ({ ...prev, submitted: true }));
    setTimeout(() => {
      setContactForm({
        name: '',
        org: '',
        email: '',
        interest: 'pilot',
        message: '',
        submitted: false
      });
    }, 4000);
  };

  // Canvas Radar Skeletal Render Loop
  useEffect(() => {
    if (!isSimulating || (activeTab !== 'sandbox' && activeTab !== 'home')) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let frame = 0;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    resizeCanvas();
    
    const getJoints = (pState: string, centerX: number, centerY: number, frame: number) => {
      const joints: Record<string, { x: number; y: number }> = {};
      const breath = Math.sin(frame * 0.08) * 3;
      const hOffset = Math.sin(frame * 0.04) * 2.5;
      
      if (pState === 'standing') {
        joints.head = { x: centerX + hOffset, y: centerY - 65 + breath };
        joints.neck = { x: centerX + hOffset, y: centerY - 45 + breath };
        joints.chest = { x: centerX + hOffset * 0.5, y: centerY - 20 + breath };
        joints.pelvis = { x: centerX, y: centerY + 15 };
        
        joints.lShoulder = { x: centerX - 24, y: centerY - 32 + breath };
        joints.rShoulder = { x: centerX + 24, y: centerY - 32 + breath };
        
        joints.lElbow = { x: centerX - 36, y: centerY - 5 + breath + hOffset };
        joints.rElbow = { x: centerX + 36, y: centerY - 5 + breath - hOffset };
        
        joints.lHand = { x: centerX - 32, y: centerY + 22 + breath };
        joints.rHand = { x: centerX + 32, y: centerY + 22 + breath };
        
        joints.lHip = { x: centerX - 14, y: centerY + 20 };
        joints.rHip = { x: centerX + 14, y: centerY + 20 };
        
        joints.lKnee = { x: centerX - 15, y: centerY + 55 };
        joints.rknee = { x: centerX + 15, y: centerY + 55 };
        
        joints.lFoot = { x: centerX - 16, y: centerY + 95 };
        joints.rFoot = { x: centerX + 16, y: centerY + 95 };
      } 
      else if (pState === 'sitting') {
        joints.head = { x: centerX - 15, y: centerY - 30 + breath };
        joints.neck = { x: centerX - 15, y: centerY - 10 + breath };
        joints.chest = { x: centerX - 12, y: centerY + 8 + breath };
        joints.pelvis = { x: centerX - 10, y: centerY + 35 };
        
        joints.lShoulder = { x: centerX - 32, y: centerY - 2 + breath };
        joints.rShoulder = { x: centerX + 10, y: centerY - 2 + breath };
        
        joints.lElbow = { x: centerX - 42, y: centerY + 24 };
        joints.rElbow = { x: centerX + 20, y: centerY + 24 };
        
        joints.lHand = { x: centerX - 26, y: centerY + 36 };
        joints.rHand = { x: centerX + 26, y: centerY + 36 };
        
        joints.lHip = { x: centerX - 22, y: centerY + 42 };
        joints.rHip = { x: centerX + 6, y: centerY + 42 };
        
        joints.lKnee = { x: centerX + 25, y: centerY + 42 };
        joints.rknee = { x: centerX + 45, y: centerY + 42 };
        
        joints.lFoot = { x: centerX + 25, y: centerY + 90 };
        joints.rFoot = { x: centerX + 45, y: centerY + 90 };
      } 
      else if (pState === 'restless') {
        const rawJitter = Math.sin(frame * 0.25) * 8;
        const drift = Math.cos(frame * 0.08) * 14;
        
        joints.head = { x: centerX + drift, y: centerY - 55 + rawJitter };
        joints.neck = { x: centerX + drift * 0.8, y: centerY - 35 + rawJitter };
        joints.chest = { x: centerX + drift * 0.5, y: centerY - 15 + rawJitter };
        joints.pelvis = { x: centerX, y: centerY + 20 };
        
        joints.lShoulder = { x: centerX - 26 + drift * 0.6, y: centerY - 25 + rawJitter };
        joints.rShoulder = { x: centerX + 26 + drift * 0.6, y: centerY - 25 + rawJitter };
        
        joints.lElbow = { x: centerX - 44 + drift * 0.4, y: centerY + 2 + rawJitter };
        joints.rElbow = { x: centerX + 44 + drift * 0.4, y: centerY + 2 + rawJitter };
        
        joints.lHand = { x: centerX - 36 + drift, y: centerY + 25 };
        joints.rHand = { x: centerX + 36 + drift, y: centerY + 25 };
        
        joints.lHip = { x: centerX - 14, y: centerY + 25 };
        joints.rHip = { x: centerX + 14, y: centerY + 25 };
        
        joints.lKnee = { x: centerX - 18 + Math.sin(frame * 0.1) * 8, y: centerY + 60 };
        joints.rknee = { x: centerX + 18 + Math.cos(frame * 0.1) * 8, y: centerY + 60 };
        
        joints.lFoot = { x: centerX - 20, y: centerY + 95 };
        joints.rFoot = { x: centerX + 20, y: centerY + 95 };
      } 
      else { // fallen (lying horizontal)
        const twitchY = Math.sin(frame * 0.06) * 2.5;
        joints.head = { x: centerX - 75, y: centerY + 65 + twitchY };
        joints.neck = { x: centerX - 55, y: centerY + 67 + twitchY };
        joints.chest = { x: centerX - 20, y: centerY + 70 + twitchY };
        joints.pelvis = { x: centerX + 18, y: centerY + 72 };
        
        joints.lShoulder = { x: centerX - 25, y: centerY + 53 };
        joints.rShoulder = { x: centerX - 15, y: centerY + 87 };
        
        joints.lKnee = { x: centerX + 58, y: centerY + 54 };
        joints.rknee = { x: centerX + 53, y: centerY + 78 };
        
        joints.lFoot = { x: centerX + 88, y: centerY + 60 };
        joints.rFoot = { x: centerX + 83, y: centerY + 80 };
      }
      
      return joints;
    };

    const generateAvatarCloudPoints = (joints: Record<string, { x: number; y: number }>, pState: string, width: number, height: number, frame: number) => {
      const points: { x: number; y: number; val: number; color: string }[] = [];
      const jointKeys = Object.keys(joints);
      if (jointKeys.length === 0) return [];

      jointKeys.forEach(key => {
        const joint = joints[key];
        const numPoints = 6 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < numPoints; i++) {
          const spread = 8 + Math.random() * 12;
          const angle = Math.random() * Math.PI * 2;
          const x = joint.x + Math.cos(angle) * (Math.random() * spread);
          const y = joint.y + Math.sin(angle) * (Math.random() * spread);
          
          const intensity = 55 + Math.random() * 45;
          const color = pState === 'fallen' 
            ? `rgba(239, 68, 68, ${intensity / 130})` 
            : pState === 'restless'
            ? `rgba(245, 158, 11, ${intensity / 130})` 
            : `rgba(163, 177, 138, ${intensity / 130})`;
            
          points.push({ x, y, val: intensity, color });
        }
      });

      // Ambient reflections along walls
      for (let i = 0; i < 15; i++) {
        points.push({
          x: Math.random() * width,
          y: height - 15 - Math.random() * 10,
          val: Math.random() * 40,
          color: 'rgba(78, 110, 93, 0.12)'
        });
      }

      return points;
    };

    const render = () => {
      frame++;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) {
        animationId = requestAnimationFrame(render);
        return;
      }

      // Check if size matches, otherwise adjust back-buffer
      if (canvas.width !== w * window.devicePixelRatio || canvas.height !== h * window.devicePixelRatio) {
        resizeCanvas();
      }
      
      // Clean modern background
      ctx.fillStyle = '#061713'; 
      ctx.fillRect(0, 0, w, h);
      
      const centerX = w / 2;
      const centerY = h / 2 - 10;
      const radarOriginX = w / 2;
      const radarOriginY = 15;
      
      // Concentric Range Rings (0.5m intervals up to 3.0m)
      ctx.strokeStyle = 'rgba(78, 110, 93, 0.15)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 5]);
      
      const rings = [60, 110, 160, 210, 260];
      const ringLabels = ['0.5m', '1.0m', '1.5m', '2.0m', '2.5m'];
      rings.forEach((radius, idx) => {
        ctx.beginPath();
        ctx.arc(radarOriginX, radarOriginY, radius, 0, Math.PI);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(163, 177, 138, 0.4)';
        ctx.font = '7px monospace';
        ctx.fillText(ringLabels[idx], radarOriginX - radius + 2, radarOriginY + 10);
        ctx.fillText(ringLabels[idx], radarOriginX + radius - 20, radarOriginY + 10);
      });
      ctx.setLineDash([]);
      
      // Horizontal and vertical axis helper guides
      ctx.strokeStyle = 'rgba(78, 110, 93, 0.08)';
      ctx.beginPath();
      ctx.moveTo(radarOriginX, radarOriginY);
      ctx.lineTo(radarOriginX, h);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(15, h / 2);
      ctx.lineTo(w - 15, h / 2);
      ctx.stroke();
      
      // Fan Sweep Radar Wave
      const sweepAngleRange = Math.PI / 3; // 60 degrees left/right
      const sweepPeriod = activeTab === 'sandbox' ? 0.015 : 0.01;
      const sweepAngle = radarOriginY + Math.PI / 2 + Math.sin(frame * sweepPeriod) * sweepAngleRange;
      
      // Draw swept fan slice trail
      const sweepGrad = ctx.createRadialGradient(radarOriginX, radarOriginY, 5, radarOriginX, radarOriginY, h);
      sweepGrad.addColorStop(0, 'rgba(78, 110, 93, 0.12)');
      sweepGrad.addColorStop(1, 'rgba(78, 110, 93, 0.00)');
      
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(radarOriginX, radarOriginY);
      ctx.arc(radarOriginX, radarOriginY, h * 0.9, sweepAngle - 0.12, sweepAngle + 0.12);
      ctx.closePath();
      ctx.fill();
      
      // Sweep indicator beam
      ctx.strokeStyle = 'rgba(163, 177, 138, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(radarOriginX, radarOriginY);
      ctx.lineTo(radarOriginX + Math.cos(sweepAngle) * (h * 0.85), radarOriginY + Math.sin(sweepAngle) * (h * 0.85));
      ctx.stroke();
      
      // Define Focus point coordinate based on current activity state to drive telemetry lines
      let fx = centerX;
      let fy = centerY;
      
      if (patientState === 'standing') {
        fx = centerX + 40;
        fy = centerY - 10;
      } else if (patientState === 'sitting') {
        fx = centerX - 60;
        fy = centerY + 30;
      } else if (patientState === 'restless') {
        fx = centerX - 50;
        fy = centerY - 30;
      } else { // fallen
        fx = centerX + 20;
        fy = centerY + 70;
      }

      // Theme colors depending on current posture state
      let activityThemeColor = '#5c8f74'; 
      let glowColor = 'rgba(92, 143, 116, 0.18)';
      let textStateColor = '#A3B18A';
      
      if (patientState === 'fallen') {
        activityThemeColor = '#f25454'; 
        glowColor = 'rgba(242, 84, 84, 0.22)';
        textStateColor = '#EF4444';
      } else if (patientState === 'restless') {
        activityThemeColor = '#f59e0b'; 
        glowColor = 'rgba(245, 158, 11, 0.22)';
        textStateColor = '#F59E0B';
      }

      // Define 4 static room zones with clean thin bounds
      const zones = [
        { id: 'Z1', name: 'ZONE 01: BED / REST AREA', x: 20, y: 35, w: w * 0.42, h: h * 0.44 },
        { id: 'Z2', name: 'ZONE 02: MAIN ROOM PASSAGEWAY', x: w * 0.48, y: 35, w: w * 0.48, h: h * 0.50 },
        { id: 'Z3', name: 'ZONE 03: SEATING / PLINTH', x: 20, y: h * 0.50, w: w * 0.42, h: h * 0.30 },
        { id: 'Z4', name: 'ZONE 04: ENTRANCE CORRIDOR', x: w * 0.48, y: h * 0.58, w: w * 0.48, h: h * 0.22 },
      ];

      // Draw all zones with subtle dashed dividers and labels
      zones.forEach(z => {
        const isActive = 
          (patientState === 'restless' && z.id === 'Z1') ||
          (patientState === 'sitting' && z.id === 'Z3') ||
          (patientState === 'standing' && z.id === 'Z2') ||
          (patientState === 'fallen' && z.id === 'Z2'); // floor fall registered in passageway

        ctx.strokeStyle = isActive ? activityThemeColor : 'rgba(78, 110, 93, 0.12)';
        ctx.lineWidth = isActive ? 1.2 : 0.6;
        ctx.setLineDash(isActive ? [] : [2, 4]);
        
        // Draw zone box
        ctx.strokeRect(z.x, z.y, z.w, z.h);
        ctx.setLineDash([]);

        // Highlight Active zones with subtle corner brackets
        if (isActive) {
          ctx.strokeStyle = activityThemeColor;
          ctx.lineWidth = 1.5;
          const len = 6;
          // Top-Left
          ctx.beginPath(); ctx.moveTo(z.x + len, z.y); ctx.lineTo(z.x, z.y); ctx.lineTo(z.x, z.y + len); ctx.stroke();
          // Top-Right
          ctx.beginPath(); ctx.moveTo(z.x + z.w - len, z.y); ctx.lineTo(z.x + z.w, z.y); ctx.lineTo(z.x + z.w, z.y + len); ctx.stroke();
          // Bottom-Left
          ctx.beginPath(); ctx.moveTo(z.x + len, z.y + z.h); ctx.lineTo(z.x, z.y + z.h); ctx.lineTo(z.x, z.y + z.h - len); ctx.stroke();
          // Bottom-Right
          ctx.beginPath(); ctx.moveTo(z.x + z.w - len, z.y + z.h); ctx.lineTo(z.x + z.w, z.y + z.h); ctx.lineTo(z.x + z.w, z.y + z.h - len); ctx.stroke();
        }

        // Zone label
        ctx.fillStyle = isActive ? activityThemeColor : 'rgba(163, 177, 138, 0.4)';
        ctx.font = '6.5px monospace';
        ctx.fillText(z.name, z.x + 4, z.y + 10);
      });

      // Draw beautiful, ambient room activity waves (continuous ripples representing movement detection)
      if (patientState === 'restless') {
        // Nighttime toss/turn activity - fluctuating energy clusters in Zone 1 (Bed Area)
        const rippleCount = 3;
        for (let i = 0; i < rippleCount; i++) {
          const rRadius = ((frame * 0.8 + i * 25) % 60) + 5;
          const alpha = Math.max(0, 1 - rRadius / 60) * 0.45;
          ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(fx + Math.sin(frame * 0.05 + i) * 6, fy + Math.cos(frame * 0.04 + i) * 3, rRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Signal cluster dots inside active field
        for (let i = 0; i < 12; i++) {
          const dx = fx + Math.sin(i * 45 + frame * 0.02) * (15 + Math.random() * 20);
          const dy = fy + Math.cos(i * 30 + frame * 0.02) * (10 + Math.random() * 15);
          ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
          ctx.beginPath();
          ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (patientState === 'fallen') {
        // Red alert ripples radiating outwards on floor region (Zone 2 bottom / Floor level)
        const rippleCount = 4;
        for (let i = 0; i < rippleCount; i++) {
          const rRadius = ((frame * 0.6 + i * 30) % 100) + 10;
          const alpha = Math.max(0, 1 - rRadius / 100) * 0.6;
          ctx.strokeStyle = `rgba(242, 84, 84, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(fx, fy, rRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // WARNING FLAG PIN ON FLOOR
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(fx, fy, 8, 0, Math.PI * 2);
        ctx.stroke();
      } else if (patientState === 'sitting') {
        // Slow calm green respirative pulse in Zone 3 (Chair Area)
        const pulseRatio = 1 + Math.sin(frame * 0.05) * 0.25;
        const radius = 25 * pulseRatio;
        
        const radGrad = ctx.createRadialGradient(fx, fy, 1, fx, fy, radius);
        radGrad.addColorStop(0, 'rgba(92, 143, 116, 0.25)');
        radGrad.addColorStop(1, 'rgba(6, 23, 19, 0)');
        ctx.fillStyle = radGrad;
        
        ctx.beginPath();
        ctx.arc(fx, fy, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(163, 177, 138, 0.3)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(fx, fy, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Typical standing/walking movement trail ripples in Zone 2
        const rippleCount = 2;
        for (let i = 0; i < rippleCount; i++) {
          const rRadius = ((frame * 0.9 + i * 35) % 50) + 5;
          const alpha = Math.max(0, 1 - rRadius / 50) * 0.4;
          ctx.strokeStyle = `rgba(92, 143, 116, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(fx + Math.sin(frame * 0.01) * 15, fy, rRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(fx + Math.sin(frame * 0.01) * 15, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drawing background ambient thermal/signal density dots (completely anonymous, no skeletal link)
      for (let i = 0; i < 20; i++) {
        const rx = Math.random() * w;
        const ry = Math.random() * h;
        ctx.fillStyle = 'rgba(78, 110, 93, 0.06)';
        ctx.beginPath();
        ctx.arc(rx, ry, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dynamic Technical Target Corner Brackets on high resolution focus point
      ctx.strokeStyle = activityThemeColor;
      ctx.lineWidth = 1;
      const bracketSize = 6;
      const bOffset = 18;
      
      // Top-Left around focus center
      ctx.beginPath();
      ctx.moveTo(fx - bOffset + bracketSize, fy - bOffset);
      ctx.lineTo(fx - bOffset, fy - bOffset);
      ctx.lineTo(fx - bOffset, fy - bOffset + bracketSize);
      ctx.stroke();
      
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(fx + bOffset - bracketSize, fy - bOffset);
      ctx.lineTo(fx + bOffset, fy - bOffset);
      ctx.lineTo(fx + bOffset, fy - bOffset + bracketSize);
      ctx.stroke();
      
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(fx - bOffset + bracketSize, fy + bOffset);
      ctx.lineTo(fx - bOffset, fy + bOffset);
      ctx.lineTo(fx - bOffset, fy + bOffset - bracketSize);
      ctx.stroke();
      
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(fx + bOffset - bracketSize, fy + bOffset);
      ctx.lineTo(fx + bOffset, fy + bOffset);
      ctx.lineTo(fx + bOffset, fy + bOffset - bracketSize);
      ctx.stroke();

      // State label next to active monitoring center
      ctx.fillStyle = textStateColor;
      ctx.font = '8px monospace';
      ctx.fillText(`${patientState.toUpperCase()} FIELD`, fx - bOffset, fy - bOffset - 4);

      // Realtime Floating Telemetry Markers beside active focus point
      ctx.strokeStyle = 'rgba(163, 177, 138, 0.25)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + 25, fy - 12);
      ctx.lineTo(fx + 55, fy - 12);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(163, 177, 138, 0.7)';
      ctx.font = '7px monospace';
      const heightMeters = patientState === 'standing' ? '1.74m' : patientState === 'sitting' ? '1.28m' : patientState === 'restless' ? '1.41m' : '0.22m';
      ctx.fillText(`ALT: ${heightMeters}`, fx + 28, fy - 15);

      ctx.strokeStyle = 'rgba(163, 177, 138, 0.25)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx - 22, fy + 12);
      ctx.lineTo(fx - 52, fy + 12);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(163, 177, 138, 0.7)';
      ctx.font = '7px monospace';
      const rpm = patientState === 'standing' ? '14.8' : patientState === 'sitting' ? '12.4' : patientState === 'restless' ? '21.5' : '8.1';
      ctx.fillText(`RESP: ${rpm} rpm`, fx - 52, fy + 8);

      // Continuous Scrolling micro-Doppler scrolling sinus graph
      const plotWidth = 140;
      const plotHeight = 35;
      const plotX = w - plotWidth - 15;
      const plotY = h - plotHeight - 15;
      
      // Draw wave panel card
      ctx.fillStyle = 'rgba(6, 23, 19, 0.6)';
      ctx.fillRect(plotX, plotY, plotWidth, plotHeight);
      ctx.strokeStyle = 'rgba(78, 110, 93, 0.25)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(plotX, plotY, plotWidth, plotHeight);
      
      // Wave lines
      ctx.strokeStyle = patientState === 'fallen' ? 'rgba(239, 68, 68, 0.8)' : patientState === 'restless' ? 'rgba(245, 158, 11, 0.8)' : 'rgba(163, 177, 138, 0.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < plotWidth; i++) {
        const sweepIndex = i;
        const waveSpeed = patientState === 'restless' ? 0.16 : patientState === 'fallen' ? 0.04 : 0.08;
        const amplitude = patientState === 'fallen' ? 3 : patientState === 'restless' ? 11 : 6;
        const jitter = patientState === 'restless' ? Math.sin(frame * 0.6 + i * 0.35) * 1.5 : 0;
        
        const px = plotX + i;
        const py = plotY + (plotHeight / 2) + Math.sin((frame + i) * waveSpeed) * amplitude + jitter;
        
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(163, 177, 138, 0.6)';
      ctx.font = '6px monospace';
      ctx.fillText(`RESPIRATORY MICRO-DOppler`, plotX + 4, plotY + 8);
      ctx.fillText(`${sensorHz} GHz`, plotX + plotWidth - 32, plotY + 8);

      // Ambient Platform specifications layout
      ctx.fillStyle = 'rgba(163, 177, 138, 0.7)';
      ctx.font = '8px monospace';
      ctx.fillText(`AMBIENT ACTIVE TWIN STATUS`, 15, h - 35);
      ctx.fillText(`CAMERA/OPTICS: 100% EXCLUDED - COMPLETE PRIVACY`, 15, h - 23);
      ctx.fillText(`DATA TYPE: PASSIVE REABLEMENT TRENDLOG`, 15, h - 11);
      
      const stateLabels: Record<string, string> = {
        standing: 'STATE: TYPICAL ROOM ACTIVITY LOG',
        sitting: 'STATE: REST MODE ACTIVATED',
        restless: 'ALERT: NOCTURNAL RESTLESSNESS DETECTED',
        fallen: 'INDICATOR STATUS: ASSISTANCE REQUIRED'
      };
      
      ctx.fillStyle = textStateColor;
      ctx.font = '8.5px monospace';
      ctx.fillText(stateLabels[patientState] || '', w - 320, h - 45);
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [patientState, sensorHz, filterThreshold, isSimulating, activeTab]);

  return (
    <div id="hakilix-lab-web-root" className="min-h-screen bg-[#F5F2ED] text-[#0A2A22] font-sans flex flex-col selection:bg-[#4E6E5D] selection:text-white">
      
      {/* PROFESSIONAL SAGE/GOLD GRADIENT ACCENTS BACKGROUND */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#E6E2D3]/35 to-transparent -z-10 pointer-events-none" />

      {/* PUBLIC SAFETY DISCLOSURE NOTICE (STICKY TOP BANNER) */}
      <div id="ambient-safety-alert border-b" className="bg-[#FAF9F5] border-b border-[#E6E2D3] py-3.5 px-6 sticky top-0 z-45 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11.5px] leading-relaxed text-[#0A2A22]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#4E6E5D] animate-pulse shrink-0" />
            <p className="font-sans font-medium text-[#0A2A22]">
              <strong className="text-[#4E6E5D]">Public Safety Notice:</strong> HAKILIX supports care teams with information for human review. It does not diagnose, treat, replace carers or make autonomous clinical decisions.
            </p>
          </div>
          <div className="text-[9px] font-mono font-bold bg-[#E6E2D3]/60 text-[#4E6E5D] px-2.5 py-1 rounded uppercase tracking-wider whitespace-nowrap self-end md:self-auto">
            Non-Diagnostic Software
          </div>
        </div>
      </div>

      {/* PROFESSIONAL NAVBAR */}
      <header id="web-navbar" className="sticky top-[47px] z-40 bg-white/90 backdrop-blur-md border-b border-[#E6E2D3] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="bg-[#0A2A22] text-[#F5F2ED] p-2.5 rounded-xl font-serif text-xl font-bold tracking-tight shadow-md w-11 h-11 flex items-center justify-center shrink-0">
              H
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#0A2A22] block leading-none">HAKILIX</span>
              <span className="text-[8px] sm:text-[9.5px] uppercase tracking-widest text-[#7A847A] font-bold font-mono block mt-0.5 whitespace-nowrap">Ambient Intelligence Platform</span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#7A847A]">
            <button 
              id="nav-btn-home"
              onClick={() => setActiveTab('home')} 
              className={`hover:text-[#0A2A22] transition cursor-pointer pb-1.5 ${activeTab === 'home' ? 'text-[#0A2A22] font-bold border-b-2 border-[#4E6E5D]' : ''}`}
            >
              Overview
            </button>
            <button 
              id="nav-btn-solutions"
              onClick={() => setActiveTab('solutions')} 
              className={`hover:text-[#0A2A22] transition cursor-pointer pb-1.5 ${activeTab === 'solutions' ? 'text-[#0A2A22] font-bold border-b-2 border-[#4E6E5D]' : ''}`}
            >
              Who We Support
            </button>
            <button 
              id="nav-btn-tech"
              onClick={() => setActiveTab('technology')} 
              className={`hover:text-[#0A2A22] transition cursor-pointer pb-1.5 ${activeTab === 'technology' ? 'text-[#0A2A22] font-bold border-b-2 border-[#4E6E5D]' : ''}`}
            >
              Technology &amp; Gaps
            </button>
            <button 
              id="nav-btn-research"
              onClick={() => setActiveTab('research')} 
              className={`hover:text-[#0A2A22] transition cursor-pointer pb-1.5 ${activeTab === 'research' ? 'text-[#0A2A22] font-bold border-b-2 border-[#4E6E5D]' : ''}`}
            >
              Standards &amp; Trust
            </button>
            <button 
              id="nav-btn-sandbox"
              onClick={() => setActiveTab('sandbox')} 
              className={`hover:text-[#0A2A22] transition cursor-pointer pb-1.5 ${activeTab === 'sandbox' ? 'text-[#0A2A22] font-bold border-b-2 border-[#4E6E5D]' : ''}`}
            >
              Interactive Sandbox
            </button>
          </nav>

          {/* Portal Operations Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              id="btn-login-header"
              onClick={onLoginClick}
              className="bg-[#0A2A22] hover:bg-[#163e34] text-[#F5F2ED] text-[10px] sm:text-xs font-bold px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl flex items-center gap-1.5 sm:gap-2 tracking-wide uppercase transition cursor-pointer shadow-md whitespace-nowrap"
            >
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Launch Portal</span>
            </button>
          </div>
        </div>

        {/* Swipeable Mobile/Tablet Navigation Bar */}
        <div className="lg:hidden border-t border-[#E6E2D3] bg-[#FAF9F5] overflow-x-auto scrollbar-none flex items-center gap-4 px-6 py-2.5 scroll-smooth whitespace-nowrap select-none">
          {[
            { id: 'home', name: 'Overview' },
            { id: 'solutions', name: 'Who We Support' },
            { id: 'technology', name: 'Technology & Gaps' },
            { id: 'research', name: 'Standards & Trust' },
            { id: 'sandbox', name: 'Interactive Sandbox' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                const elem = document.getElementById('web-navbar');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-[#4E6E5D] text-white'
                  : 'text-[#7A847A] hover:text-[#0A2A22]'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-grow">
        
        {/* ==================================== HOME TAB ==================================== */}
        {activeTab === 'home' && (
          <div id="tab-view-home" className="space-y-24 pb-24">
            
            {/* Elegant Hero Banner */}
            <section id="hero-banner" className="relative pt-16 md:pt-24 px-6 max-w-7xl mx-auto overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                <div className="lg:col-span-7 space-y-6 text-left">
                  <div className="inline-flex items-center gap-2 bg-[#4E6E5D]/10 border border-[#4E6E5D]/20 text-[#4E6E5D] font-mono text-[10px] font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dignified Safeguarding Awareness</span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#0A2A22] tracking-tight leading-[1.08] font-extrabold">
                    Dignified care-support intelligence <br />
                    <span className="text-[#4E6E5D] inline-block mt-1">for independent living, frailty, dementia and reablement.</span>
                  </h1>
                  
                  <p className="text-sm sm:text-base text-[#7A847A] font-sans leading-relaxed max-w-2xl">
                    HAKILIX is a privacy-first ambient intelligence care-support platform. 
                    It helps care teams understand changes in activity, routine, support needs, room context, reablement progress and wellbeing indicators without intrusive cameras, complex wearable pendants, or microphones.
                  </p>
                  
                  {/* Highlighting 12 Targeted Categories in mini tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Dementia Support", "Frailty Care", "Independent Living", "Reablement Support", "Step-Down Care", "Hospital Discharge Success"].map(tag => (
                      <span key={tag} className="text-[10.5px] bg-[#E6E2D3]/40 border border-[#E6E2D3] font-sans text-[#4E6E5D] px-2.5 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      id="hero-primary-btn"
                      onClick={() => setActiveTab('sandbox')}
                      className="bg-[#4E6E5D] hover:bg-[#3D5A4A] text-white font-semibold text-xs px-6 py-4 rounded-2xl flex items-center gap-2 uppercase tracking-wider shadow-sm transition cursor-pointer"
                    >
                      <span>Interactive Live Simulator</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button 
                      id="hero-secondary-btn"
                      onClick={onRegisterClick}
                      className="bg-[#0A2A22] hover:bg-[#163e34] text-[#F5F2ED] font-semibold text-xs px-6 py-4 rounded-2xl flex items-center gap-2 uppercase tracking-wider transition cursor-pointer shadow-md"
                    >
                      <UserPlus className="w-4 h-4 text-[#A3B18A]" />
                      <span>Request Demo Room</span>
                    </button>
                  </div>

                  {/* Trust Metrics Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-[#E6E2D3]">
                    <div id="stat-accuracy">
                      <span className="block text-2xl font-serif font-bold text-[#0A2A22]">100%</span>
                      <span className="text-[10px] uppercase font-bold text-[#7A847A] tracking-widest font-mono">Camera-Free Privacy</span>
                    </div>
                    <div id="stat-privacy">
                      <span className="block text-2xl font-serif font-bold text-[#0A2A22]">Passive</span>
                      <span className="text-[10px] uppercase font-bold text-[#7A847A] tracking-widest font-mono">Non-Contact Sensing</span>
                    </div>
                    <div id="stat-regulatory">
                      <span className="block text-2xl font-serif font-bold text-[#0A2A22]">UK GDPR</span>
                      <span className="text-[10px] uppercase font-bold text-[#7A847A] tracking-widest font-mono">Local-Edge Secure</span>
                    </div>
                  </div>
                </div>

                {/* Hero Interactive Radar Window */}
                <div className="lg:col-span-5 relative mt-6 lg:mt-0">
                  <div className="bg-[#0A2A22] p-5 rounded-[36px] shadow-2xl border border-[#4E6E5D]/20 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-4 border-b border-[#4E6E5D]/20 pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#F5F2ED] font-mono">HAKILIX AMBIENT ACTIVE TWIN</span>
                      </div>
                      <span className="text-[8px] bg-[#4E6E5D]/20 text-[#A3B18A] border border-[#4E6E5D]/30 rounded px-2 py-0.5 tracking-wider font-mono">
                        81GHz WAVE INFRARED
                      </span>
                    </div>

                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-72 bg-[#0A2A22] rounded-[24px] cursor-crosshair border border-[#4E6E5D]/10" 
                    />

                    {/* Quick Simulation Switches */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-4 pt-1">
                      {(['standing', 'sitting', 'restless', 'fallen'] as const).map(state => (
                        <button
                          key={state}
                          onClick={() => setPatientState(state)}
                          className={`text-[9px] uppercase tracking-wider font-bold py-2.5 rounded-xl border transition cursor-pointer font-mono ${
                            patientState === state 
                              ? 'bg-[#4E6E5D] text-white border-[#4E6E5D]' 
                              : 'bg-white/5 border-white/10 text-[#A3B18A] hover:bg-white/10'
                          }`}
                        >
                          {state === 'restless' ? 'restless' : state}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Core Mission & Solution Overview */}
            <section id="corporate-purpose" className="bg-white border-y border-[#E6E2D3] py-20 px-6">
              <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <span className="text-xs uppercase font-bold text-[#4E6E5D] font-mono tracking-widest">ABOUT HAKILIX</span>
                  <h2 className="text-3xl sm:text-4xl font-serif text-[#0A2A22] font-semibold tracking-tight">
                    Privacy-First Care Awareness for Homes, Care Settings &amp; Reablement
                  </h2>
                  <p className="text-sm text-[#7A847A] leading-relaxed">
                    Local authorities, national NHS reablement partners, and care home managers face severe challenges: rising vacancy pressures, safety monitoring blind spots, and the critical obligation to preserve individual privacy. HAKILIX bridges these gaps with a passive, non-diagnostic platform designed strictly to support human caregivers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-[#FAF9F5] border border-[#E6E2D3] p-8 rounded-[28px] space-y-4 text-left">
                    <div className="w-12 h-12 bg-white text-[#4E6E5D] rounded-2xl flex items-center justify-center border border-[#4E6E5D]/10 shadow-sm">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Protects True Dignity</h3>
                    <p className="text-xs text-[#7A847A] leading-relaxed">
                      Operates 100% camera-free. Zero imagery is captured, recorded, or transmitted. Perfect for the most private areas of the home, such as en-suite washrooms, bedroom suites, and assisted living quarters.
                    </p>
                  </div>

                  <div className="bg-[#FAF9F5] border border-[#E6E2D3] p-8 rounded-[28px] space-y-4 text-left">
                    <div className="w-12 h-12 bg-white text-[#4E6E5D] rounded-2xl flex items-center justify-center border border-[#4E6E5D]/10 shadow-sm">
                      <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Non-Contact &amp; Passive</h3>
                    <p className="text-xs text-[#7A847A] leading-relaxed">
                      No wearables required. Eliminates the reliance on older adults or individuals receiving dementia support to remember, wear, or periodically charge restrictive badges, bracelets, or neck lanyards.
                    </p>
                  </div>

                  <div className="bg-[#FAF9F5] border border-[#E6E2D3] p-8 rounded-[28px] space-y-4 text-left">
                    <div className="w-12 h-12 bg-white text-[#4E6E5D] rounded-2xl flex items-center justify-center border border-[#4E6E5D]/10 shadow-sm">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Dignified Reablement Progress</h3>
                    <p className="text-xs text-[#7A847A] leading-relaxed">
                      Tracks real-time step-down milestones, overnight wakefulness, and room activity states. Enables occupational therapists and social workers to deliver safe, data-reinforced pathway plans.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Why Current Care Systems Have Gaps Section */}
            <section className="max-w-7xl mx-auto px-6">
              <div className="text-left space-y-6">
                <span className="text-xs uppercase font-bold text-[#4E6E5D] font-mono tracking-widest">IDENTIFYING SYSTEMIC GAPS</span>
                <h2 className="text-3xl sm:text-4xl font-serif text-[#0A2A22] font-semibold tracking-tight">
                  Why traditional safeguarding tools fail care teams
                </h2>
                <p className="text-sm text-[#7A847A] leading-released max-w-3xl">
                  Traditional tracking systems create painful tradeoffs between effective safeguarding awareness and fundamental human rights. HAKILIX solves this tension directly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                  {/* Gap Item 1 */}
                  <div className="border border-[#E6E2D3] bg-white rounded-3xl p-6.5 space-y-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#EF4444] font-mono font-bold text-xs">01</div>
                    <h4 className="font-serif font-bold text-base text-[#0A2A22]">The Camera Dignity Breach</h4>
                    <p className="text-xs text-[#7A847A] leading-relaxed">
                      Optical surveillance is highly invasive, causing user anxiety, ethical dilemmas, and regulatory conflicts. They are legally and morally prohibited in sensitive zones like bathrooms and bed spaces where most slips and rest changes occur.
                    </p>
                    <div className="text-[10px] bg-stone-50 border border-stone-200 p-2.5 rounded-lg text-emerald-800 font-medium">
                      ✓ <strong>The HAKILIX Difference:</strong> 100% video-free. Processes passive wave reflection to register room activity states without visual image records.
                    </div>
                  </div>

                  {/* Gap Item 2 */}
                  <div className="border border-[#E6E2D3] bg-white rounded-3xl p-6.5 space-y-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#EF4444] font-mono font-bold text-xs">02</div>
                    <h4 className="font-serif font-bold text-base text-[#0A2A22]">The Wearables Fallacy</h4>
                    <p className="text-xs text-[#7A847A] leading-relaxed">
                      Hard lanyards, watches, and smart tags only work when worn. People living with dementia or high frailty frequently forget or decline to wear them. Neck cords are physically uncomfortable and present potential choking hazards.
                    </p>
                    <div className="text-[10px] bg-stone-50 border border-stone-200 p-2.5 rounded-lg text-emerald-800 font-medium">
                      ✓ <strong>The HAKILIX Difference:</strong> 100% non-contact. Invisible, completely passive wall sensor requires absolutely zero action from the client.
                    </div>
                  </div>

                  {/* Gap Item 3 */}
                  <div className="border border-[#E6E2D3] bg-white rounded-3xl p-6.5 space-y-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#EF4444] font-mono font-bold text-xs">03</div>
                    <h4 className="font-serif font-bold text-base text-[#0A2A22]">Intrusive Night Rota Checks</h4>
                    <p className="text-xs text-[#7A847A] leading-relaxed">
                      Requiring nocturnally-tired care workers to physically enter bedrooms every few hours to verify safety disturbs deep sleep patterns. This sleep disruption can worsen nocturnal confusion and cognitive fatigue.
                    </p>
                    <div className="text-[10px] bg-stone-50 border border-stone-200 p-2.5 rounded-lg text-emerald-800 font-medium">
                      ✓ <strong>The HAKILIX Difference:</strong> Enables sleep cycle tracking. Caregivers verify overnight REST records silently on the dashboard without disturbing residents.
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ==================================== SOLUTIONS TAB (WHO WE SUPPORT) ==================================== */}
        {activeTab === 'solutions' && (
          <div id="tab-view-solutions" className="py-16 md:py-24 px-6 max-w-7xl mx-auto space-y-24 text-left font-sans">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs uppercase font-bold text-[#4E6E5D] font-mono tracking-widest">WHO WE SUPPORT</span>
              <h1 className="text-3xl sm:text-5xl font-serif text-[#0A2A22] font-semibold tracking-tight">
                Designed for complex care pathways and housing settings
              </h1>
              <p className="text-sm sm:text-base text-[#7A847A] leading-relaxed">
                Whether deploying in private residential homes, local council developments, or clinical step-down facilities, HAKILIX aligns with strict security constraints to serve families, providers, and NHS commissioners.
              </p>
            </div>

            {/* Quick Filter Controls */}
            <div className="flex gap-4 border-b border-[#E6E2D3] pb-4">
              <button
                onClick={() => setSelectedSolutionCategory('individuals')}
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider transition-all rounded-xl ${
                  selectedSolutionCategory === 'individuals' 
                    ? 'bg-[#0A2A22] text-[#F5F2ED]' 
                    : 'text-[#7A847A] hover:text-[#0A2A22]'
                }`}
              >
                Supported Individuals (6 Categories)
              </button>
              <button
                onClick={() => setSelectedSolutionCategory('environments')}
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider transition-all rounded-xl ${
                  selectedSolutionCategory === 'environments' 
                    ? 'bg-[#0A2A22] text-[#F5F2ED]' 
                    : 'text-[#7A847A] hover:text-[#0A2A22]'
                }`}
              >
                Integrated Care Settings (6 Environments)
              </button>
            </div>

            {selectedSolutionCategory === 'individuals' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* 1. Adults living independently in their own homes */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">1</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Independent Living Support</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit">Adults at Home</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Helps adults living independently in their own homes access seamless safety oversight. Supports long-term independence without infringing upon personal choices or daily schedules.
                  </p>
                  <p className="text-[11px] text-[#4E6E5D] font-mono">✓ Delivers ambient wellbeing indicator logs</p>
                </div>

                {/* 2. Older adults who need care support */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">2</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Older Adults Care Assistance</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit">Care Support Target</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Assists older adults who need ongoing care support but wish to limit physical home intrusion. Monitors baseline daily patterns and alerts caregivers to routine changes.
                  </p>
                  <p className="text-[11px] text-[#4E6E5D] font-mono">✓ Passive safeguarding awareness</p>
                </div>

                {/* 3. People living with frailty */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">3</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Frailty Support Insights</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit">Frailty Protection</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Tracks mobility patterns, sit-to-stand transitions and nocturia tendencies. Highlights gradual physical regression trends to prevent accidents before they occur.
                  </p>
                  <p className="text-[11px] text-[#4E6E5D] font-mono">✓ High sensitive reablement progress trend</p>
                </div>

                {/* 4. People receiving dementia support */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">4</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Dementia Support Awareness</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit">Cognitive Assistance</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Designed for people receiving dementia support. Eliminates confusing pendant devices, wearable buzzers, or blinking tracking lights, reducing client agitation and preserving familiarity.
                  </p>
                  <p className="text-[11px] text-[#4E6E5D] font-mono">✓ Zero user instruction or action needed</p>
                </div>

                {/* 5. People receiving reablement support */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">5</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Reablement Progress Analysis</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit">Reablement Support</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Monitors reablement milestones and activity trends following injury. Replaces paper logs with robust, objective posture progress and active room duration history for clinical team review.
                  </p>
                  <p className="text-[11px] text-[#4E6E5D] font-mono">✓ Objective 7-Day movement reports</p>
                </div>

                {/* 6. People recovering after hospital discharge */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">6</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Post-Discharge Safeguarding</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit">Hospital Recovery</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Protects people recovering after hospital discharge, facilitating the crucial first 30 days of recovery to prevent accidental readmissions and ease family concerns.
                  </p>
                  <p className="text-[11px] text-[#4E6E5D] font-mono">✓ Seamless transitional reablement logs</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* 1. Care homes */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">1</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Care Homes Integration</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit">Care Homes</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Provides comprehensive dashboard overviews for residential care homes. Replaces heavy nocturnal rounds with silent room activity state metrics to safeguard residents.
                  </p>
                </div>

                {/* 2. Assisted living */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">2</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Assisted Living Facilities</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit">Assisted Living</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Integrates with local facility call buttons to support independent flats. Equips onsite care staff with live activity context before they enter suites.
                  </p>
                </div>

                {/* 3. Extra care housing */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">3</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Extra Care Communities</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit">Extra Care Housing</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Provides a passive safety net for larger community developments. Delivers consistent wellbeing indicator metrics to coordinate group care rotas.
                  </p>
                </div>

                {/* 4. Supported living */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">4</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Supported Living Suites</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit font-mono">Supported Living</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Safeguards residents with higher physical or psychological needs. Respects autonomy while furnishing real-time movement reports for remote care managers.
                  </p>
                </div>

                {/* 5. Residential care */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">5</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Residential Care Settings</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit">Residential Care</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Addresses staffing shortages by automating night monitoring, giving families reassurance and satisfying CQC standards for residential sites.
                  </p>
                </div>

                {/* 6. Step-down care */}
                <div className="bg-white border border-[#E6E2D3] p-8 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6E2D3]/45 text-[#4E6E5D] flex items-center justify-center font-bold font-serif">6</div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">Step-Down Clinician Suites</h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#4E6E5D] bg-[#4E6E5D]/10 px-2.5 py-0.5 rounded-md block w-fit">Step-Down Care</span>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Acts as an essential transition stage from acute hospitals to home environments. Helps discharge coordinators verify patient stamina before final discharge.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================== TECHNOLOGY TAB (GAPS AND HOW IT WORKS) ==================================== */}
        {activeTab === 'technology' && (
          <div id="tab-view-tech" className="py-16 md:py-24 px-6 max-w-7xl mx-auto space-y-24 text-left font-sans">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs uppercase font-bold text-[#4E6E5D] font-mono tracking-widest">HOW HAKILIX SOLVES THESE GAPS</span>
              <h1 className="text-3xl sm:text-5xl font-serif text-[#0A2A22] font-semibold tracking-tight">
                Passive, Zero-Imagery Continuous Safeguarding
              </h1>
              <p className="text-sm sm:text-base text-[#7A847A] leading-relaxed">
                HAKILIX represents a profound architectural shift. By replacing cameras with 100% passive, non-contact sensing nodes, we eliminate clinical blind spots while fully protecting user privacy.
              </p>
            </div>

            {/* Feature Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                
                {/* 1. Independent Living support */}
                <div className="space-y-3">
                  <div className="inline-flex bg-[#4E6E5D]/10 text-[#4E6E5D] p-2.5 rounded-xl border border-[#4E6E5D]/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">1. Independent Living Support</h3>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    By learning an individual&apos;s daily routine baselines silently, HAKILIX provides care teams with clear wellbeing indicator charts. Families and local commissioners coordinate support based on factual movement trends, keeping the home dignified and autonomous.
                  </p>
                </div>

                {/* 2. Frailty support */}
                <div className="space-y-3">
                  <div className="inline-flex bg-[#4E6E5D]/10 text-[#4E6E5D] p-2.5 rounded-xl border border-[#4E6E5D]/20">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">2. Frailty Safeguarding</h3>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Physical frailty causes slow, progressive regressions in posture speed and sit-to-stand transitions. HAKILIX monitors changes in toilet durations and night restlessness, providing occupational therapists with key indicators of mobility decline before severe incidents manifest.
                  </p>
                </div>

                {/* 3. Dementia and Reablement support */}
                <div className="space-y-3">
                  <div className="inline-flex bg-[#4E6E5D]/10 text-[#4E6E5D] p-2.5 rounded-xl border border-[#4E6E5D]/20">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22]">3. Dementia &amp; Reablement Pathways</h3>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Cognitively sensitive environments receive continuous non-contact protection. It tracks active reablement progress, enabling step-down clinics to transition patients home safely and reduce delayed discharge (bed-blocking) pressures across local NHS networks.
                  </p>
                </div>

              </div>

              {/* Interoperability Specs Card */}
              <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-8 space-y-6">
                <div>
                  <span className="text-[10px] text-[#4E6E5D] font-bold font-mono tracking-widest block uppercase">Hardware &amp; System Integration Specifications</span>
                  <h4 className="font-serif text-lg font-bold text-[#0A2A22] mt-1">Interoperable &amp; Safe Standards</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[#FAF9F5] p-3.5 rounded-xl text-xs">
                    <span className="font-semibold text-[#0A2A22]">Privacy-First Edge Processing</span>
                    <span className="font-mono text-[#7A847A]">Zero Cloud Footage Captured</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#FAF9F5] p-3.5 rounded-xl text-xs">
                    <span className="font-semibold text-[#0A2A22]">Ultra-harmonic Frequency </span>
                    <span className="font-mono text-[#7A847A]">81GHz (Safe Radar Technology)</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#FAF9F5] p-3.5 rounded-xl text-xs">
                    <span className="font-semibold text-[#0A2A22]">NHS DSP Toolkit Clearance</span>
                    <span className="font-mono text-[#7A847A]">Compliant Core Framework</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#FAF9F5] p-3.5 rounded-xl text-xs">
                    <span className="font-semibold text-[#0A2A22]">UK GDPR Article 9 Alignment</span>
                    <span className="font-mono text-[#7A847A]">DPA 2018 Special Care Safe</span>
                  </div>
                </div>

                <div className="bg-[#4E6E5D]/10 border border-[#4E6E5D]/20 rounded-2xl p-5 text-left space-y-2">
                  <h5 className="text-xs font-serif font-semibold text-[#0A2A22]">Nocturnal Restlessness Logs</h5>
                  <p className="text-[11px] text-[#7A847A] leading-relaxed">
                    By recording nocturia and restlessness frequency passively, the platform recommends staff review when sleep parameters regress. This ensures timely care adjustments without the need to enter rooms or disturb rest.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================================== STANDARDS & TRUST TAB ==================================== */}
        {activeTab === 'research' && (
          <div id="tab-view-research" className="py-16 md:py-24 px-6 max-w-7xl mx-auto space-y-20 text-left font-sans animate-fade-in">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs uppercase font-bold text-[#4E6E5D] font-mono tracking-widest">REGULATORY STANDARDS</span>
              <h1 className="text-3xl sm:text-5xl font-serif text-[#0A2A22] font-semibold tracking-tight">
                Framework Alignment &amp; Quality Outcome Evidence
              </h1>
              <p className="text-sm sm:text-base text-[#7A847A] leading-relaxed">
                HAKILIX places transparent governance, local authority compliance, and clinical safety at the forefront of our engineering. We are not a diagnostic device; rather, we provide clean, objective history paths to assist clinical teams.
              </p>
            </div>

            {/* Quality Outcomes Grid */}
            <div className="bg-white border border-[#E6E2D3] rounded-[36px] overflow-hidden p-6 sm:p-10 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E6E2D3]">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#0A2A22]">CQC Inspection Support &amp; Audit Baselines</h3>
                  <p className="text-xs text-[#7A847A] font-mono">Calibrated to support Care Quality Commission inspection pathways</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider font-mono">
                  Audit Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                {/* SAFE path */}
                <div className="space-y-2.5">
                  <h4 className="font-serif font-bold text-base text-[#0A2A22]">CQC &apos;Safe&apos; Pathway</h4>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Provides continuous night oversight without intrusive checks. Generates automated records of nocturnal logs and room activity states, ensuring factual safeguarding verification during audits.
                  </p>
                </div>

                {/* EFFECTIVE path */}
                <div className="space-y-2.5">
                  <h4 className="font-serif font-bold text-base text-[#0A2A22]">CQC &apos;Effective&apos; Pathway</h4>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Supplying objective 7-day reports on posture stability and recovery trends. Enables clinical teams and local councils to base long-term funding reviews on concrete reablement progress indicators.
                  </p>
                </div>

                {/* RESPONSIVE path */}
                <div className="space-y-2.5">
                  <h4 className="font-serif font-bold text-base text-[#0A2A22]">CQC &apos;Responsive&apos; Pathway</h4>
                  <p className="text-xs text-[#7A847A] leading-relaxed">
                    Tracks washroom occupancy and toilet stay durations passively. Enables proactive care adjustments rather than relying on reactive incident reporting after falls have already occurred.
                  </p>
                </div>
              </div>

              {/* public safety section saying HAKILIX supports care teams with information for human review. It does not diagnose, treat, replace carers or make autonomous clinical decisions */}
              <div className="bg-[#FAF9F5] border border-[#E6E2D3] p-6 rounded-2xl flex items-start gap-3.5">
                <Info className="w-5 h-5 text-[#4E6E5D] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <strong className="text-[#0A2A22] font-semibold uppercase font-mono tracking-wide text-[11px] block">Public Safety and Intended Use Declaration</strong>
                  <p className="text-[#7A847A] leading-relaxed">
                    HAKILIX is a specialized care-support insight tool. HAKILIX supports care teams with information for human review. It does not diagnose, treat, replace carers or make autonomous clinical decisions. Staff review and physical caregiver intervention are always recommended.
                  </p>
                </div>
              </div>
            </div>

            {/* Local authority trust credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-[#E6E2D3] bg-white p-6 rounded-2xl space-y-2">
                <h5 className="font-serif font-bold text-[#0A2A22]">Local Control Edge</h5>
                <p className="text-[11.5px] text-[#7A847A] leading-relaxed">
                  Processes and stores telemetry data strictly on-the-edge. Protects from central security breaches.
                </p>
              </div>

              <div className="border border-[#E6E2D3] bg-white p-6 rounded-2xl space-y-2">
                <h5 className="font-serif font-bold text-[#0A2A22]">NHS DTAC Standards</h5>
                <p className="text-[11.5px] text-[#7A847A] leading-relaxed">
                  Aligns perfectly with NHS England criteria for clinical safety and data confidentiality.
                </p>
              </div>

              <div className="border border-[#E6E2D3] bg-white p-6 rounded-2xl space-y-2">
                <h5 className="font-serif font-bold text-[#0A2A22]">CQC KLOE Supportive</h5>
                <p className="text-[11.5px] text-[#7A847A] leading-relaxed">
                  Engineered to assist care home operators to achieve Good or Outstanding inspection outcomes.
                </p>
              </div>

              <div className="border border-[#E6E2D3] bg-white p-6 rounded-2xl space-y-2">
                <h5 className="font-serif font-bold text-[#0A2A22]/35 line-through">Invasive Optics</h5>
                <p className="text-[11.5px] text-[#7A847A] leading-relaxed">
                  Absolutely 100% video-free. Zero imagery or micro-sound recordings are ever generated.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== RADAR SANDBOX SIMULATOR TAB ==================================== */}
        {activeTab === 'sandbox' && (
          <div id="tab-view-sandbox" className="py-16 md:py-24 px-6 max-w-7xl mx-auto space-y-16 text-left font-sans">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs uppercase font-bold text-[#4E6E5D] font-mono tracking-widest">INTERACTIVE SIMULATOR</span>
              <h1 className="text-3xl sm:text-5xl font-serif text-[#0A2A22] font-semibold tracking-tight">
                HAKILIX Ambient Spatial Intelligence Sandbox
              </h1>
              <p className="text-sm sm:text-base text-[#7A847A] leading-relaxed">
                Tune the logging frequency, simulate different physical care postures, and inspect how our zero-imagery observation dashboard maps safe outcomes without compromising resident dignity.
              </p>
            </div>

            {/* Sandbox Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column Controls */}
              <div className="lg:col-span-4 bg-white border border-[#E6E2D3] p-8 rounded-[36px] space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#0A2A22] mb-1">Simulate Care Parameters</h3>
                  <p className="text-[10.5px] text-[#7A847A] leading-relaxed">
                    Map continuous care variables to verify how our localized reablement logs generate clean history paths.
                  </p>
                </div>

                {/* Patient Pose Switch */}
                <div className="space-y-2">
                  <label className="text-[9.5px] uppercase font-bold tracking-widest text-[#7A847A] block font-mono">1. Posture state</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { state: 'standing', icon: '🧍', label: 'Standing Activity' },
                      { state: 'sitting', icon: '🪑', label: 'Sitting / Rest' },
                      { state: 'restless', icon: '🛌', label: 'Restless Sleep' },
                      { state: 'fallen', icon: '🚨', label: 'Post-Fall State' }
                    ].map(st => (
                      <button
                        key={st.state}
                        onClick={() => setPatientState(st.state as any)}
                        className={`text-left p-3 rounded-2xl border text-xs transition-all flex items-center gap-2 cursor-pointer ${
                          patientState === st.state 
                            ? 'bg-[#0A2A22] text-[#F5F2ED] border-[#0A2A22] font-semibold shadow-sm' 
                            : 'bg-[#F5F2ED]/50 border-[#E6E2D3] text-[#0A2A22] hover:bg-[#F5F2ED]'
                        }`}
                      >
                        <span className="text-sm">{st.icon}</span>
                        <span className="block leading-tight truncate">{st.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Latency / Sync Interval */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#7A847A] font-mono">
                    <span>2. Telemetry Sync Interval</span>
                    <strong className="text-[#0A2A22]">{sensorHz > 75 ? 'Continuous Stream' : sensorHz > 50 ? 'Hourly Sync' : 'Daily Digest'}</strong>
                  </div>
                  <input 
                    type="range" 
                    min={24} 
                    max={81} 
                    step={1}
                    value={sensorHz}
                    onChange={(e) => setSensorHz(parseInt(e.target.value))}
                    className="w-full h-1.5 accent-[#4E6E5D] bg-[#F5F2ED] rounded-full outline-none cursor-pointer"
                  />
                </div>

                {/* Care Tier */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#7A847A] font-mono">
                    <span>3. Supervision Care Tier</span>
                    <strong className="text-[#0A2A22]">{filterThreshold > 70 ? 'Tier 4: Intensive' : filterThreshold > 40 ? 'Tier 3: Moderate' : 'Tier 1: Minimal'}</strong>
                  </div>
                  <input 
                    type="range" 
                    min={10} 
                    max={95} 
                    step={5}
                    value={filterThreshold}
                    onChange={(e) => setFilterThreshold(parseInt(e.target.value))}
                    className="w-full h-1.5 accent-[#4E6E5D] bg-[#F5F2ED] rounded-full outline-none cursor-pointer"
                  />
                </div>

                <div className="pt-4 border-t border-[#E6E2D3] text-[9.5px] text-[#7A847A] space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>GATEWAY TARGET:</span>
                    <span className="text-[#0A2A22] font-bold">Local-Edge Server</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DIGNITY METRIC:</span>
                    <span className="text-emerald-800 font-bold">100% Secure Zero-Imagery</span>
                  </div>
                </div>

              </div>

              {/* Right Column Canvas visualizer */}
              <div className="lg:col-span-8 bg-[#0A2A22] p-8 rounded-[36px] text-white flex flex-col justify-between border border-[#4E6E5D]/20 space-y-6">
                <div className="flex justify-between items-start border-b border-[#4E6E5D]/20 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#A3B18A] font-mono block">Real-time Dashboard Simulation</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsSimulating(!isSimulating)}
                      className="px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase border border-stone-700 bg-white/5 hover:bg-white/10 text-stone-250 transition cursor-pointer"
                    >
                      {isSimulating ? 'Pause Terminal' : 'Wakeup Terminal'}
                    </button>
                    <span className="text-[9.5px] bg-[#EF4444]/20 border border-[#EF4444]/35 text-[#EF4444] px-2.5 py-1.5 rounded-xl font-mono">
                      🔴 PASSIVE CAPTURE
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-96 bg-[#0A2A22] rounded-[24px] border border-[#4E6E5D]/20 shadow-inner" 
                  />
                  
                  {/* Informational overlay on canvas */}
                  <div className="absolute top-4 right-4 bg-black/55 backdrop-blur-md p-4 rounded-xl text-[10px] font-mono text-stone-300 space-y-1.5 border border-white/5">
                    <h5 className="font-bold text-white uppercase text-[8.5px]">Local Sandbox Analytics</h5>
                    <p>GDPR Audit: <span className="text-emerald-400">100% Compliant</span></p>
                    <p>CQC Pathway: <span className="text-[#A3B18A] font-bold">Responsive Safeguarding</span></p>
                    <p>Transition Status: <span className="text-emerald-400 font-bold">Active Stream</span></p>
                  </div>
                </div>

                <div className="text-xs text-[#A3B18A] font-sans leading-relaxed space-y-2">
                  <p>
                    HAKILIX is designed to process non-contact sensing signals locally where appropriate and convert them into anonymous room-activity states. These states can support a privacy-first Digital Twin showing zones, movement indicators and care-support alerts without displaying camera footage or identifiable resident imagery.
                  </p>
                  <p className="text-[11px] font-medium text-white/95 uppercase tracking-wide font-mono">
                    ⚠️ All alerts remain subject to human review.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* DETAILED PUBLIC INQUIRY / CALL TO ACTION (families, authorities, pilots, challenge judges) */}
      <section id="contact-and-corporate" className="bg-white border-t border-[#E6E2D3] py-20 px-6 text-left">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-[#4E6E5D] font-mono tracking-widest uppercase">HAKILIX HEADQUARTERS</span>
              <h2 className="text-3xl font-serif text-[#0A2A22] font-semibold tracking-tight">
                Request a Demo Room or Pilot Partnership
              </h2>
              <p className="text-sm text-[#7A847A] leading-relaxed max-w-sm">
                We collaborate with forward-thinking local authorities, clinical step-down units, NHS reablement leads, luxury senior operators, and innovation pilot challenge teams. Reach out below to explore sandbox credentials or licensing configurations.
              </p>

              <div className="space-y-4 pt-4 text-xs text-[#0A2A22] font-sans">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-[#4E6E5D]" />
                  <span>Hakilix Labs Ltd, Liverpool, United Kingdom</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#4E6E5D]" />
                  <span>scientific@hakilix.co.uk</span>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-[#4E6E5D]" />
                  <span>Reablement Registry: UK-MED-09418a</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#FAF9F5] border border-[#E6E2D3] p-8 sm:p-10 rounded-[36px]">
                
                {contactForm.submitted ? (
                  <div className="space-y-3 text-center py-10">
                    <div className="w-12 h-12 bg-emerald-50 text-[#4E6E5D] rounded-full flex items-center justify-center border border-[#4E6E5D]/30 mx-auto animate-bounce">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#0A2A22]">Pilot Request Received Successfully</h3>
                    <p className="text-xs text-[#7A847A] max-w-md mx-auto leading-relaxed">
                      Thank you for contacting our care coordination team. A representative from the HAKILIX team will review details about your care setting and respond to your organization email within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <h3 className="text-lg font-serif font-bold text-[#0A2A22] mb-1">Institutional Inquiry Form</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold text-[#7A847A] font-mono block">Your Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Dr. Arthur Pendelton"
                          value={contactForm.name}
                          onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white border border-[#E6E2D3] focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-[#0A2A22]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold text-[#7A847A] font-mono block">Organization / Authority</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Liverpool NHS Trust / Council"
                          value={contactForm.org}
                          onChange={(e) => setContactForm(prev => ({ ...prev, org: e.target.value }))}
                          className="w-full bg-white border border-[#E6E2D3] focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-[#0A2A22]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold text-[#7A847A] font-mono block">Institutional Email</label>
                        <input 
                          type="email" 
                          required
                          placeholder="e.g. arthur@liverpoolcare.gov.uk"
                          value={contactForm.email}
                          onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-white border border-[#E6E2D3] focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-[#0A2A22]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-bold text-[#7A847A] font-mono block">Institutional Interest</label>
                        <select 
                          value={contactForm.interest}
                          onChange={(e) => setContactForm(prev => ({ ...prev, interest: e.target.value }))}
                          className="w-full bg-white border border-[#E6E2D3] focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-[#0A2A22]"
                        >
                          <option value="pilot">Launch Local Authority / NHS Pilot</option>
                          <option value="demo">Request Live Portal Demo Access</option>
                          <option value="academic">Academic Research &amp; Evaluation</option>
                          <option value="investor">Innovation Challenge / Investor Query</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-[#7A847A] font-mono block">Setting Size &amp; Message</label>
                      <textarea 
                        rows={3}
                        required
                        placeholder="Please tell us about your beds capacity, current fallback lanyards, or reablement timeline..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full bg-white border border-[#E6E2D3] focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-[#0A2A22] resize-none"
                      />
                    </div>

                    <button 
                      id="contact-submit-btn"
                      type="submit"
                      className="w-full bg-[#0A2A22] hover:bg-[#163e34] text-white font-semibold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      Submit Official Inquiry
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="web-footer" className="bg-[#0A2A22] text-[#A3B18A] py-12 px-6 border-t border-[#4E6E5D]/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          <div className="flex items-center gap-3">
            <a href="https://www.hakilix.co.uk/" target="_blank" rel="noopener noreferrer" className="font-serif italic font-semibold text-[#F5F2ED] text-base hover:underline hover:text-white transition">
              www.hakilix.co.uk
            </a>
            <span className="text-[10px] text-[#7A847A]">•</span>
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Continuous Sensing Technologies</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-wider font-semibold font-mono text-stone-400">
            <span>© {new Date().getFullYear()} HAKILIX</span>
            <span>•</span>
            <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition cursor-pointer bg-transparent border-0 p-0">Privacy Policy (UK GDPR)</button>
            <span>•</span>
            <button onClick={() => setActiveModal('terms')} className="hover:text-white transition cursor-pointer bg-transparent border-0 p-0">Terms &amp; Disclaimers</button>
            <span>•</span>
            <button onClick={() => setShowCookiesBanner(true)} className="hover:text-white transition cursor-pointer bg-transparent border-0 p-0">Cookies</button>
          </div>
        </div>
      </footer>

      {/* PECR & UK GDPR COOKIE BANNER */}
      {showCookiesBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white border border-[#E6E2D3] p-5 rounded-2xl shadow-xl z-50 text-left">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-xs font-bold text-[#0A2A22] uppercase tracking-wider font-mono">Cookies &amp; Local Logs Consent</h4>
              <button onClick={() => setShowCookiesBanner(false)} className="text-[#7A847A] hover:text-[#0A2A22] transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-[#7A847A] leading-relaxed">
              We use necessary local storage credentials and anonymous telemetry analytics to deliver our ambient reablement simulation dashboard interface, strictly complying with PECR and UK GDPR requirements. No patient biometrics are processed centrally.
            </p>
            <div className="flex gap-2.5 pt-1 text-[10.5px]">
              <button 
                onClick={() => handleAcceptCookies('all')}
                className="bg-[#0A2A22] hover:bg-[#163e34] text-white font-semibold px-3 py-2 rounded-xl transition cursor-pointer grow text-center"
              >
                Accept All Cookies
              </button>
              <button 
                onClick={() => handleAcceptCookies('essential')}
                className="bg-[#F5F2ED] hover:bg-[#E6E2D3] text-[#7A847A] hover:text-[#0A2A22] font-semibold px-3 py-2 rounded-xl transition cursor-pointer grow text-center"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEGAL MODALS OVERLAYS */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-150">
          <div className="bg-white border border-[#E6E2D3] rounded-[32px] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-left shadow-2xl relative">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 p-1.5 bg-[#F5F2ED] hover:bg-[#E6E2D3] rounded-full text-[#7A847A] hover:text-[#0A2A22] transition"
            >
              <X className="w-4 h-4" />
            </button>

            {activeModal === 'privacy' ? (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-[#4E6E5D] tracking-widest uppercase font-mono block">UK LEGAL COMPLIANCE</span>
                <h3 className="text-2xl font-serif text-[#0A2A22] font-bold">Privacy Policy (UK GDPR)</h3>
                <p className="text-xs text-[#7A847A] leading-relaxed">
                  Last Updated: June 2026. This Privacy Policy details how HAKILIX ("we", "us", or "our") manages movement telemetry logging.
                </p>
                <div className="space-y-3.5 text-xs text-[#2D3A2D] leading-relaxed pt-2 pt-4 border-t border-[#E6E2D3]">
                  <div>
                    <strong className="block text-[#0A2A22] font-semibold">1. Architectural Privacy Assurance</strong>
                    <p className="text-[#7A847A] mt-0.5">
                      Our spatial sensing hardware does not capture, save, or transmit raw camera feeds, audio recordings, or deep-identity biometric data. All transceiver output is processed locally (&quot;on-the-edge&quot;) and converted into anonymized posture matrices.
                    </p>
                  </div>
                  <div>
                    <strong className="block text-[#0A2A22] font-semibold">2. Processing of Special Category Health Data</strong>
                    <p className="text-[#7A847A] mt-0.5">
                      Under Article 9 of UK GDPR, the reablement logging tracking markers are managed strictly under local control. This application displays simulated databases and is hosted as a local sandbox kit. Active integrations do not store unencrypted clinical charts on unauthorized remote storage.
                    </p>
                  </div>
                  <div>
                    <strong className="block text-[#0A2A22] font-semibold">3. Data Controller &amp; Contact</strong>
                    <p className="text-[#7A847A] mt-0.5">
                      For UK ICO matters, please correspond with Hakilix Labs Ltd, Liverpool, United Kingdom, or scientific@hakilix.co.uk.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-[#4E6E5D] tracking-widest uppercase font-mono block">UK REGULATORY DISCLAIMER</span>
                <h3 className="text-2xl font-serif text-[#0A2A22] font-bold">Terms of Use &amp; Disclaimers</h3>
                <p className="text-xs text-[#7A847A] leading-relaxed">
                  Last Updated: June 2026. Please read these terms carefully before evaluating the HAKILIX interactive model.
                </p>
                <div className="space-y-3.5 text-xs text-[#2D3A2D] leading-relaxed pt-4 border-t border-[#E6E2D3]">
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                    <strong>⚠️ CRITICAL INTENDED USE LIMITATION:</strong> HAKILIX supports care teams with information for human review. It does not diagnose, treat, replace carers or make autonomous clinical decisions.
                  </div>
                  <div>
                    <strong className="block text-[#0A2A22] font-semibold">1. Software Status (UK MHRA / SaMD rules)</strong>
                    <p className="text-[#7A847A] mt-0.5">
                      Under UK MHRA regulations for Software as a Medical Device (SaMD), this software is categorized as an administrative support indicator and logging logbook. It does not carry automated diagnostic authority and must not be used as a primary clinical fall alert system or diagnostic tool in live clinical care environments.
                    </p>
                  </div>
                  <div>
                    <strong className="block text-[#0A2A22] font-semibold">2. Limitation of Liability</strong>
                    <p className="text-[#7A847A] mt-0.5">
                      We offer this sandbox &quot;as-is&quot; for conceptual presentation. We accept no liability under any circumstances for health tracking events, simulation parameters, or local logging metrics generated via this demonstration interface.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="pt-4 border-t border-[#E6E2D3] flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="bg-[#0A2A22] hover:bg-[#163e34] text-white font-semibold px-5 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
