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
    text: 'Hello! I am the REGISTREE AI Voice & Chat Assistant. We build corporate websites from ₹19,999 (~$230 USD) with a 100% FREE custom logo, standalone logos for ₹999 (~$12 USD), and complete Import Export (EXIM) regulatory filings (IEC, AD Code, FSSAI, APEDA, ICEGATE). You can type here or switch to Live Voice to have a real-time conversation!',
    timestamp: 'Just now',
    showWhatsAppButton: true,
  },
];

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onToggle,
  onOpenQueryModal,
}) => {
  // Mode: 'text' or 'live'
  const [activeMode, setActiveMode] = useState<'text' | 'live'>('text');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [liveInput, setLiveInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Live Voice State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [liveStatusText, setLiveStatusText] = useState('Connecting voice engine...');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pulseIntervalRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, liveTranscript]);

  // Clean up speech synthesis & recognition
  const stopLiveSession = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }

    setIsLiveConnected(false);
    setIsAiSpeaking(false);
    setAudioLevel(0);
    setLiveStatusText('Voice session paused');
  }, []);

  // Text-To-Speech function using browser synthesis
  const speakVoiceReply = useCallback((textToSpeak: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('India') ||
            v.name.includes('US'))
      ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setIsAiSpeaking(true);
      setLiveStatusText('Gemini is speaking...');
      setAudioLevel(75);

      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 45) + 40);
      }, 150);
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setIsAiSpeaking(false);
      setAudioLevel(0);
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
      setLiveStatusText('🟢 Listening to your voice...');
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setIsAiSpeaking(false);
      setAudioLevel(0);
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
      setLiveStatusText('🟢 Listening to your voice...');
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Process a question/query during Voice Mode
  const processVoiceInput = useCallback(
    async (spokenText: string) => {
      if (!spokenText.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: `user-voice-${Date.now()}`,
        role: 'user',
        text: spokenText.trim(),
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, userMsg]);
      setLiveTranscript(`You said: "${spokenText.trim()}"`);
      setLiveStatusText('Gemini is thinking...');
      setLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: spokenText.trim(),
            history: messages.slice(-4).map((m) => ({ role: m.role, text: m.text })),
          }),
        });

        const data = await response.json();
        const replyText =
          data.reply ||
          'Thank you for reaching out to REGISTREE. Our website packages start from ₹19,999 (~$230 USD) including a free custom logo. Standalone logos are ₹999. Would you like to connect on WhatsApp at +91-6005534878?';

        const asstMsg: ChatMessage = {
          id: `asst-voice-${Date.now()}`,
          role: 'assistant',
          text: replyText,
          timestamp: 'Just now',
          showWhatsAppButton: true,
        };

        setMessages((prev) => [...prev, asstMsg]);
        setLiveTranscript(`Gemini: ${replyText}`);
        speakVoiceReply(replyText);
      } catch (err) {
        console.warn('Voice API query error, using local fallback:', err);
        const fallbackText =
          'REGISTREE helps businesses launch websites from ₹19,999 (~$230 USD) with a free custom logo, standalone logos for ₹999, and complete Import Export regulatory filings. Connect directly with our advisors on WhatsApp at +91-6005534878.';
        speakVoiceReply(fallbackText);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, speakVoiceReply]
  );

  // Start Voice Session
  const startLiveSession = useCallback(() => {
    stopLiveSession();
    setMicPermissionDenied(false);
    setLiveStatusText('Initializing microphone...');

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setLiveStatusText('Browser speech recognition not supported. You can use text chat.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsLiveConnected(true);
        setLiveStatusText('🟢 Voice Connected • Speak freely');
      };

      recognition.onresult = (event: any) => {
        // If AI is speaking and user speaks, stop AI speech
        if (isSpeakingRef.current) {
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          isSpeakingRef.current = false;
          setIsAiSpeaking(false);
        }

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setLiveTranscript(interim);
          setLiveStatusText('Listening to your voice...');
          setAudioLevel(50);
        }

        if (final.trim()) {
          setAudioLevel(0);
          processVoiceInput(final.trim());
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          setMicPermissionDenied(true);
          setLiveStatusText('Microphone permission required for Live Voice call.');
        } else {
          console.warn('Speech recognition notice:', e.error);
        }
      };

      recognition.onend = () => {
        // Automatically resume listening if still in Live mode and not muted
        if (recognitionRef.current && !isMicMuted) {
          try {
            recognition.start();
          } catch (_) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.warn('Recognition start notice:', err);
      setLiveStatusText('Could not start microphone. You can type below or use text chat.');
    }
  }, [isMicMuted, processVoiceInput, stopLiveSession]);

  // Mode Switcher
  const handleToggleMode = (mode: 'text' | 'live') => {
    setActiveMode(mode);
    if (mode === 'live') {
      startLiveSession();
    } else {
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
          history: newMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
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
        text: 'REGISTREE helps businesses launch websites, automate operations, and register legally in India. Packages start from ₹19,999 (~$230 USD). Connect directly with our advisors on WhatsApp at +91-6005534878.',
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

  const handleLiveTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (liveInput.trim()) {
      processVoiceInput(liveInput.trim());
      setLiveInput('');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Chat / Voice Window */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[410px] h-[590px] max-h-[85vh] bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-[#090e1f] text-white px-5 py-3.5 border-b border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeMode === 'live' && isLiveConnected
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-[#0047ff]'
                    }`}
                  ></span>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    REGISTREE AI Advisor
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/10 text-gray-300">
                    {activeMode === 'live' ? 'Voice & Speech Live' : 'AI Chat'}
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
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                🎙️ Live Voice Call
              </button>
            </div>
          </div>

          {/* MODE 1: LIVE VOICE MODE */}
          {activeMode === 'live' ? (
            <div className="flex-1 bg-[#090e1f] text-white p-5 flex flex-col justify-between overflow-y-auto">
              {micPermissionDenied ? (
                <div className="my-auto p-5 bg-white/5 border border-white/10 text-center max-w-sm mx-auto">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl">
                    🎙️
                  </div>
                  <h4
                    className="text-sm font-bold text-white mb-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Microphone Access Required
                  </h4>
                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    To talk with REGISTREE in real time, please click below to allow microphone access, or switch back to text chat.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setMicPermissionDenied(false);
                        startLiveSession();
                      }}
                      className="w-full py-2 bg-[#0047ff] hover:bg-white hover:text-[#090e1f] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Allow Microphone Access
                    </button>
                    <button
                      onClick={() => handleToggleMode('text')}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Use Text Chat Instead
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center my-auto text-center">
                  {/* Pulsing Voice Sphere */}
                  <div className="relative mb-5 flex items-center justify-center">
                    <div
                      className={`w-24 h-24 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                        isAiSpeaking
                          ? 'border-emerald-400 bg-emerald-500/20 scale-105 shadow-[0_0_25px_rgba(52,211,153,0.5)]'
                          : isLiveConnected
                          ? 'border-[#0047ff] bg-[#0047ff]/20 scale-100 shadow-[0_0_20px_rgba(0,71,255,0.4)]'
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
                        style={{ animationDuration: isAiSpeaking ? '1.2s' : '2.2s' }}
                      />
                    )}
                  </div>

                  {/* Status Indicator */}
                  <h3
                    className="text-sm font-bold tracking-tight mb-1"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {isAiSpeaking
                      ? 'Gemini is speaking...'
                      : isLiveConnected
                      ? isMicMuted
                        ? 'Microphone muted'
                        : 'Listening to your voice...'
                      : 'Connecting Live Voice Session...'}
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xs mb-3">
                    {liveStatusText}
                  </p>

                  {/* Real-time Audio Level Bar */}
                  {isLiveConnected && (
                    <div className="w-44 h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-75"
                        style={{ width: `${Math.max(12, audioLevel)}%` }}
                      />
                    </div>
                  )}

                  {/* Live Transcript Box */}
                  <div className="w-full bg-white/5 border border-white/10 p-3 text-left max-h-24 overflow-y-auto mb-3 text-xs font-mono text-gray-300">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold mb-1">
                      Conversation Dialogue:
                    </span>
                    <p className="leading-relaxed">
                      {liveTranscript || 'Start speaking freely, or type a question below.'}
                    </p>
                  </div>

                  {/* Inline Voice Typing Input */}
                  <form onSubmit={handleLiveTextSubmit} className="w-full flex items-center gap-1.5">
                    <input
                      type="text"
                      value={liveInput}
                      onChange={(e) => setLiveInput(e.target.value)}
                      placeholder="Type while in voice call..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-hidden focus:border-[#0047ff]"
                    />
                    <button
                      type="submit"
                      disabled={!liveInput.trim()}
                      className="px-3 py-1.5 text-xs font-bold uppercase bg-[#0047ff] hover:bg-white hover:text-[#090e1f] text-white transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Ask
                    </button>
                  </form>
                </div>
              )}

              {/* Live Voice Controls */}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      if (isMicMuted) {
                        setIsMicMuted(false);
                        startLiveSession();
                      } else {
                        setIsMicMuted(true);
                        if (recognitionRef.current) {
                          try {
                            recognitionRef.current.abort();
                          } catch (_) {}
                        }
                        setLiveStatusText('Microphone muted');
                      }
                    }}
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
                      if (typeof window !== 'undefined' && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                      }
                      isSpeakingRef.current = false;
                      setIsAiSpeaking(false);
                      setAudioLevel(0);
                      setLiveStatusText('🟢 Listening to your voice...');
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
                  className="w-full py-2 text-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  WhatsApp Trade Desk (+91-6005534878)
                </a>
              </div>
            </div>
          ) : (
            /* MODE 2: TEXT CHAT MODE */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Voice Call Switcher Banner */}
              <div className="bg-blue-50 border-b border-blue-100 p-2.5 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🎙️</span>
                  <p className="text-[11px] text-[#0047ff] font-semibold">
                    Want to speak with voice instead?
                  </p>
                </div>
                <button
                  onClick={() => handleToggleMode('live')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#0047ff] text-white hover:bg-[#090e1f] transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Start Voice Call &rarr;
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
                  onClick={() => sendMessage('Website + Free Logo @ ₹19,999 details.')}
                  className="shrink-0 px-2.5 py-1 bg-red-50 border border-red-200 text-[#dc2626] font-bold hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Website + Free Logo
                </button>
                <button
                  onClick={() => sendMessage('How does the ₹999 standalone logo service work?')}
                  className="shrink-0 px-2.5 py-1 bg-white border border-gray-300 text-gray-700 hover:border-[#0047ff] hover:text-[#0047ff] transition-colors cursor-pointer"
                >
                  Logo Only @ ₹999
                </button>
                <button
                  onClick={() => sendMessage('How do I apply for IEC Code and AD Code (EXIM)?')}
                  className="shrink-0 px-2.5 py-1 bg-blue-50 border border-blue-200 text-[#0047ff] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  IEC & AD Code
                </button>
                <button
                  onClick={() => sendMessage('Which council RCMC do I need (APEDA, Spices Board, EEPC)?')}
                  className="shrink-0 px-2.5 py-1 bg-white border border-gray-300 text-gray-700 hover:border-[#0047ff] hover:text-[#0047ff] transition-colors cursor-pointer"
                >
                  Council RCMC
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
                  title="Switch to Live Voice Call"
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
