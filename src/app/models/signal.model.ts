export interface Signal {
  id: string;
  timestamp: string;

  ticker: string;
  name: string;
  instrument_type: string;   // 'index' | 'stock'

  strategy: string;
  timeframe: string;

  direction: 'BUY' | 'SELL';
  entry: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  target_3: number;
  risk_reward: number;

  gap_zone: boolean;
  range_shift: boolean;
  confluence_score: number;
  position_size: 'AGGRESSIVE' | 'NORMAL' | 'REDUCED';

  notes: string;
}

export interface SignalStats {
  total: number;
  buys: number;
  sells: number;
  aggressive: number;
}
