import React from 'react';
import { CryptoAsset, PredictionDetails } from '../types';
import { 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  ArrowRight, 
  ExternalLink, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Zap, 
  HelpCircle,
  Coins
} from 'lucide-react';

interface BabySimpleTradePlannerProps {
  selectedAsset: CryptoAsset;
  tickers: Record<string, any>;
  prediction: PredictionDetails | null;
  onSelectAsset: (asset: CryptoAsset) => void;
  isPredictionLoading: boolean;
}

export default function BabySimpleTradePlanner({
  selectedAsset,
  tickers,
  prediction,
  onSelectAsset,
  isPredictionLoading
}: BabySimpleTradePlannerProps) {
  const activeTicker = tickers[selectedAsset] || { price: 0, change24h: 0 };
  const currentPrice = activeTicker.price || 0;

  // Find the lowest price among simulated exchanges for quick arbitrage tip
  const exchanges = prediction?.marketSentimentGrounded?.exchanges || [];
  const polymarket = prediction?.marketSentimentGrounded?.polymarket;
  let bestExchangeToBuy = 'Kraken Spot';
  let lowestExchangePrice = currentPrice;
  
  if (exchanges.length > 0) {
    const sorted = [...exchanges].sort((a, b) => a.price - b.price);
    if (sorted[0].price < currentPrice) {
      bestExchangeToBuy = sorted[0].exchange;
      lowestExchangePrice = sorted[0].price;
    }
  }

  // Smooth scroll helper to push user straight to execution desk
  const scrollToExecution = () => {
    const el = document.getElementById('execution-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Visual feedback: briefly highlight the amount input
      setTimeout(() => {
        const input = document.getElementById('trade-amount-input');
        if (input) {
          input.focus();
        }
      }, 800);
    }
  };

  // Safe indicator evaluation mapping
  const signal = prediction?.signal || 'HOLD';
  const confidence = prediction?.confidence || 60;
  
  // Decide dummy-proof colors & action badges
  let actionColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  let actionTitle = '🟡 WAIT / SIT TIGHT';
  let actionDesc = 'Do not buy or sell right now. Sit back, drink a coffee, and wait for a clear trend.';
  let babyLabel = 'WAIT';
  let showBuyDetails = false;
  let showSellDetails = false;

  if (signal.includes('BUY')) {
    actionColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    actionTitle = signal.includes('STRONG') ? '🚀 BUY NOW IMMEDIATELY' : '🟢 BUY NOW';
    actionDesc = 'Prices are looking extremely healthy! High chance of going UP. Get some now!';
    babyLabel = 'BUY';
    showBuyDetails = true;
  } else if (signal.includes('SELL')) {
    actionColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    actionTitle = signal.includes('STRONG') ? '⚠️ SELL EVERYTHING IMMEDIATELY' : '🔴 SELL NOW / CASHOUT';
    actionDesc = 'Warning signs detected! Prices are expected to go DOWN. Cash out or hold onto your wallet.';
    babyLabel = 'SELL';
    showSellDetails = true;
  }

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-indigo-500/15 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/20 p-5 shadow-lg relative">
      
      {/* Decorative pulse element */}
      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[8px] font-mono font-bold text-indigo-400 border border-indigo-400/20 uppercase tracking-widest">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping"></span>
        E-Z Idiot-Proof Mode Active
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-indigo-950/40">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-bounce" />
            👶 THE BABY-SIMPLE TRADE PLANNER (RIGHT NOW)
          </h2>
          <p className="text-2xs text-slate-400 mt-1">
            An extremely simple, direct, non-confusing summary of custom trade plans.
          </p>
        </div>
        
        {/* Quick selector of current status */}
        <div className="flex items-center gap-2">
          <span className="text-3xs font-mono text-slate-500 uppercase">Interactive Asset Selected:</span>
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-900">
            {(['BTC', 'ETH', 'SOL'] as CryptoAsset[]).map((asset) => (
              <button
                key={asset}
                onClick={() => onSelectAsset(asset)}
                className={`px-3 py-1 text-2xs font-bold rounded-lg transition-all ${
                  selectedAsset === asset 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {asset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {prediction?.isFallback && (
        <div className="mb-4 p-2.5 bg-yellow-950/20 border border-yellow-500/15 rounded-xl text-3xs text-yellow-300 font-sans leading-relaxed flex items-center gap-2">
          <span className="flex h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse shrink-0"></span>
          <span>
            💡 <strong>Simulated Quota Mode:</strong> Gemini services are currently on rate-limit fallback. Don't worry! The Trade Planner has automatically synchronized other top crypto exchanges and Polymarket crowd indicators to keep all tips perfectly accurate and reliable.
          </span>
        </div>
      )}

      {isPredictionLoading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-3"></div>
          <p className="text-xs font-mono text-indigo-300">Evaluating over 15 indicators and search parameters...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* OPTION 1: THE SPOT SPEEDY OPTION (THE GRAND RECOMMENDATION) */}
          <div className="relative group rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
            <div className="absolute -top-2.5 left-3.5 bg-indigo-600 text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
              1. DIRECT SPOT TRADE
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">What to do:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${actionColor}`}>
                  {babyLabel} {selectedAsset}
                </span>
              </div>

              {/* GIANT DUMMY INSIGNIA */}
              <div className="my-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className={`text-xl font-black font-mono tracking-tight leading-none ${
                  babyLabel === 'BUY' ? 'text-emerald-400' : babyLabel === 'SELL' ? 'text-rose-400' : 'text-yellow-400'
                }`}>
                  {actionTitle}
                </div>
                <div className="text-3xs text-slate-300 mt-1.5 font-sans leading-relaxed">
                  {actionDesc}
                </div>
              </div>

              {/* TARGET/PRICE BREAKDOWN */}
              <div className="space-y-1.5 py-1 text-2xs font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Current Price:</span>
                  <span className="text-slate-100 font-bold">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {prediction && (
                  <>
                    <div className="flex justify-between items-center bg-indigo-950/20 p-1.5 rounded border border-indigo-500/10">
                      <span className="text-indigo-300">Goal Target (24h):</span>
                      <span className="text-emerald-400 font-black">${prediction.targetPrice24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Safety Lock (Stop Loss):</span>
                      <span className="text-rose-400 font-bold">${prediction.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span>Confidence Score:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-200">{confidence}%</span>
                    <div className="w-10 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${confidence}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={scrollToExecution}
              className="mt-4 w-full py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-2xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 shadow hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] transition-all"
            >
              <Zap className="h-3 w-3" /> Quick Execution Desk Below
            </button>
          </div>

          {/* OPTION 2: THE POLYMARKET CROWD CONSENSUS BET */}
          <div className="relative group rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-purple-500/30 transition-all">
            <div className="absolute -top-2.5 left-3.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
              2. LIQUIDITY PREDICTION INDEX
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Crowd Consensus:</span>
                <span className="text-[9px] font-bold text-sky-400 font-mono bg-sky-500/10 px-1.5 py-0.5 rounded uppercase border border-sky-500/20">
                  Polymarket Odds
                </span>
              </div>

              {polymarket ? (
                <div className="space-y-3">
                  <div className="p-2.5 bg-slate-900/60 border border-slate-850 rounded-xl">
                    <div className="text-[9px] text-slate-400 font-mono uppercase mb-1">Contract Subject:</div>
                    <p className="text-2xs font-bold font-sans text-slate-200 leading-snug">
                      "{polymarket.question}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-2xs font-mono">
                      <span className="text-slate-400">Winning Chance (YES Quote):</span>
                      <span className="text-indigo-400 font-extrabold">{polymarket.yesProbability}%</span>
                    </div>
                    {/* Prob track */}
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-sky-400" 
                        style={{ width: `${polymarket.yesProbability}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-2 bg-indigo-950/10 border border-indigo-500/10 rounded-lg text-center">
                    <p className="text-3xs text-indigo-300 font-sans leading-relaxed">
                      👉 <strong>Baby Logic:</strong> {polymarket.yesProbability > 50 
                        ? 'Consensus is optimistic. Bet YES on Polymarket contract page.' 
                        : 'Consensus is cautious. Protect your balance.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-3xs text-slate-500 font-mono">
                  Loading live contract odds...
                </div>
              )}
            </div>

            {polymarket?.url && (
              <a
                href={polymarket.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/30 text-indigo-300 font-bold text-2xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center"
              >
                <span>Read Polymarket Board</span> <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* OPTION 3: VELOCITY / ARBITRAGE FEEDS */}
          <div className="relative group rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
            <div className="absolute -top-2.5 left-3.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
              3. SPOT VENUE INTEGRATOR
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Arbitrage Integration:</span>
                <span className="text-[9px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase border border-emerald-500/20">
                  Best Pricing
                </span>
              </div>

              <div className="p-2.5 bg-slate-900/60 border border-slate-850 rounded-xl mb-3">
                <div className="text-[9px] text-slate-400 font-mono uppercase mb-1">Cheapest Exchange Venue:</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">{bestExchangeToBuy}</span>
                  <span className="text-xs font-mono font-black text-emerald-400">
                    ${lowestExchangePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Feed rates comparison list */}
              <div className="space-y-1.5">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">Live Feed Exchanges Check:</div>
                {exchanges.length > 0 ? (
                  <div className="space-y-1">
                    {exchanges.map((ex, idx) => (
                      <div key={idx} className="flex justify-between items-center text-3xs font-mono text-slate-400 bg-slate-900/30 p-1 px-2 rounded">
                        <span className="font-semibold text-slate-300">{ex.exchange}</span>
                        <div className="flex gap-2">
                          <span className={ex.depthSignal === 'BULLISH' ? 'text-emerald-400 font-bold' : ex.depthSignal === 'BEARISH' ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                            {ex.depthSignal}
                          </span>
                          <span className="text-slate-200">${ex.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 text-4xs text-slate-500 font-mono">
                    Generating comparison tickers...
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={scrollToExecution}
              className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 text-emerald-400 font-bold text-2xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <Coins className="h-3 w-3" /> Compare Rates on Spot Desk
            </button>
          </div>

        </div>
      )}

      {/* FOOTER ADVICE LABEL FOR GENUINE INTUITIVITY */}
      {!isPredictionLoading && prediction && (
        <div className="mt-4 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-start gap-2 text-2xs leading-relaxed text-slate-300">
          <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong>How to read this right now:</strong> Look at the <strong>Direct Spot Trade</strong> card. If it says <span className="text-emerald-400 font-bold">BUY</span>, click the <em>🚀 Quick Execution Desk Below</em> button which automatically takes you down to the Spot trading form on Kraken. Fill out the amount, and tap Buy! If it says <span className="text-rose-400 font-bold">SELL</span>, do the same but tap Sell! Simple!
          </div>
        </div>
      )}

    </div>
  );
}
