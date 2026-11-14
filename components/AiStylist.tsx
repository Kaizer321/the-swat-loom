import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { ChatMessage } from '../types';
import { getWeaverRecommendation, streamWeaverRecommendation } from '../services/geminiService';

interface AiStylistProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const AiStylist: React.FC<AiStylistProps> = ({ isOpen, onClose, initialQuery }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Greetings, traveler. I am the Weaver. Tell me, where do you plan to wear the warmth of Swat? Is it a wedding in the snow, or a quiet evening by the fire?" }
  ]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      setInput(initialQuery);
    }
  }, [initialQuery, isOpen]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    let streamAccumulator = '';
    let hasStartedStreaming = false;

    try {
      await streamWeaverRecommendation(userText, (chunk) => {
        if (!hasStartedStreaming) {
          hasStartedStreaming = true;
          setLoading(false);
          setMessages(prev => [...prev, { role: 'model', text: chunk }]);
        } else {
          streamAccumulator += chunk;
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1] = { 
              role: 'model', 
              text: (next[next.length - 1]?.text || '') + chunk 
            };
            return next;
          });
        }
      });
    } catch (_) {
      // Fallback already handled inside streamWeaverRecommendation
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" 
        onClick={onClose}
      />

      {/* Chat Interface */}
      <div className="relative w-full sm:w-[400px] h-[80vh] sm:h-[600px] bg-stone-900 border-l border-stone-700 shadow-2xl flex flex-col pointer-events-auto sm:mr-0 sm:rounded-l-2xl overflow-hidden animate-slide-in-right">
        
        {/* Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-900/30 rounded-full">
              <Icons.Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-heading text-amber-100">The Master Weaver</h3>
              <p className="text-xs text-stone-500 font-body">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
            <Icons.Close className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-4 text-sm leading-relaxed font-body rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-stone-800 text-stone-200 rounded-tr-none' 
                    : 'bg-amber-900/20 text-amber-100 border border-amber-900/30 rounded-tl-none font-accent italic'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-amber-900/20 p-4 rounded-2xl rounded-tl-none flex gap-2">
                <span className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-stone-950 border-t border-stone-800">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your occasion or mood..."
              className="w-full bg-stone-900 text-stone-200 border border-stone-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-amber-700 placeholder-stone-600 font-body"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-amber-600 hover:text-amber-400 disabled:opacity-50 transition-colors"
            >
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiStylist;
