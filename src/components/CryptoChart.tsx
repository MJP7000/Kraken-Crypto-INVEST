import React, { useState } from 'react';
import { OHLCPoint, CryptoAsset } from '../types';
import { TrendingUp, TrendingDown, Layers, ChartColumn } from 'lucide-react';

interface CryptoChartProps {
  asset: CryptoAsset;
  candles: OHLCPoint[];
  currentPrice: number;
  predictedTarget?: number;
  confidence?: number;
  signal?: string;
  selectedAssetTheme: { primary: string; secondary: string; symbol: string };
}

export default function CryptoChart({
  asset,
  candles,
  currentPrice,
  predictedTarget,
  confidence,
  signal,
  selectedAssetTheme,
}: CryptoChartProps) {
  const [chartMode, setChartMode] = useState<'line' | 'technical'>('line');
  const [indicatorView, setIndicatorView] = useState<'rsi' | 'macd'>('rsi');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!candles || candles.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#22c55e] border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-slate-400">Syncing live Kraken historical records...</p>
        </div>
      </div>
    );
  }

  // Calculate coordinates for SVG rendering safely
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = 720;
  const chartHeight = 240;

  const closes = candles.map((c) => c.close);
  const minPrice = Math.min(...closes, predictedTarget || currentPrice) * 0.99;
  const maxPrice = Math.max(...closes, predictedTarget || currentPrice) * 1.01;
  const priceRange = maxPrice - minPrice;

  // Converts chart coordinates to pixel dimensions
  const getX = (index: number) => {
    return paddingX + (index * (chartWidth - paddingX * 2)) / (candles.length - 1);
  };

  const getY = (price: number) => {
    if (priceRange === 0) return chartHeight / 2;
    return chartHeight - paddingY - ((price - minPrice) / priceRange) * (chartHeight - paddingY * 2);
  };

  // Generate SVG paths
  const linePath = candles
    .map((candle, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(candle.close)}`)
    .join(' ');

  const areaPath = `${linePath} L ${getX(candles.length - 1)} ${chartHeight - paddingY} L ${getX(0)} ${chartHeight - paddingY} Z`;

  // Moving averages SVGs paths
  const sma20Path = chartMode === 'technical'
    ? candles
        .map((c, i) => c.sma20 ? `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(c.sma20)}` : '')
        .filter(Boolean)
        .join(' ')
    : '';

  const sma50Path = chartMode === 'technical'
    ? candles
        .map((c, i) => c.sma50 ? `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(c.sma50)}` : '')
        .filter(Boolean)
        .join(' ')
    : '';

  // Forecast visual positioning
  const lastIndex = candles.length - 1;
  const lastX = getX(lastIndex);
  const lastY = getY(currentPrice);

  const forecastX = lastX + 60;
  const forecastY = predictedTarget ? getY(predictedTarget) : lastY;
  const isUpwardForecast = predictedTarget && predictedTarget > currentPrice;

  // Ticker indicator calculations (RSI, MACD) sub-chart setup (height 80px)
  const indicatorHeight = 70;
  const getIndicatorY = (value: number, min: number, max: number) => {
    const range = max - min;
    if (range === 0) return indicatorHeight / 2;
    return indicatorHeight - 5 - ((value - min) / range) * (indicatorHeight - 10);
  };

  const getRsiY = (value: number) => getIndicatorY(value, 0, 100);

  // Generate RSI Path
  const rsiPath = candles
    .map((c, i) => c.rsi ? `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getRsiY(c.rsi)}` : '')
    .filter(Boolean)
    .join(' ');

  // Get index point for dynamic hover calculations
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const itemWidth = (chartWidth - paddingX * 2) / (candles.length - 1);
    const index = Math.round((x - paddingX) / itemWidth);
    if (index >= 0 && index < candles.length) {
      setHoverIndex(index);
    }
  };

  const hoveredCandle = hoverIndex !== null ? candles[hoverIndex] : null;

  return (
    <div id="crypto-chart-container" className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-md">
      {/* Chart Headers */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${selectedAssetTheme.primary}`}></span>
            <h3 className="text-lg font-semibold tracking-tight">Interactive Price Chart: {asset}/USD</h3>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-2xs font-bold text-slate-300">Live Kraken Stream</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Over the last 60 periods • Hover to inspect point calculations and Indicators
          </p>
        </div>

        {/* View Switches */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-950 p-1 self-start sm:self-auto">
          <button
            id="chart-mode-line-btn"
            onClick={() => setChartMode('line')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              chartMode === 'line' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ChartColumn className="h-3.5 w-3.5" />
            Basic Chart
          </button>
          <button
            id="chart-mode-tech-btn"
            onClick={() => setChartMode('technical')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              chartMode === 'technical' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Tech Indicators
          </button>
        </div>
      </div>

      {/* Dynamic Hover Details Panel */}
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-950/40 p-3 text-xs sm:grid-cols-5">
        <div>
          <span className="text-slate-400 block mb-0.5">Time Period:</span>
          <span className="font-mono font-medium text-slate-200">
            {hoveredCandle ? hoveredCandle.time : candles[lastIndex].time}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Closing Price / Price Out:</span>
          <span className="font-mono font-semibold text-slate-100 block">
            ${hoveredCandle ? hoveredCandle.close.toLocaleString() : currentPrice.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">SMA (20 / 50):</span>
          <span className="font-mono font-medium text-slate-300 block">
            {hoveredCandle
              ? `${hoveredCandle.sma20 || '—'} / ${hoveredCandle.sma50 || '—'}`
              : `${candles[lastIndex].sma20 || '—'} / ${candles[lastIndex].sma50 || '—'}`}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">RSI Score:</span>
          <span
            className={`font-mono font-semibold block ${
              (hoveredCandle?.rsi || 50) > 70
                ? 'text-red-400'
                : (hoveredCandle?.rsi || 50) < 30
                ? 'text-emerald-400'
                : 'text-slate-300'
            }`}
          >
            {hoveredCandle ? hoveredCandle.rsi : candles[lastIndex].rsi || '50.00'}
            <span className="text-2xs font-normal text-slate-500 ml-1">
              {(hoveredCandle?.rsi || 50) > 70 ? '(Overbought)' : (hoveredCandle?.rsi || 50) < 30 ? '(Oversold)' : '(Neutral)'}
            </span>
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-slate-400 block mb-0.5">Forecast Target (24h):</span>
          <span
            className={`font-mono font-bold flex items-center gap-1 ${
              isUpwardForecast ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isUpwardForecast ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            ${predictedTarget ? predictedTarget.toLocaleString() : 'Analyzing...'}
          </span>
        </div>
      </div>

      {/* Main SVG Plot */}
      <div className="relative overflow-x-auto overflow-y-hidden">
        <svg
          id="crypto-svg-canvas"
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Defined Gradients */}
          <defs>
            <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="predictiveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor={isUpwardForecast ? '#22c55e' : '#f43f5e'} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line x1={paddingX} y1={getY(minPrice)} x2={chartWidth - paddingX} y2={getY(minPrice)} stroke="#1e293b" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={paddingX} y1={getY((maxPrice + minPrice) / 2)} x2={chartWidth - paddingX} y2={getY((maxPrice + minPrice) / 2)} stroke="#1e293b" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={paddingX} y1={getY(maxPrice)} x2={chartWidth - paddingX} y2={getY(maxPrice)} stroke="#1e293b" strokeWidth={1} strokeDasharray="3 3" />

          {/* Area under line */}
          <path d={areaPath} fill="url(#areaGlow)" />

          {/* Price Line */}
          <path d={linePath} fill="none" stroke="url(#predictiveGradient)" strokeWidth={2.5} />

          {/* Moving Averages Overlay */}
          {chartMode === 'technical' && (
            <>
              <path d={sma20Path} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.8} strokeDasharray="2 1" />
              <path d={sma50Path} fill="none" stroke="#a855f7" strokeWidth={1.5} opacity={0.8} strokeDasharray="5 2" />
            </>
          )}

          {/* Gemini AI Predictive Projected Line representation */}
          {predictedTarget && (
            <>
              {/* Forecast Connection */}
              <line
                x1={lastX}
                y1={lastY}
                x2={forecastX}
                y2={forecastY}
                stroke={isUpwardForecast ? '#10b981' : '#f43f5e'}
                strokeWidth={3}
                strokeDasharray="4 3"
                className="animate-pulse"
              />
              {/* Predicted Price Point Marker */}
              <circle cx={forecastX} cy={forecastY} r={6} fill={isUpwardForecast ? '#10b981' : '#f43f5e'} />
              <circle cx={forecastX} cy={forecastY} r={12} fill="none" stroke={isUpwardForecast ? '#10b981' : '#f43f5e'} strokeWidth={1.5} strokeOpacity={0.6} className="animate-ping" />
              {/* Target tag */}
              <text x={forecastX + 10} y={forecastY + 4} fill="#94a3b8" className="text-3xs font-mono select-none">
                AI Target: ${predictedTarget.toLocaleString()}
              </text>
            </>
          )}

          {/* Crosshair details on hovered position */}
          {hoverIndex !== null && hoveredCandle && (
            <>
              <line x1={getX(hoverIndex)} y1={paddingY} x2={getX(hoverIndex)} y2={chartHeight - paddingY} stroke="#475569" strokeWidth={1.5} strokeDasharray="1 1" />
              <circle cx={getX(hoverIndex)} cy={getY(hoveredCandle.close)} r={5} fill={selectedAssetTheme.secondary} />
            </>
          )}
        </svg>
      </div>

      {/* Secondary technical plots for RSI and MACD */}
      {chartMode === 'technical' && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              Oscillating Indicators Area
            </h4>
            <div className="flex bg-slate-950 p-0.5 rounded-lg text-2xs font-semibold">
              <button
                onClick={() => setIndicatorView('rsi')}
                className={`px-2 py-1 rounded-md transition-all ${
                  indicatorView === 'rsi' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                RSI (14)
              </button>
              <button
                onClick={() => setIndicatorView('macd')}
                className={`px-2 py-1 rounded-md transition-all ${
                  indicatorView === 'macd' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                MACD Hist
              </button>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60">
            {indicatorView === 'rsi' ? (
              <svg width="100%" height={indicatorHeight} viewBox={`0 0 ${chartWidth} ${indicatorHeight}`} className="overflow-visible">
                {/* Reference bounds lines (30 oversold, 70 overbought) */}
                <line x1={paddingX} y1={getRsiY(70)} x2={chartWidth - paddingX} y2={getRsiY(70)} stroke="#f43f5e" strokeWidth={1} strokeOpacity={0.4} strokeDasharray="3 3" />
                <line x1={paddingX} y1={getRsiY(30)} x2={chartWidth - paddingX} y2={getRsiY(30)} stroke="#10b981" strokeWidth={1} strokeOpacity={0.4} strokeDasharray="3 3" />
                <path d={rsiPath} fill="none" stroke="#6366f1" strokeWidth={1.5} />
                <text x={chartWidth - paddingX + 5} y={getRsiY(70) + 3} fill="#ef4444" className="text-4xs font-mono select-none">OB 70</text>
                <text x={chartWidth - paddingX + 5} y={getRsiY(30) + 3} fill="#10b981" className="text-4xs font-mono select-none">OS 30</text>
              </svg>
            ) : (
              <div className="flex h-12 items-center justify-between text-xs px-4">
                <div className="text-slate-400">
                  MACD Status: <span className="text-[#3b82f6] font-mono">12, 26, 9</span>
                </div>
                <div>
                  Latest Histogram:
                  <span
                    className={`font-mono font-bold ml-1 ${
                      (candles[lastIndex].macdh || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {candles[lastIndex].macdh || '0.00'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
