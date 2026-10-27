import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenQueryModal: (serviceName?: string) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init-1',
    role: 'assistant',
    text: 'Hello! I am the REGISTREE AI assistant. We craft corporate websites starting from ₹19,999 (~$230 USD) with a 100% FREE custom logo, standalone logos for ₹999 (~$12 USD), and complete Import Export (EXIM) regulatory filings (IEC, AD Code, FSSAI, APEDA, ICEGATE). You can type here or switch to Live Voice to talk with Gemini 3.8 Live directly.',
    timestamp: 'Just now',
    showWhatsAppButton: true,
  },
];

// Audio Player for 24kHz Gemini Live output stream
class GeminiAudioPlayer {
  private ctx: AudioContext | null = null;
  private scheduledTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  constructor() {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx({ sampleRate: 24000 });
    }
  }

  playChunk(base64Data: string, onEnded?: () => void) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const buffer = this.ctx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      const startTime = Math.max(now, this.scheduledTime);
      source.start(startTime);
      this.scheduledTime = startTime + buffer.duration;
      this.activeSources.push(source);

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) this.activeSources.splice(idx, 1);
        if (onEnded && this.activeSources.length === 0) {
          onEnded();
        }
      };
    } catch (err) {
      console.warn('Audio decoding error:', err);
    }
  }

  stopAll() {
    this.activeSources.forEach((s) => {
      try {
        s.stop();
      } catch (_) {}
    });
    this.activeSources = [];
    if (this.ctx) {
      this.scheduledTime = this.ctx.currentTime;
    }
  }

  close() {
    this.stopAll();
    try {
      this.ctx?.close();
    } catch (_) {}
    this.ctx = null;
  }
}

// Convert 16kHz float32 to Base64 PCM16
function pcmFloat32ToBase64(channelData: Float32Array): string {
  const pcm16 = new Int16Array(channelData.length);
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  let binary = '';
  const bytes = new Uint8Array(pcm16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onToggle,
  onOpenQueryModal,
}) => {
  // Mode: 'text' or 'live'
  const [activeMode, setActiveMode] = useState<'text' | 'live'>('text');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Live Voice State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [liveStatusText, setLiveStatusText] = useState('Ready to connect');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  // Refs for audio and websocket
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<GeminiAudioPlayer | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, liveTranscript]);

  // Clean up Live Voice session
  const stopLiveSession = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }

    if (processorNodeRef.current) {
      try {
        processorNodeRef.current.disconnect();
      } catch (_) {}
      processorNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch (_) {}
      inputAudioCtxRef.current = null;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.close();
      audioPlayerRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setIsLiveConnected(false);
    setIsAiSpeaking(false);
    setAudioLevel(0);
    setLiveStatusText('Voice call ended');
  }, []);

  // Start Live Voice session with gemini-3.8-live
  const startLiveSession = async () => {
    stopLiveSession();
    setMicPermissionDenied(false);
    setLiveStatusText('Requesting microphone access...');

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setMicPermissionDenied(true);
      setLiveStatusText('Microphone access is not supported in this browser context.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const audioPlayer = new GeminiAudioPlayer();
      audioPlayerRef.current = audioPlayer;

      setLiveStatusText('Connecting to Gemini 3.8 Live...');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLiveConnected(true);
        setLiveStatusText('Connected to Gemini 3.8 Live • Listening...');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status === 'ready') {
            setLiveStatusText('🟢 Gemini 3.8 Live Active • Speak freely');
          }

          if (data.audio) {
            setIsAiSpeaking(true);
            audioPlayer.playChunk(data.audio, () => {
              setIsAiSpeaking(false);
            });
          }

          if (data.interrupted) {
            audioPlayer.stopAll();
            setIsAiSpeaking(false);
          }

          if (data.text) {
            setLiveTranscript((prev) => prev + ' ' + data.text);
          }

          if (data.error) {
            setLiveStatusText(`Notice: ${data.error}`);
          }
        } catch (e) {
          console.warn('WS message parse notice:', e);
        }
      };

      ws.onerror = () => {
        setLiveStatusText('Live connection interrupted. You can still use text chat.');
      };

      ws.onclose = () => {
        setIsLiveConnected(false);
      };

      // Set up Audio Processing & Visualizer
      const source = inputCtx.createMediaStreamSource(stream);
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;
      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (isMicMuted) return;
        const channelData = e.inputBuffer.getChannelData(0);
        if (ws.readyState === WebSocket.OPEN) {
          const base64Audio = pcmFloat32ToBase64(channelData);
          ws.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      // Audio waveform level animation
      const updateLevel = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err: any) {
      setMicPermissionDenied(true);
      setLiveStatusText('Microphone permission required for Live Voice call.');
      console.warn('Microphone permission notice:', err?.name || err?.message || 'Access denied');
    }
  };

  // Toggle Live mode
  const handleToggleMode = (mode: 'text' | 'live') => {
    setActiveMode(mode);
    if (mode === 'live') {
      startLiveSession();
    } else {
      setMicPermissionDenied(false);
      stopLiveSession();
    }
  };

  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, [stopLiveSession]);

  // Standard Text Chat Send
  const sendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText.trim(),
      timestamp: 'Now',
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText.trim(),
          history: newMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        'Thank you for reaching out to REGISTREE. Plans start from ₹19,999 (~$230 USD) with free logo design. For customized solutions or live consultations, message our team on WhatsApp at +91-6005534878.';

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: 'Now',
        showWhatsAppButton: true,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `asst-err-${Date.now()}`,
        role: 'assistant',
        text: 'REGISTREE helps businesses launch websites, automate operations, and register legally in India. Packages start from ₹19,999 (~$230 USD). Connect directly with our advisors on WhatsApp.',
        timestamp: 'Now',
        showWhatsAppButton: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (promptText: string) => {
    sendMessage(promptText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Chat / Voice Window */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-[#090e1f] text-white px-5 py-3.5 border-b border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${activeMode === 'live' && isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-[#0047ff]'}`}></span>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    REGISTREE AI Advisor
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/10 text-gray-300">
                    {activeMode === 'live' ? 'gemini-3.8-live' : 'gemini-3.8-flash'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Websites • Logo • EXIM Documentation • Company Reg
                </p>
              </div>
              <button
                onClick={onToggle}
                className="text-gray-400 hover:text-white text-xl p-1 leading-none cursor-pointer"
                aria-label="Close chat"
              >
                &times;
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-0.5 bg-white/10 border border-white/10 text-xs font-semibold">
              <button
                onClick={() => handleToggleMode('text')}
                className={`py-1.5 transition-colors cursor-pointer text-center ${
                  activeMode === 'text'
                    ? 'bg-white text-[#090e1f] font-bold shadow-xs'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                💬 Text Chat
              </button>
              <button
                onClick={() => handleToggleMode('live')}
                className={`py-1.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMode === 'live'
                    ? 'bg-[#0047ff] text-white font-bold shadow-xs'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                🎙️ Live Voice (Gemini Live)
              </button>
            </div>
          </div>

          {/* MODE 1: LIVE VOICE MODE */}
          {activeMode === 'live' ? (
            <div className="flex-1 bg-[#090e1f] text-white p-6 flex flex-col justify-between overflow-y-auto">
              {/* Visualizer & Status or Permission Fallback */}
              {micPermissionDenied ? (
                <div className="my-auto p-6 bg-white/5 border border-white/10 text-center max-w-sm mx-auto">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-2xl">
                    🎙️
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Microphone Access Required
                  </h4>
                  <p className="text-xs text-gray-300 mb-5 leading-relaxed">
                    Live Voice calls with Gemini 3.8 Live require microphone access to listen to your voice. Click below to allow permissions or continue using text chat.
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => {
                        setMicPermissionDenied(false);
                        startLiveSession();
                      }}
                      className="w-full py-2.5 bg-[#0047ff] hover:bg-white hover:text-[#090e1f] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Allow Microphone Access
                    </button>
                    <button
                      onClick={() => handleToggleMode('text')}
                      className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Use Text Chat Instead
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center my-auto text-center">
                  {/* Pulsing Voice Sphere */}
                  <div className="relative mb-6 flex items-center justify-center">
                    <div
                      className={`w-28 h-28 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                        isAiSpeaking
                          ? 'border-emerald-400 bg-emerald-500/20 scale-105 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                          : isLiveConnected
                          ? 'border-[#0047ff] bg-[#0047ff]/20 scale-100 shadow-[0_0_25px_rgba(0,71,255,0.4)]'
                          : 'border-gray-600 bg-white/5'
                      }`}
                    >
                      <span className="text-3xl">
                        {isAiSpeaking ? '🔊' : isMicMuted ? '🔇' : '🎙️'}
                      </span>
                    </div>

                    {/* Animated sound rings */}
                    {isLiveConnected && (
                      <div
                        className="absolute inset-0 rounded-full border border-blue-400/30 animate-ping pointer-events-none"
                        style={{ animationDuration: isAiSpeaking ? '1s' : '2s' }}
                      />
                    )}
                  </div>

                  {/* Status Indicator */}
                  <h3 className="text-sm font-bold tracking-tight mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {isAiSpeaking
                      ? 'Gemini is speaking...'
                      : isLiveConnected
                      ? isMicMuted
                        ? 'Microphone muted'
                        : 'Listening to your voice...'
                      : 'Connecting Live Voice Session...'}
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xs mb-4">
                    {liveStatusText}
                  </p>

                  {/* Real-time Audio Level Bar */}
                  {isLiveConnected && (
                    <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mb-5">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-75"
                        style={{ width: `${Math.max(8, audioLevel)}%` }}
                      />
                    </div>
                  )}

                  {/* Live Transcript Snippet */}
                  {liveTranscript && (
                    <div className="w-full bg-white/5 border border-white/10 p-3 text-left max-h-28 overflow-y-auto mb-4 text-xs font-mono text-gray-300">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold mb-1">
                        Live Transcript:
                      </span>
                      <p className="leading-relaxed">{liveTranscript}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Live Voice Controls */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setIsMicMuted((prev) => !prev)}
                    className={`py-2 px-3 text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      isMicMuted
                        ? 'bg-red-500/20 text-red-300 border-red-500/50'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <span>{isMicMuted ? 'Unmute' : 'Mute'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (audioPlayerRef.current) {
                        audioPlayerRef.current.stopAll();
                        setIsAiSpeaking(false);
                      }
                      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({ text: 'User interrupted.' }));
                      }
                    }}
                    className="py-2 px-3 text-xs font-semibold uppercase tracking-wider bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    Interrupt AI
                  </button>

                  <button
                    onClick={() => handleToggleMode('text')}
                    className="py-2 px-3 text-xs font-semibold uppercase tracking-wider bg-white text-[#090e1f] hover:bg-gray-200 transition-colors cursor-pointer font-bold"
                  >
                    Text Chat
                  </button>
                </div>

                <a
                  href="https://wa.me/916005534878"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 text-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  WhatsApp Trade Desk (+91-6005534878)
                </a>
              </div>
            </div>
          ) : (
            /* MODE 2: TEXT CHAT MODE */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Voice Prompt Banner */}
              <div className="bg-blue-50 border-b border-blue-100 p-2.5 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🎙️</span>
                  <p className="text-[11px] text-[#0047ff] font-semibold">
                    Want to speak instead?
                  </p>
                </div>
                <button
                  onClick={() => handleToggleMode('live')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#0047ff] text-white hover:bg-[#090e1f] transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Start Live Call &rarr;
                </button>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fbfbfd]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] text-xs leading-relaxed px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-[#090e1f] text-white'
                          : 'bg-white text-[#090e1f] border border-gray-200 shadow-2xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* WhatsApp & Callback Action */}
                    {msg.role === 'assistant' && msg.showWhatsAppButton && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a
                          href="https://wa.me/916005534878"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-[11px] font-semibold tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                        >
                          <span>WhatsApp (+91-6005534878) &rarr;</span>
                        </a>
                        <button
                          onClick={() => onOpenQueryModal('General Consultation')}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-[11px] font-semibold tracking-wide border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
                        >
                          <span>Submit Quote Request</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start">
                    <div className="bg-white border border-gray-200 px-4 py-3 text-xs text-gray-500 shadow-2xs flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#0047ff] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#0047ff] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#0047ff] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      <span className="ml-1 text-[11px]">Consulting REGISTREE knowledge...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex overflow-x-auto gap-2 no-scrollbar text-[11px]">
                <button
                  onClick={() => handleQuickPrompt('Website + Free Logo @ ₹19,999 details.')}
                  className="shrink-0 px-2.5 py-1 bg-red-50 border border-red-200 text-[#dc2626] font-bold hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Website + Free Logo
                </button>
                <button
                  onClick={() => handleQuickPrompt('How does the ₹999 standalone logo service work?')}
                  className="shrink-0 px-2.5 py-1 bg-white border border-gray-300 text-gray-700 hover:border-[#0047ff] hover:text-[#0047ff] transition-colors cursor-pointer"
                >
                  Logo Only @ ₹999
                </button>
                <button
                  onClick={() => handleQuickPrompt('How do I apply for IEC Code and AD Code?')}
                  className="shrink-0 px-2.5 py-1 bg-blue-50 border border-blue-200 text-[#0047ff] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  IEC & AD Code (EXIM)
                </button>
                <button
                  onClick={() => handleQuickPrompt('Which council RCMC do I need (APEDA, Spices Board, EEPC, FIEO)?')}
                  className="shrink-0 px-2.5 py-1 bg-white border border-gray-300 text-gray-700 hover:border-[#0047ff] hover:text-[#0047ff] transition-colors cursor-pointer"
                >
                  RCMC Councils
                </button>
                <button
                  onClick={() => handleQuickPrompt('Can you help register a Private Limited company?')}
                  className="shrink-0 px-2.5 py-1 bg-white border border-gray-300 text-gray-700 hover:border-[#0047ff] hover:text-[#0047ff] transition-colors cursor-pointer"
                >
                  Company Reg
                </button>
              </div>

              {/* Input field */}
              <form
                onSubmit={handleFormSubmit}
                className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about websites, logos, EXIM, or company registration..."
                  className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 focus:outline-hidden focus:border-[#0047ff] focus:bg-white transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => handleToggleMode('live')}
                  className="p-2 text-xs bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-[#0047ff] border border-gray-200 transition-colors cursor-pointer"
                  title="Switch to Gemini 3.8 Live Voice Call"
                >
                  🎙️
                </button>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#090e1f] text-white hover:bg-[#0047ff] transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={onToggle}
        className="group flex items-center space-x-3 px-5 py-3.5 bg-[#090e1f] text-white shadow-xl hover:bg-[#0047ff] transition-all duration-150 cursor-pointer border border-white/10"
        aria-label="Open AI Chatbot and Live Voice Call"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider">
          {isOpen ? 'Close Assistant' : 'Chat & Live Voice with Us'}
        </span>
      </button>
    </div>
  );
};
