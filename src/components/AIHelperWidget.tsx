import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Bot, User, HelpCircle, ShieldAlert, ArrowRight, TrendingUp } from 'lucide-react';
import { CryptoAsset } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIHelperWidgetProps {
  selectedAsset: CryptoAsset;
  currentPrice: number;
  isKeyInvalid: boolean;
  activeIndicator?: 'RSI' | 'MACD' | 'Polymarket' | 'BOLLINGER';
}

export default function AIHelperWidget({
  selectedAsset,
  currentPrice,
  isKeyInvalid,
  activeIndicator = 'RSI',
}: AIHelperWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your Kraken Intelligence Copilot. 🧠

If you feel unsure about live market conditions, indicators, or connecting credentials, I'm here to translate advanced crypto analytics into direct, baby-simple logic. 

How can I help you navigate the terminal today?`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputVal;
    if (!textToSend.trim() || isLoading) return;

    if (!customText) {
      setInputVal('');
    }

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/helper/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            selectedAsset,
            currentPrice,
            isKeyInvalid,
            activeIndicator,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `copilot-${Date.now()}`,
            role: 'assistant',
            content: data.text,
          },
        ]);
      } else {
        throw new Error('API server encountered error');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-error-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Failed to connect to the Copilot service. Please verify your workspace setup.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      id: 'p-trend',
      label: `💡 Current ${selectedAsset} Trend`,
      query: `Explain current ${selectedAsset} market conditions and live price target $${currentPrice}. What's the baby logic here?`,
    },
    {
      id: 'p-indicators',
      label: `📊 Demystify Technical Indicators`,
      query: `Explain how Relative Strength Index (RSI) and MACD help me form a thesis if I am feeling unsure.`,
    },
    {
      id: 'p-credentials',
      label: `🔑 Sandbox vs Real Ledger`,
      query: `My Credentials Vault state is ${isKeyInvalid ? 'stale/offline' : 'connected'}. How do I configure my Kraken private API keys correctly?`,
    },
    {
      id: 'p-safety',
      label: '⚠️ Position Risk & Safe Playbook',
      query: `I want to manage risk wisely inside volatile spot markets. Give me a safe playbook to set defensive stop losses and sizing.`,
    },
  ];

  return (
    <>
      {/* Floating Toggle Bubble Launcher */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          id="ai-helper-launcher"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative ${
            isOpen
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/30'
              : 'bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 shadow-indigo-950/50 border border-indigo-400/20'
          }`}
          title="Speak to Trade Copilot"
        >
          {isOpen ? (
            <X id="ai-helper-icon-close" className="h-6 w-6" />
          ) : (
            <>
              <Sparkles id="ai-helper-icon-sparkles" className="h-6 w-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-950"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Slide-out Terminal Assistant Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-helper-drawer"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[360px] md:w-[400px] h-[580px] max-h-[85vh] rounded-2xl border border-slate-800 bg-[#060913]/98 text-slate-100 shadow-2xl shadow-indigo-950/80 backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Header branding */}
            <div id="ai-helper-header" className="flex items-center justify-between border-b border-indigo-950/60 bg-[#090e1d] p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <Bot className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">AI Trading Copilot</span>
                    <span className="inline-block rounded bg-indigo-500/10 px-1 py-0.2 text-[8px] font-mono text-indigo-300 border border-indigo-500/10">Active</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Kraken Intelligence Companion</p>
                </div>
              </div>
              
              <button
                id="ai-helper-header-close"
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Context Widget Tracker Banner */}
            <div id="ai-helper-tracker-banner" className="bg-[#03060c] border-b border-slate-900 px-4 py-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-sky-400" /> Tracking: <strong className="text-slate-200">{selectedAsset} (${currentPrice})</strong>
              </span>
              <span className="flex items-center gap-1">
                Indicator: <strong className="text-slate-200 uppercase">{activeIndicator}</strong>
              </span>
            </div>

            {/* Messages Canvas */}
            <div
              id="ai-helper-messages-container"
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth min-h-[100px] scrollbar-thin scrollbar-thumb-slate-850"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 max-w-[85%] ${
                    m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                      m.role === 'user'
                        ? 'border-indigo-400/20 bg-indigo-950/20 text-indigo-400'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  <div
                    className={`rounded-xl px-3 py-2.5 text-2xs leading-relaxed font-sans whitespace-pre-line shadow-sm border ${
                      m.role === 'user'
                        ? 'bg-indigo-600/10 border-indigo-500/25 text-indigo-200'
                        : 'bg-[#090c15] border-slate-900 text-slate-200'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 text-slate-400">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-[#090c15] border border-slate-900 rounded-xl px-3 py-2.5 text-2xs flex items-center gap-1 text-slate-400 font-mono">
                    <span className="animate-pulse">Thinking... Let me compile current chart indices</span>
                    <span className="animate-bounce font-extrabold text-indigo-400">.</span>
                    <span className="animate-bounce animation-delay-200 font-extrabold text-indigo-400">.</span>
                    <span className="animate-bounce animation-delay-400 font-extrabold text-indigo-400">.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Input Area & Quick Suggestions */}
            <div id="ai-helper-footer" className="bg-[#04060b] border-t border-slate-900/80 p-3 space-y-3 shrink-0">
              {/* Quick suggestions if messages size is low */}
              {messages.length <= 4 && (
                <div id="ai-quick-triggers-section" className="space-y-1.5 pb-1">
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide px-1">Guiding Shortcuts:</p>
                  <div className="grid grid-cols-1 gap-1 max-h-[140px] overflow-y-auto">
                    {quickPrompts.map((p) => (
                      <button
                        id={p.id}
                        key={p.id}
                        type="button"
                        onClick={() => handleSendMessage(p.query)}
                        disabled={isLoading}
                        className="text-left w-full p-2 bg-slate-950/80 hover:bg-slate-900 hover:border-indigo-500/30 border border-slate-900 rounded-lg text-2xs font-sans text-slate-300 flex items-center justify-between group transition-all cursor-pointer disabled:opacity-55"
                      >
                        <span className="truncate pr-2 font-medium">{p.label}</span>
                        <ArrowRight className="h-3 w-3 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form container */}
              <form
                id="ai-helper-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-slate-950 rounded-xl px-3 py-2 border border-slate-900 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all"
              >
                <input
                  id="ai-helper-chat-input"
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={isLoading}
                  placeholder={`Ask regarding ${selectedAsset} or setup guides...`}
                  className="flex-1 bg-transparent border-none text-2xs text-white placeholder-slate-600 focus:outline-none focus:ring-0 disabled:opacity-60"
                  autoComplete="off"
                />
                
                <button
                  id="ai-helper-chat-submit"
                  type="submit"
                  disabled={!inputVal.trim() || isLoading}
                  className="h-7 w-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-700 hover:scale-105 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
              
              <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono px-1">
                <span>⚡ Sandbox Protected</span>
                <span>Gemini Guidance</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
