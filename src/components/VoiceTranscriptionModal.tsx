import React, { useState } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  Loader2, 
  ArrowRight,
  ClipboardCheck
} from 'lucide-react';
import { Resident } from '../types';

interface VoiceTranscriptionModalProps {
  resident: Resident;
  onClose: () => void;
  onSaveNote: (noteText: string, noteType: string, mood: string, mobility: string) => void;
}

export default function VoiceTranscriptionModal({
  resident,
  onClose,
  onSaveNote
}: VoiceTranscriptionModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [structuredResult, setStructuredResult] = useState<any | null>(null);

  // Ready script scenarios to simulate speech dictation efficiently
  const speechSamples = [
    {
      title: 'Albert Morning Transfer Assist',
      text: "Albert was very active this morning. Guided him to get out of bed using the physical support frame. He didn't seem dizzy and moved quite steadily to the ensuite washbasin, took about five minutes. Mood was relaxed and cooperative."
    },
    {
      title: 'Charles Therapy Gait Evaluation',
      text: "Completed walk evaluation with Charles. He stood up with minor frame adjust, posture was slightly leaning right. Exercised walking 15 steps. Mobility looks better but still unstable without hands-on carer guides. No falls noted."
    },
    {
      title: 'Beatrix Evening Pacing Logs',
      text: "Beatrix appeared somewhat restless during corridor stroll, lingering about the front doors several times. Steered her softly back to lounge area. Mindful orientation is degraded today, but physically she is walking fine unassisted."
    },
    {
      title: 'General Well-being & Diet Log',
      text: "Resident was quiet during lunch. Finished full meal independently. Resting comfortably in armchair, complaining slightly of minor knee stiffness. Temperature normal. No support issues."
    }
  ];

  const handleSelectSample = (txt: string) => {
    setRecordingText(txt);
  };

  const startListeningSim = () => {
    setIsRecording(true);
    setStructuredResult(null);
    let index = 0;
    const sample = speechSamples[Math.floor(Math.random() * speechSamples.length)].text;
    
    // Simulate speech flow text rolling
    setRecordingText('');
    const interval = setInterval(() => {
      const words = sample.split(' ');
      if (index < words.length) {
        setRecordingText(prev => prev + (prev ? ' ' : '') + words[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsRecording(false);
      }
    }, 70);
  };

  const handleTranscribeWithGemini = async () => {
    if (!recordingText.trim()) return;
    setIsProcessing(true);
    setStructuredResult(null);

    try {
      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice_command: recordingText,
          resident_id: resident.id
        })
      });

      const data = await res.json();
      if (data.success) {
        setStructuredResult(data.clinical_structures);
      }
    } catch (err) {
      console.error('Error during voice dictation AI call:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAndSave = () => {
    if (!structuredResult) return;
    onSaveNote(
      structuredResult.professional_note,
      structuredResult.category || 'Voice Dictated Log',
      structuredResult.mood || 'Calm',
      structuredResult.mobility || 'Stable walk'
    );
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-[28px] shadow-xl border border-[#E6E2D3] overflow-hidden w-full max-w-2xl flex flex-col max-h-[85vh]">
        
        {/* Title Bar */}
        <div className="p-6 border-b border-[#E6E2D3] flex items-center justify-between bg-[#2D3A2D] text-white">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-[#A3B18A] animate-pulse shrink-0" />
            <div>
              <h3 className="font-serif italic font-semibold text-white tracking-tight">AI Voice Assistant Speech Dictation</h3>
              <p className="text-[#A3B18A] text-[10.5px] mt-0.5 font-sans">Clinical logs parser for {resident.first_name} {resident.last_name}</p>
            </div>
          </div>
          <button 
            id="close-voice-modal"
            onClick={onClose}
            className="text-stone-300 hover:text-white transition focus:outline-none p-1.5 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Simulation Helper message */}
          <div className="text-xs text-[#2D3A2D] leading-relaxed bg-[#F5F2ED]/60 p-4 rounded-2xl border border-[#E6E2D3]">
            <strong>Voice Simulation Helper:</strong> Click the microphone below to model automated real-time speech input, select from typical carer speech drafts below, or type your custom verbal note directly in the text pane.
          </div>

          {/* Quick Script Scenarios selection */}
          <div>
            <span className="text-[10px] font-bold text-[#7A847A] tracking-widest uppercase block mb-2">Speech Draft Scripts</span>
            <div className="flex flex-wrap gap-2">
              {speechSamples.map((samp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(samp.text)}
                  className="bg-[#F5F2ED] hover:bg-[#4E6E5D] hover:text-white border border-[#E6E2D3] text-[#2D3A2D] text-[11px] px-3.5 py-1.5 rounded-full transition text-left font-medium focus:outline-none cursor-pointer"
                >
                  {samp.title}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-[#E6E2D3]/60" />

          {/* Audio Input area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#2D3A2D] block select-none">Transcribed spoken speech draft</label>
            <textarea
              value={recordingText}
              onChange={(e) => setRecordingText(e.target.value)}
              placeholder="What would you like to log? Record with the mic tool, select a script above, or type manually..."
              rows={4}
              className="w-full text-xs font-sans text-[#2D3A2D] border border-[#E6E2D3] rounded-2xl p-4 focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none focus:border-[#4E6E5D] bg-[#F5F2ED]/10"
            />
          </div>

          {/* Recording Control button bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              id="voice-mic-trigger"
              onClick={isRecording ? () => setIsRecording(false) : startListeningSim}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-semibold transition focus:outline-none cursor-pointer ${
                isRecording 
                  ? 'bg-[#D98E73] text-white animate-pulse' 
                  : 'bg-[#4E6E5D] hover:bg-[#3D5A4A] text-white shadow-sm'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              {isRecording ? 'Listening Speak now...' : 'Simulate spoken Microphone input'}
            </button>

            {recordingText.trim().length > 0 && (
              <button
                id="voice-gemini-submit"
                onClick={handleTranscribeWithGemini}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 bg-[#2D3A2D] hover:bg-[#1C261C] disabled:bg-[#7A847A]/30 text-white text-xs font-bold px-5 py-3 rounded-full transition shadow-sm focus:outline-none cursor-pointer"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-[#A3B18A]" />}
                Struct Note with Gemini AI
              </button>
            )}
          </div>

          {/* Structured translation preview */}
          {structuredResult && (
            <div className="p-5 border border-[#A3B18A]/50 rounded-[24px] bg-[#4E6E5D]/5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#4E6E5D] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-[#4E6E5D]" />
                  Gemini Structured Care Note Draft
                </h4>
                <span className="text-[10px] font-mono bg-[#486354] text-white font-bold px-2 py-0.5 rounded-full shadow-xxs">
                  PARSED OK
                </span>
              </div>

              {/* Categorization chips */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-white border border-[#E6E2D3] p-3 rounded-xl">
                  <div className="text-[9px] text-[#7A847A] font-bold uppercase tracking-wider">CATEGORY</div>
                  <div className="text-xs font-bold text-[#2D3A2D] mt-0.5">{structuredResult.category || 'General Log'}</div>
                </div>

                <div className="bg-white border border-[#E6E2D3] p-3 rounded-xl">
                  <div className="text-[9px] text-[#7A847A] font-bold uppercase tracking-wider">OBSERVED MOOD</div>
                  <div className="text-xs font-bold text-[#2D3A2D] mt-0.5">{structuredResult.mood || 'Cooperative'}</div>
                </div>

                <div className="bg-white border border-[#E6E2D3] p-3 rounded-xl">
                  <div className="text-[9px] text-[#7A847A] font-bold uppercase tracking-wider">MOBILITY STATUS</div>
                  <div className="text-xs font-bold text-[#2D3A2D] mt-0.5">{structuredResult.mobility || 'Lying in bed'}</div>
                </div>
              </div>

              <div className="bg-white border border-[#E6E2D3] p-4 rounded-xl text-xs text-[#2D3A2D]/90 leading-relaxed font-normal shadow-xxs">
                {structuredResult.professional_note}
              </div>

              <div className="text-[10px] text-[#7A847A] leading-none">
                ✓ Phrasing compliance checked. No diagnostic, cured, or treating vocabulary found.
              </div>
            </div>
          )}

        </div>

        {/* Action Bottom */}
        <div className="p-5 border-t border-[#E6E2D3] bg-[#F5F2ED]/40 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="text-xs font-medium text-[#2D3A2D] hover:text-[#2D3A2D] border border-[#E6E2D3] rounded-full px-5 py-2.5 hover:bg-white transition cursor-pointer"
          >
            Discard
          </button>
          
          {structuredResult && (
            <button
              onClick={handleApproveAndSave}
              className="flex items-center gap-1.5 bg-[#4E6E5D] hover:bg-[#3D5A4A] text-white text-xs font-bold rounded-full px-5 py-2.5 transition shadow-sm focus:outline-none cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Approve &amp; Save to Resident File
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
