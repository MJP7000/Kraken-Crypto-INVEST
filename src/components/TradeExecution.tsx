import React, { useState, useEffect } from 'react';
import { CryptoAsset, WalletBalances, Order } from '../types';
import { ShieldCheck, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface TradeExecutionProps {
  asset: CryptoAsset;
  currentPrice: number;
  balances: WalletBalances;
  orders: Order[];
  onOrderCompleted: () => void;
  encryptedKeys: { krakenKey?: string; krakenSecret?: string };
  initialSide?: 'BUY' | 'SELL';
  hideHistory?: boolean;
}

export default function TradeExecution({
  asset,
  currentPrice,
  balances,
  orders,
  onOrderCompleted,
  encryptedKeys,
  initialSide = 'BUY',
  hideHistory = false,
}: TradeExecutionProps) {
  const [side, setSide] = useState<'BUY' | 'SELL'>(initialSide);
  const [type, setType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [amount, setAmount] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [execStatus, setExecStatus] = useState<{ success?: boolean; m?: string } | null>(null);

  // Auto-sync side state if initialSide changes via a quick-order click
  useEffect(() => {
    setSide(initialSide);
  }, [initialSide]);

  // Set default price value on limit selection change
  useEffect(() => {
    if (type === 'LIMIT') {
      setPrice(currentPrice.toString());
    } else {
      setPrice('');
    }
  }, [type, currentPrice, asset]);

  // Handle balance short-cuts
  const applyBalancePercentage = (percent: number) => {
    if (side === 'BUY') {
      const spendableUSD = balances.USD * percent;
      const targetRate = type === 'LIMIT' && price ? Number(price) : currentPrice;
      if (targetRate > 0) {
        setAmount((spendableUSD / targetRate).toFixed(5));
      }
    } else {
      const ownedAsset = (balances as any)[asset] || 0;
      setAmount((ownedAsset * percent).toFixed(5));
    }
  };

  const handleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExecStatus(null);
    const orderAmount = Number(amount);
    if (!orderAmount || orderAmount <= 0) {
      setExecStatus({ success: false, m: 'Please enter a valid amount' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/trade/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset,
          side,
          type,
          amount: orderAmount,
          price: type === 'LIMIT' ? Number(price) : undefined,
          clientKeyEncrypted: encryptedKeys.krakenKey,
          clientSecretEncrypted: encryptedKeys.krakenSecret,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || data.error) {
        setExecStatus({ success: false, m: data.error || 'Failed to place order' });
      } else {
        setExecStatus({ success: true, m: data.message });
        setAmount('');
        onOrderCompleted(); // trigger parent refresh on wallet & orders
        
        // Brief success flash
        setTimeout(() => {
          setExecStatus(null);
        }, 5000);
      }
    } catch (error: any) {
      setIsLoading(false);
      setExecStatus({ success: false, m: error.message || 'Network communication failure' });
    }
  };

  const currentWalletBalance = (balances as any)[asset] || 0;
  const executionPrice = type === 'LIMIT' && price ? Number(price) : currentPrice;
  const totalCost = (Number(amount) || 0) * executionPrice;
  const isRealConnected = !!encryptedKeys.krakenKey;

  return (
    <div id="execution-panel" className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-md font-semibold tracking-tight text-slate-100 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-[#3b82f6]" />
            Kraken Trade desk
          </h3>
          <p className="text-2xs text-slate-400 mt-0.5">Real-time order submission & positions</p>
        </div>

        {/* Integration status badge */}
        <div
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-2xs font-bold border ${
            isRealConnected
              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/35 text-amber-400'
          }`}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${isRealConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          {isRealConnected ? 'LIVE KRAKEN CONNECTED' : 'KEYS NEEDED'}
        </div>
      </div>

      {/* Connection warning when keys are unconfigured */}
      {!isRealConnected && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-2xs leading-relaxed text-amber-300 font-mono">
          <AlertCircle className="h-4 w-4 inline mr-1 mb-0.5 shrink-0 text-amber-400" />
          <strong>Demo offline:</strong> View and trade real account funds by adding your encrypted Kraken credentials to the API vault below. All actions execute directly on live Kraken exchange ledger securely.
        </div>
      )}

      {/* Balances Quick Bar */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-950/60 p-2 text-2xs font-mono">
        <div className="border-r border-slate-900/60 pr-2">
          <span className="text-slate-500 block">AVAILABLE FIAT:</span>
          <span className="text-emerald-400 font-bold">${balances.USD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="pl-2">
          <span className="text-slate-500 block uppercase font-bold">OWNED {asset}:</span>
          <span className="text-sky-400 font-bold">
            {currentWalletBalance.toFixed(5)} {asset}
          </span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleTradeSubmit} className="space-y-4">
        {/* Buy/Sell Side Switch */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
              side === 'BUY'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
              side === 'SELL'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SELL
          </button>
        </div>

        {/* Order Type (Market vs. Limit) */}
        <div className="flex gap-2 text-xs">
          <label className="flex flex-1 items-center gap-1.5 cursor-pointer rounded-lg border border-slate-800 bg-slate-950/40 p-2 select-none hover:border-slate-700">
            <input
              type="radio"
              name="orderType"
              checked={type === 'MARKET'}
              onChange={() => setType('MARKET')}
              className="accent-emerald-500"
            />
            <span>Market Order</span>
          </label>
          <label className="flex flex-1 items-center gap-1.5 cursor-pointer rounded-lg border border-slate-800 bg-slate-950/40 p-2 select-none hover:border-slate-700">
            <input
              type="radio"
              name="orderType"
              checked={type === 'LIMIT'}
              onChange={() => setType('LIMIT')}
              className="accent-emerald-500"
            />
            <span>Limit Price</span>
          </label>
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-2xs text-slate-400 mb-1 block uppercase">Amount to {side}:</label>
          <div className="relative">
            <input
              id="trade-amount-input"
              type="number"
              step="any"
              min="0.00001"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 pr-12 font-mono text-sm text-slate-100 outline-none focus:border-indigo-500"
            />
            <span className="absolute right-3.5 top-2.5 font-mono text-xs font-bold text-slate-500 uppercase">{asset}</span>
          </div>
        </div>

        {/* Limit Price Input if necessary */}
        {type === 'LIMIT' && (
          <div>
            <label className="text-2xs text-slate-400 mb-1 block uppercase">Limit Price (USD):</label>
            <div className="relative">
              <input
                id="trade-price-input"
                type="number"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 pr-12 font-mono text-sm text-slate-100 outline-none focus:border-indigo-500"
              />
              <span className="absolute right-3.5 top-2.5 font-mono text-xs font-bold text-slate-500">USD</span>
            </div>
          </div>
        )}

        {/* Balance shortcuts */}
        <div className="flex gap-1">
          {[0.25, 0.5, 0.75, 1.0].map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => applyBalancePercentage(percent)}
              className="flex-1 rounded-md bg-slate-950 py-1 text-4xs font-mono font-bold text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {percent * 100}%
            </button>
          ))}
        </div>

        {/* Transaction Cost Breakdown */}
        <div className="rounded-xl bg-slate-950/40 p-3 space-y-1 text-2xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">ESTIMATED PRICE:</span>
            <span className="text-slate-300">${executionPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase">TOTAL OUTPUT VALUE:</span>
            <span className="text-slate-100 font-bold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Execute Button */}
        <button
          id="execute-trade-submit"
          type="submit"
          disabled={isLoading || !isRealConnected}
          className={`w-full py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
            side === 'BUY'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {isRealConnected ? loadingText(isLoading, side) : 'CONNECT KRAKEN TO TRADE'}
        </button>
      </form>

      {/* Execution Feedback Banner */}
      {execStatus && (
        <div
          className={`mt-4 rounded-xl p-3 text-xs flex items-start gap-2.5 border ${
            execStatus.success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          {execStatus.success ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 mt-0.5 shrink-0" /> : <AlertCircle className="h-4.5 w-4.5 text-rose-400 mt-0.5 shrink-0" />}
          <div>
            <p className="font-bold">{execStatus.success ? 'Order Placed!' : 'Trade Refused'}</p>
            <p className="text-2xs mt-0.5 leading-relaxed">{execStatus.m}</p>
          </div>
        </div>
      )}

      {/* Order Log History */}
      {!hideHistory && (
        <div className="mt-6 border-t border-slate-800 pt-5">
          <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            Live Trade ledger
          </h4>

          {orders.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-slate-800/60 rounded-xl bg-slate-950/20">
              <p className="text-3xs text-slate-500">Order transaction log is empty.</p>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {orders.map((ord) => (
                <div key={ord.id} className="rounded-xl bg-slate-950/60 p-2.5 text-2xs font-mono border border-slate-900">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold uppercase ${ord.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {ord.side} {ord.type}
                    </span>
                    <span className="text-slate-500 text-3xs">{new Date(ord.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Size: {ord.amount} {ord.asset}</span>
                    <span>Rate: ${ord.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Cost: ${ord.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-4xs rounded px-1.5 py-0.5 font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      LIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function loadingText(isLoading: boolean, side: 'BUY' | 'SELL'): string {
  if (isLoading) return 'Transmitting Order...';
  return side === 'BUY' ? 'SUBMIT BUY ORDER' : 'SUBMIT SELL ORDER';
}
