/**
 * Core calculation types for the trade planning calculator
 */

export interface TradeInputs {
  accountSize: number;
  riskPercent: number;
  entryPrice: number;
  stopPrice: number;
  targetPrice?: number;
  entryBufferCents?: number; // Buffer for limit order (cents)
  trailingStopAmount?: number; // Trailing stop amount (dollars)
}

export interface TradeCalculation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  
  // Risk calculations
  riskPerUnit: number;
  maxDollarRisk: number;
  positionSize: number;
  
  // Direction
  direction: 'long' | 'short' | 'unknown';
  
  // Reward calculations (if target provided)
  rewardPerUnit?: number;
  totalReward?: number;
  rMultiple?: number;
  
  // Display values
  totalCost: number;
  dollarRisk: number;
  breakeven: number;
  
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
