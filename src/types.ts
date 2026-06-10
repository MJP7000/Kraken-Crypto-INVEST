export type CryptoAsset = 'BTC' | 'ETH' | 'SOL';

export type TradeSignal = 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL';

export interface OHLCPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Technical Indicators
  sma20?: number;
  sma50?: number;
  rsi?: number;
  macdh?: number; // MACD Histogram
  isPrediction?: boolean; // True if calculated as forecast
}

export interface SentimentData {
  score: number; // 0 to 100
  label: string; // e.g., "Extreme Greed", "Fear"
  newsSummary: string; // Grounded analysis summary
  sources: Array<{ name: string; url: string }>;
  socialSentimentRatio: number; // 0 to 1 (e.g. 0.65 positive)
  lastUpdated: string;
}

export interface PredictionDetails {
  asset: CryptoAsset;
  signal: TradeSignal;
  confidence: number; // 0 to 100%
  currentPrice: number;
  targetPrice24h: number;
  stopLoss: number;
  takeProfit: number;
  summary: string;
  sentiment?: {
    score: number;
    label: string;
    socialSentimentRatio: number;
  };
  sources?: Array<{ name: string; url: string }>;
  indicators: {
    rsiValue: number;
    macdStatus: 'bullish' | 'bearish' | 'neutral';
    trendStatus: 'strong_up' | 'moderate_up' | 'sideways' | 'moderate_down' | 'strong_down';
  };
  marketSentimentGrounded?: {
    polymarket?: {
      question: string;
      yesProbability: number;
      confidenceBoost: number;
      url?: string;
    };
    exchanges?: Array<{
      exchange: string;
      price: number;
      depthSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
      sentimentWeight: number;
    }>;
  };
  generatedAt?: string;
  isFallback?: boolean;
  fallbackReason?: string;
}

export interface APIKeys {
  krakenKey?: string;
  krakenSecret?: string;
  coinbaseKey?: string;
  coinbaseSecret?: string;
  passphrase?: string; // Opt to salt/encrypt client-side or server-side
}

export interface Order {
  id: string;
  asset: CryptoAsset;
  pair: string;
  type: 'MARKET' | 'LIMIT';
  side: 'BUY' | 'SELL';
  price?: number;
  amount: number;
  total: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'FAILED';
  isSandbox: boolean;
  timestamp: string;
  errorMessage?: string;
}

export interface PriceAlert {
  id: string;
  asset: CryptoAsset;
  triggerPrice: number;
  condition: 'ABOVE' | 'BELOW';
  triggered: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface WalletBalances {
  USD: number;
  BTC: number;
  ETH: number;
  SOL: number;
}
