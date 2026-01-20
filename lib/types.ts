/**
 * Core calculation types for the trade planning calculator
 */

export interface TradeInputs {
  // Required inputs
  direction: 'long' | 'short';
  entryPrice: number;
  atr: number;
  accountSize: number;
  riskPercent: number;
  
  // ATR-based multiples (with defaults)
  stopMultiple: number; // ATR multiple for stop distance
  targetRMultiple: number; // R-multiple for target
  trailingMultiple: number; // ATR multiple for trailing stop
  
  // Order execution settings
  entryBufferDollars: number; // Fixed dollar buffer for limit price
}

export interface TradeCalculation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  
  // Direction
  direction: 'long' | 'short';
  
  // Calculated prices
  entryPrice: number;
  stopPrice: number;
  targetPrice: number;
  
  // Risk calculations
  stopDistance: number; // ATR × stopMultiple
  riskPerShare: number; // abs(entry - stop)
  maxDollarRisk: number;
  positionSize: number;
  
  // Reward calculations
  targetDistance: number;
  totalReward: number;
  rMultiple: number;
  
  // Display values
  totalCost: number;
  dollarRisk: number;
  
  // Trailing stop
  trailingAmount: number; // ATR × trailingMultiple
  
  // Thinkorswim order ticket values
  tosOrder?: TOSOrderTicket;
}

export interface TOSOrderTicket {
  // Entry order
  entryType: 'BUY STOP LIMIT' | 'SELL STOP LIMIT';
  entryStopPrice: number;
  entryLimitPrice: number;
  quantity: number;
  
  // Profit target
  profitTargetType: 'SELL LIMIT' | 'BUY LIMIT';
  profitTargetPrice?: number;
  
  // Trailing stop
  trailingStopType: 'SELL TRAILSTOP' | 'BUY TRAILSTOP';
  trailingStopMark: 'MARK';
  trailingStopAmount?: number; // Signed value (negative for long, positive for short)
  
  // OCO structure
  advancedOrder: '1st Triggers OCO';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
