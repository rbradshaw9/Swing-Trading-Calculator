/**
 * Pure calculation functions for swing trade planning.
 * All functions are side-effect free and deterministic.
 * Uses ATR-based calculations for stop, target, and trailing stop.
 */

import type { TradeInputs, TradeCalculation, ValidationResult, TOSOrderTicket } from './types';

/**
 * Validates trade inputs for logical consistency
 */
export function validateTradeInputs(inputs: TradeInputs): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Account validation
  if (inputs.accountSize <= 0) {
    errors.push('Account size must be greater than zero');
  }

  // Risk percent validation
  if (inputs.riskPercent <= 0) {
    errors.push('Risk percent must be greater than zero');
  } else if (inputs.riskPercent > 5) {
    warnings.push('Risk exceeds 5% per trade - consider reducing');
  } else if (inputs.riskPercent > 2) {
    warnings.push('Risk exceeds 2% per trade - high risk level');
  }

  // Entry price validation
  if (inputs.entryPrice <= 0) {
    errors.push('Entry price must be greater than zero');
  }

  // ATR validation
  if (inputs.atr <= 0) {
    errors.push('ATR must be greater than zero');
  }

  // Multiple validations
  if (inputs.stopMultiple <= 0) {
    errors.push('Stop multiple must be greater than zero');
  }
  
  if (inputs.targetRMultiple <= 0) {
    errors.push('Target R-multiple must be greater than zero');
  } else if (inputs.targetRMultiple < 1) {
    warnings.push('Target R-multiple below 1:1 - reward less than risk');
  } else if (inputs.targetRMultiple < 2) {
    warnings.push('Target R-multiple below 2:1 - consider better setups');
  }

  if (inputs.trailingMultiple < 0) {
    errors.push('Trailing multiple cannot be negative');
  }

  // Entry buffer validation
  if (inputs.entryBufferDollars < 0) {
    errors.push('Entry buffer cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculates stop loss price based on ATR and direction
 */
export function calculateStopPrice(
  entryPrice: number,
  atr: number,
  stopMultiple: number,
  direction: 'long' | 'short'
): { stopPrice: number; stopDistance: number } {
  const stopDistance = atr * stopMultiple;
  
  let stopPrice: number;
  if (direction === 'long') {
    stopPrice = entryPrice - stopDistance;
  } else {
    stopPrice = entryPrice + stopDistance;
  }
  
  return { stopPrice, stopDistance };
}

/**
 * Calculates target price based on risk per share and R-multiple
 */
export function calculateTargetPrice(
  entryPrice: number,
  riskPerShare: number,
  targetRMultiple: number,
  direction: 'long' | 'short'
): { targetPrice: number; targetDistance: number } {
  const targetDistance = riskPerShare * targetRMultiple;
  
  let targetPrice: number;
  if (direction === 'long') {
    targetPrice = entryPrice + targetDistance;
  } else {
    targetPrice = entryPrice - targetDistance;
  }
  
  return { targetPrice, targetDistance };
}

/**
 * Calculates maximum dollar amount to risk on this trade
 */
export function calculateMaxDollarRisk(
  accountSize: number,
  riskPercent: number
): number {
  return (accountSize * riskPercent) / 100;
}

/**
 * Calculates position size (number of shares)
 */
export function calculatePositionSize(
  maxDollarRisk: number,
  riskPerShare: number
): number {
  if (riskPerShare === 0) return 0;
  return Math.floor(maxDollarRisk / riskPerShare);
}

/**
 * Calculates trailing stop amount from ATR
 */
export function calculateTrailingAmount(
  atr: number,
  trailingMultiple: number
): number {
  return atr * trailingMultiple;
}

/**
 * Calculates Thinkorswim order ticket values
 */
export function calculateTOSOrder(
  entryPrice: number,
  stopPrice: number,
  targetPrice: number,
  positionSize: number,
  direction: 'long' | 'short',
  entryBufferDollars: number,
  trailingAmount: number
): TOSOrderTicket {
  // Calculate entry order values
  const entryStopPrice = entryPrice;
  let entryLimitPrice: number;

  if (direction === 'long') {
    // Long: limit price is ABOVE stop (add buffer)
    entryLimitPrice = entryStopPrice + entryBufferDollars;
  } else {
    // Short: limit price is BELOW stop (subtract buffer)
    entryLimitPrice = entryStopPrice - entryBufferDollars;
  }

  // Calculate trailing stop amount with proper sign
  let tosTrailingAmount: number;
  if (direction === 'long') {
    // Long: trailing stop uses NEGATIVE value
    tosTrailingAmount = -Math.abs(trailingAmount);
  } else {
    // Short: trailing stop uses POSITIVE value
    tosTrailingAmount = Math.abs(trailingAmount);
  }

  const order: TOSOrderTicket = {
    entryType: direction === 'long' ? 'BUY STOP LIMIT' : 'SELL STOP LIMIT',
    entryStopPrice,
    entryLimitPrice,
    quantity: positionSize,
    profitTargetType: direction === 'long' ? 'SELL LIMIT' : 'BUY LIMIT',
    profitTargetPrice: targetPrice,
    trailingStopType: direction === 'long' ? 'SELL TRAILSTOP' : 'BUY TRAILSTOP',
    trailingStopMark: 'MARK',
    trailingStopAmount: tosTrailingAmount,
    advancedOrder: '1st Triggers OCO',
  };

  return order;
}

/**
 * Main calculation function - computes all trade metrics from ATR-based inputs
 */
export function calculateTrade(inputs: TradeInputs): TradeCalculation {
  // Initial validation
  const validation = validateTradeInputs(inputs);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors,
      warnings: validation.warnings,
      direction: inputs.direction,
      entryPrice: inputs.entryPrice,
      stopPrice: 0,
      targetPrice: 0,
      stopDistance: 0,
      riskPerShare: 0,
      maxDollarRisk: 0,
      positionSize: 0,
      targetDistance: 0,
      totalReward: 0,
      rMultiple: inputs.targetRMultiple,
      totalCost: 0,
      dollarRisk: 0,
      trailingAmount: 0,
    };
  }

  // Calculate stop price from ATR
  const { stopPrice, stopDistance } = calculateStopPrice(
    inputs.entryPrice,
    inputs.atr,
    inputs.stopMultiple,
    inputs.direction
  );

  // Calculate risk per share
  const riskPerShare = Math.abs(inputs.entryPrice - stopPrice);

  // Calculate position sizing
  const maxDollarRisk = calculateMaxDollarRisk(
    inputs.accountSize,
    inputs.riskPercent
  );
  const positionSize = calculatePositionSize(maxDollarRisk, riskPerShare);

  // Warnings for position size
  const warnings = [...validation.warnings];
  if (positionSize === 0) {
    warnings.push('Position size rounds to zero - risk per share too large');
  }

  // Calculate target price from R-multiple
  const { targetPrice, targetDistance } = calculateTargetPrice(
    inputs.entryPrice,
    riskPerShare,
    inputs.targetRMultiple,
    inputs.direction
  );

  // Calculate rewards
  const totalReward = positionSize * targetDistance;

  // Calculate actual dollar amounts
  const totalCost = positionSize * inputs.entryPrice;
  const dollarRisk = positionSize * riskPerShare;

  // Calculate trailing stop amount
  const trailingAmount = calculateTrailingAmount(
    inputs.atr,
    inputs.trailingMultiple
  );

  // Build result
  const result: TradeCalculation = {
    isValid: true,
    errors: [],
    warnings,
    direction: inputs.direction,
    entryPrice: inputs.entryPrice,
    stopPrice,
    targetPrice,
    stopDistance,
    riskPerShare,
    maxDollarRisk,
    positionSize,
    targetDistance,
    totalReward,
    rMultiple: inputs.targetRMultiple,
    totalCost,
    dollarRisk,
    trailingAmount,
  };

  // Calculate TOS order ticket
  if (positionSize > 0) {
    const tosOrder = calculateTOSOrder(
      inputs.entryPrice,
      stopPrice,
      targetPrice,
      positionSize,
      inputs.direction,
      inputs.entryBufferDollars,
      trailingAmount
    );
    result.tosOrder = tosOrder;
  }

  return result;
}
