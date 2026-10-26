import React, { useState, useRef, useEffect } from 'react';
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
    text: 'Hello! I am the REGISTREE AI assistant. Our Website Design package starts from ₹19,999 (~$230 USD) and includes a 100% FREE custom logo design. We also craft standalone logos for just ₹999 INR, alongside AI automation and corporate registration in India. How can I help you today?',
    timestamp: 'Just now',
    showWhatsAppButton: true,
  },
];

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onToggle,
  onOpenQueryModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

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
        'Thank you for reaching out to REGISTREE. Plans start from ₹19,999 (~$230 USD). For tailored quotes and instant onboarding, please connect with us on WhatsApp at +91-6005534878.';

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
        text: 'REGISTREE helps businesses go online, automate, and register legally in India. Plans start from ₹19,999 (~$230 USD). Please continue directly with our advisors on WhatsApp.',
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
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[90vw] sm:w-[380px] h-[520px] max-h-[82vh] bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-[#090e1f] text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <h4 className="text-xs font-semibold uppercase tracking-wider">
                  REGISTREE Assistant
                </h4>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                New Delhi • Instant AI Advisory
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

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fbfbfd]">
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

                {/* WhatsApp Continuation Button */}
                {msg.role === 'assistant' && msg.showWhatsAppButton && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href="https://wa.me/916005534878"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-[11px] font-semibold tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      <span>Continue on WhatsApp (+91-6005534878) &rarr;</span>
                    </a>
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
              onClick={() => handleQuickPrompt('Tell me about the Website + Free Logo bundle.')}
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
              onClick={() => handleQuickPrompt('What are your services and process?')}
              className="shrink-0 px-2.5 py-1 bg-white border border-gray-300 text-gray-700 hover:border-[#0047ff] hover:text-[#0047ff] transition-colors cursor-pointer"
            >
              All Services
            </button>
            <button
              onClick={() => handleQuickPrompt('Can you help register a company in India?')}
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
              placeholder="Ask about services or registration..."
              className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 focus:outline-hidden focus:border-[#0047ff] focus:bg-white transition-colors"
              disabled={loading}
            />
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

      {/* Floating Trigger Button */}
      <button
        onClick={onToggle}
        className="group flex items-center space-x-3 px-5 py-3.5 bg-[#090e1f] text-white shadow-xl hover:bg-[#0047ff] transition-all duration-150 cursor-pointer border border-white/10"
        aria-label="Open AI Chatbot"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider">
          {isOpen ? 'Close Chat' : 'Chat with Us'}
        </span>
      </button>
    </div>
  );
};
