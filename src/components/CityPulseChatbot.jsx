import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, MessageSquare, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { sendChatMessage, sanitizeInput } from '../services/geminiService';

export default function CityPulseChatbot({
  isOpen,
  onToggle,
  cityName = 'Jaipur',
  currentLocation,
  weatherData,
  aqiData,
  activeAnomalies = [],
  activeLayer = null,
  onShowToast
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'ai',
      content: `Hello! I'm CityPulse AI, your official assistant for CityPulse Jaipur. I can help you explore dashboard features, check real-time AQI and weather telemetry, or guide you on filing civic issue reports. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Suggested prompt chips based on site content
  const suggestedQuestions = [
    "What features does CityPulse provide?",
    "How do I report a civic issue?",
    "How does predictive disruption spread work?"
  ];

  // Auto-scroll message container on update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Build live dashboard telemetry context string
  const currentLocName = currentLocation?.name || cityName || 'Jaipur';
  const currentAQIVal = aqiData?.current?.us_aqi ?? (typeof aqiData === 'object' ? aqiData?.aqiVal : aqiData) ?? '149';
  const currentWeatherVal = weatherData?.current?.temperature_2m ?? (typeof weatherData?.temp === 'string' ? weatherData.temp.replace('°C', '') : '25');
  const activeLayerName = activeLayer 
    ? (activeLayer === 'impact' ? 'Impact Zone Analysis' : activeLayer === 'anomalies' ? 'Anomalies' : activeLayer === 'predictive' ? 'Predictive Spread' : activeLayer.toUpperCase()) 
    : 'Map Home';

  const dashboardContext = `
- Current Location: ${currentLocName}
- Current AQI: ${currentAQIVal}
- Current Weather: ${currentWeatherVal}°C
- Active Alerts: ${activeAnomalies.length} active anomalies
- Viewing Layer: ${activeLayerName}
`;

  const handleSend = async (textToSend) => {
    const rawQuery = (textToSend || input).trim();
    if (!rawQuery || isTyping) return;

    const sanitizedQuery = sanitizeInput(rawQuery);

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: sanitizedQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await sendChatMessage(sanitizedQuery, dashboardContext, messages);

      const aiMsg = {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: `msg-err-${Date.now()}`,
        role: 'ai',
        content: `AI is unavailable, check server logs`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 1. FLOATING CHAT BUBBLE (Fixed Bottom-Right Corner) */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? "Close CityPulse AI Assistant" : "Open CityPulse AI Assistant"}
        className={`fixed bottom-6 right-6 z-[2000] w-14 h-14 rounded-2xl text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] flex items-center justify-center cursor-pointer transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-lg active:scale-95 border border-white/20 focus:outline-none focus:ring-4 focus:ring-blue-400/30 ${
          isOpen
            ? 'bg-slate-800 hover:bg-slate-900'
            : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600'
        }`}
        style={{ '--accent-color': '#2563eb' }}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white text-[9px] font-black items-center justify-center text-white">AI</span>
            </span>
          </>
        )}
      </button>

      {/* 2. CHAT WINDOW CONTAINER (Fixed Bottom-Right, Full-Width on Mobile, Dark Mode Ready) */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-4 sm:right-6 z-[2000] w-[calc(100vw-2rem)] sm:w-96 max-w-[92vw] h-[34rem] max-h-[75vh] bg-white/80 dark:bg-slate-900/90 backdrop-blur-3xl saturate-[1.5] border border-white/60 dark:border-slate-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] ring-1 ring-black/[0.03] rounded-3xl flex flex-col overflow-hidden animate-slide-up"
          style={{ '--accent-color': '#2563eb' }}
        >
          {/* HEADER */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-tight leading-tight">CityPulse Assistant</h3>
                <p className="text-[10px] font-semibold text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Official Site AI • {cityName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-all cursor-pointer focus:outline-none"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar dark:text-slate-100">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 text-xs font-medium leading-relaxed shadow-2xs ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-xs max-w-[85%]'
                        : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80 max-w-[88%]'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className={`text-[9px] font-bold text-slate-400 dark:text-slate-500 block px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl rounded-tl-xs border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] italic ml-1">Gemini AI thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTED QUESTIONS CHIPS */}
          {messages.length <= 3 && (
            <div className="px-3.5 py-2 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={`sug-${idx}`}
                  onClick={() => handleSend(q)}
                  disabled={isTyping}
                  className="px-2.5 py-1.5 bg-white/90 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold text-[10px] rounded-lg border border-slate-200/50 dark:border-slate-600 ring-1 ring-black/[0.03] shadow-sm transition-all duration-300 ease-premium cursor-pointer truncate max-w-full hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                >
                  💡 {q}
                </button>
              ))}
            </div>
          )}

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={500}
              placeholder="Ask about CityPulse Jaipur..."
              aria-label="Ask CityPulse AI chatbot"
              className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-blue-500/20 cursor-pointer transition-all duration-300 ease-premium active:scale-95 flex-shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
