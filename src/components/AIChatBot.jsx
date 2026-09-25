import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';

export default function AIChatBot({
  cityName = 'New Delhi',
  weather = '25°C Clear',
  aqi = '75',
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
  hideTrigger = false
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Namaste! I am CityPulse AI, your civic assistant for ${cityName}. Current live weather is ${weather} with US AQI ${aqi}. Ask me anything about traffic, weather, or local urban telemetry!`,
      timestamp: 'Just now'
    }
  ]);

  // Update bot welcome message when city changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === 'bot') {
        return [{
          id: 1,
          sender: 'bot',
          text: `Welcome to ${cityName}! Live weather: ${weather}, AQI: ${aqi}. How can CityPulse AI assist you today?`,
          timestamp: 'Just now'
        }];
      }
      return prev;
    });
  }, [cityName, weather, aqi]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage.trim();
    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call Gemini API service with context
      const aiResponseText = await sendChatMessage(userText, cityName, weather, aqi, messages);
      
      const newBotMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, newBotMsg]);
    } catch (err) {
      console.error('Chat AI error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] pointer-events-auto">
      {/* Expanded Glassmorphic Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[460px] bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xs font-bold tracking-tight">CityPulse AI ({cityName})</h3>
                <span className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini AI Powered • Live Telemetry
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              tabIndex={0}
              aria-label="Close Chat Window"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium italic pl-8">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-300"></span>
                <span>Gemini AI thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[`Traffic in ${cityName}`, `Weather update`, `AQI advice`].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInputMessage(prompt)}
                tabIndex={0}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-[10px] font-medium text-slate-600 transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask CityPulse AI about ${cityName}...`}
              tabIndex={0}
              className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              tabIndex={0}
              aria-label="Send Message to Gemini AI"
              disabled={!inputMessage.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
