import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw, Check, Trash, AlertCircle } from 'lucide-react';

interface ResidentPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (photoBase64: string) => Promise<void>;
  initialPhotoUrl?: string | null;
  residentName: string;
}

export default function ResidentPhotoModal({
  isOpen,
  onClose,
  onSave,
  initialPhotoUrl,
  residentName,
}: ResidentPhotoModalProps) {
  const [activeTab, setActiveTab] = useState<'webcam' | 'upload'>('webcam');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto start webcam stream if active tab is webcam and modal is open
  useEffect(() => {
    if (isOpen && activeTab === 'webcam' && !capturedImage) {
      startWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [isOpen, activeTab, capturedImage]);

  const startWebcam = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stopWebcam();
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 360, height: 360, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => console.log('Video play interrupted', err));
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setCameraError('Permission denied or web camera is currently unavailable. Ensure the browser matches camera permissions at the top level.');
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the exact square region centered on the aspect ratio
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopWebcam();
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Strict warning: please only upload image assets (jpeg, png, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!capturedImage) return;
    setIsSaving(true);
    try {
      await onSave(capturedImage);
      handleClose();
    } catch (err) {
      console.error('Error saving profile photo:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    stopWebcam();
    setCapturedImage(null);
    setCameraError(null);
    onClose();
  };

  const clearPhoto = () => {
    setCapturedImage(null);
    if (activeTab === 'webcam') {
      startWebcam();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-fade-in animate-duration-150">
      <div 
        id="resident-photo-modal-panel"
        className="relative w-full max-w-md bg-white border border-[#E6E2D3] rounded-[28px] shadow-2xl overflow-hidden flex flex-col text-[#2D3A2D]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E6E2D3] flex items-center justify-between bg-[#F5F2ED]/60">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#4E6E5D] font-mono">STAFF ACCESS PROFILE IDENTIFIER</span>
            <h3 className="text-base font-serif font-bold text-[#0A2A22]">Resident Identification Photo</h3>
            <p className="text-[11px] text-[#7A847A] mt-0.5">Capturing image for <strong className="text-[#0A2A22]">{residentName}</strong></p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-stone-200 transition cursor-pointer"
            title="Dismiss photo workspace"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-[#E6E2D3] text-xs font-semibold bg-[#F5F2ED]/25">
          <button
            onClick={() => {
              setActiveTab('webcam');
              setCapturedImage(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'webcam'
                ? 'border-[#4E6E5D] text-[#0A2A22] bg-white font-bold'
                : 'border-transparent text-[#7A847A] hover:text-[#2D3A2D] hover:bg-stone-100/50'
            }`}
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>WEBCAM SNAPSHOT</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('upload');
              setCapturedImage(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#4E6E5D] text-[#0A2A22] bg-white font-bold'
                : 'border-transparent text-[#7A847A] hover:text-[#2D3A2D] hover:bg-stone-100/50'
            }`}
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span>UPLOAD IMAGE</span>
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-6 flex flex-col items-center justify-center flex-1">
          {capturedImage ? (
            /* Selected/Captured image preview frame */
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="relative w-52 h-52 rounded-2xl overflow-hidden border-2 border-[#4E6E5D] shadow-inner bg-stone-100">
                <img
                  src={capturedImage}
                  alt="Captured Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute bottom-2 right-2 bg-black/75 hover:bg-black/90 p-2 rounded-full transition shadow text-white cursor-pointer"
                  title="Discard photo"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#4E6E5D] font-mono flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Ready for secure credentials storage
              </span>
            </div>
          ) : activeTab === 'webcam' ? (
            /* Live webcam workspace */
            <div className="flex flex-col items-center space-y-4 w-full">
              {cameraError ? (
                <div className="w-full p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs flex gap-2.5 items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 leading-relaxed">
                    <p className="font-semibold">Webcam Feed Obstruction</p>
                    <p className="text-[11px] text-red-700/90">{cameraError}</p>
                    <button
                      type="button"
                      onClick={startWebcam}
                      className="mt-2 text-[10px] font-bold text-[#0A2A22] underline cursor-pointer hover:text-[#2D3A2D]"
                    >
                      Try Re-initializing Camera Feed
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-56 h-56 rounded-2xl overflow-hidden border border-[#E6E2D3] bg-stone-950 shadow-md">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]" // mirror look
                  />
                  {!stream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 text-stone-400 bg-stone-900/90">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#A3B18A]" />
                      <span className="text-[10px] font-mono uppercase tracking-wider">Acquiring digital optics...</span>
                    </div>
                  )}
                </div>
              )}

              {stream && (
                <button
                  type="button"
                  onClick={handleCapture}
                  className="bg-[#0A2A22] hover:bg-[#1A381A] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow flex items-center gap-2 transition cursor-pointer border border-[#0A2A22]"
                >
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span>CAPTURE PHOTO SNAPSHOT</span>
                </button>
              )}
            </div>
          ) : (
            /* Local upload file dropzone */
            <div className="w-full flex flex-col items-center justify-center">
              <div
                className={`w-full h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition text-center cursor-pointer ${
                  dragActive
                    ? 'border-[#4E6E5D] bg-[#4E6E5D]/5'
                    : 'border-[#E6E2D3] hover:border-[#A3B18A]/60 bg-[#F5F2ED]/10 hover:bg-[#F5F2ED]/40'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-[#7A847A] mb-2 shrink-0" />
                <p className="text-xs font-bold text-[#2D3A2D]">Drag &amp; Drop profile photo</p>
                <p className="text-[11px] text-[#7A847A] mt-1">or click to browse local files</p>
                <p className="text-[9px] text-stone-400 font-mono mt-3 uppercase tracking-wider">Formats: JPEG, PNG, WEBP (Max 4MB)</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-[#E6E2D3] flex items-center justify-end gap-3 bg-[#F5F2ED]/40 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-stone-600 bg-white border border-[#E6E2D3] hover:bg-stone-50 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!capturedImage || isSaving}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white tracking-wide transition shadow-sm flex items-center gap-1.5 cursor-pointer select-none ${
              !capturedImage || isSaving
                ? 'bg-stone-300 pointer-events-none'
                : 'bg-[#4E6E5D] hover:bg-[#3D5A4A] border border-[#3D5A4A]'
            }`}
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'UPDATING DB RECORDS...' : 'SAVE & APPLY PHOTO'}</span>
          </button>
        </div>

        {/* Hidden canvas helper for grabbing standard 400x400 squared images from webcam */}
        <canvas ref={canvasRef} width="400" height="400" className="hidden" />
      </div>
    </div>
  );
}
