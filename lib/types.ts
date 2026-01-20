/**
 * Core calculation types for the trade planning calculator
 */

export interface TradeInputs {
  accountSize: number;
  riskPercent: number;
  entryPrice: number;
  stopPrice: number;
  targetPrice?: number;
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
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
