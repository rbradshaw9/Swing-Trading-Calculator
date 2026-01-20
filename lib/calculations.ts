/**
 * Pure calculation functions for swing trade planning.
 * All functions are side-effect free and deterministic.
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

  // Price validation
  if (inputs.entryPrice <= 0) {
    errors.push('Entry price must be greater than zero');
  }
  if (inputs.stopPrice <= 0) {
    errors.push('Stop price must be greater than zero');
  }

  // Entry vs Stop logic
  if (inputs.entryPrice === inputs.stopPrice) {
    errors.push('Entry and stop prices cannot be equal');
  }

  // Target validation (if provided)
  if (inputs.targetPrice !== undefined) {
    if (inputs.targetPrice <= 0) {
      errors.push('Target price must be greater than zero');
    }
    if (inputs.targetPrice === inputs.entryPrice) {
      errors.push('Target and entry prices cannot be equal');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Determines trade direction based on entry and stop
 */
export function getTradeDirection(
  entryPrice: number,
  stopPrice: number
): 'long' | 'short' | 'unknown' {
  if (entryPrice > stopPrice) return 'long';
  if (entryPrice < stopPrice) return 'short';
  return 'unknown';
}

/**
 * Calculates risk per unit (price distance from entry to stop)
 */
export function calculateRiskPerUnit(
  entryPrice: number,
  stopPrice: number
): number {
  return Math.abs(entryPrice - stopPrice);
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
 * Calculates position size (number of shares/units)
 */
export function calculatePositionSize(
  maxDollarRisk: number,
  riskPerUnit: number
): number {
  if (riskPerUnit === 0) return 0;
  return Math.floor(maxDollarRisk / riskPerUnit);
}

/**
 * Calculates reward per unit (price distance from entry to target)
 */
export function calculateRewardPerUnit(
  entryPrice: number,
  targetPrice: number,
  direction: 'long' | 'short' | 'unknown'
): number {
  if (direction === 'long') {
    return Math.max(0, targetPrice - entryPrice);
  } else if (direction === 'short') {
    return Math.max(0, entryPrice - targetPrice);
  }
  return 0;
}

/**
 * Calculates R-multiple (reward-to-risk ratio)
 */
export function calculateRMultiple(
  rewardPerUnit: number,
  riskPerUnit: number
): number {
  if (riskPerUnit === 0) return 0;
  return rewardPerUnit / riskPerUnit;
}

/**
 * Validates target price based on trade direction
 */
export function validateTarget(
  entryPrice: number,
  stopPrice: number,
  targetPrice: number,
  direction: 'long' | 'short' | 'unknown'
): { isValid: boolean; error?: string } {
  if (direction === 'long') {
    if (targetPrice <= entryPrice) {
      return {
        isValid: false,
        error: 'Long trade: Target must be above entry',
      };
    }
  } else if (direction === 'short') {
    if (targetPrice >= entryPrice) {
      return {
        isValid: false,
        error: 'Short trade: Target must be below entry',
      };
    }
  }
  return { isValid: true };
}

/**
 * Calculates Thinkorswim order ticket values
 */
export function calculateTOSOrder(
  entryPrice: number,
  stopPrice: number,
  targetPrice: number | undefined,
  positionSize: number,
  direction: 'long' | 'short' | 'unknown',
  entryBufferCents: number = 0,
  trailingStopAmount: number = 0
): TOSOrderTicket | undefined {
  if (direction === 'unknown' || positionSize === 0) {
    return undefined;
  }

  const bufferDollars = entryBufferCents / 100;

  // Calculate entry order values
  const entryStopPrice = entryPrice;
  let entryLimitPrice: number;

  if (direction === 'long') {
    // Long: limit price is ABOVE stop (add buffer)
    entryLimitPrice = entryStopPrice + bufferDollars;
  } else {
    // Short: limit price is BELOW stop (subtract buffer)
    entryLimitPrice = entryStopPrice - bufferDollars;
  }

  // Calculate trailing stop amount with proper sign
  let trailingAmount: number | undefined;
  if (trailingStopAmount > 0) {
    if (direction === 'long') {
      // Long: trailing stop uses NEGATIVE value
      trailingAmount = -Math.abs(trailingStopAmount);
    } else {
      // Short: trailing stop uses POSITIVE value
      trailingAmount = Math.abs(trailingStopAmount);
    }
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
    trailingStopAmount: trailingAmount,
    advancedOrder: '1st Triggers OCO',
  };

  return order;
}

/**
 * Main calculation function - computes all trade metrics
 */
export function calculateTrade(inputs: TradeInputs): TradeCalculation {
  // Initial validation
  const validation = validateTradeInputs(inputs);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors,
      warnings: validation.warnings,
      riskPerUnit: 0,
      maxDollarRisk: 0,
      positionSize: 0,
      direction: 'unknown',
      totalCost: 0,
      dollarRisk: 0,
      breakeven: inputs.entryPrice,
    };
  }

  // Determine trade direction
  const direction = getTradeDirection(inputs.entryPrice, inputs.stopPrice);

  // Core risk calculations
  const riskPerUnit = calculateRiskPerUnit(inputs.entryPrice, inputs.stopPrice);
  const maxDollarRisk = calculateMaxDollarRisk(
    inputs.accountSize,
    inputs.riskPercent
  );
  const positionSize = calculatePositionSize(maxDollarRisk, riskPerUnit);

  // Additional warnings
  const warnings = [...validation.warnings];
  if (positionSize === 0) {
    warnings.push('Position size rounds to zero - risk per unit too large');
  }

  // Calculate actual dollar amounts
  const totalCost = positionSize * inputs.entryPrice;
  const dollarRisk = positionSize * riskPerUnit;

  // Breakeven (entry price in this simple model)
  const breakeven = inputs.entryPrice;

  // Build base result
  const result: TradeCalculation = {
    isValid: true,
    errors: [],
    warnings,
    riskPerUnit,
    maxDollarRisk,
    positionSize,
    direction,
    totalCost,
    dollarRisk,
    breakeven,
  };

  // Calculate reward metrics if target is provided
  if (inputs.targetPrice !== undefined) {
    const targetValidation = validateTarget(
      inputs.entryPrice,
      inputs.stopPrice,
      inputs.targetPrice,
      direction
    );

    if (!targetValidation.isValid) {
      result.errors.push(targetValidation.error!);
      result.isValid = false;
    } else {
      const rewardPerUnit = calculateRewardPerUnit(
        inputs.entryPrice,
        inputs.targetPrice,
        direction
      );
      const rMultiple = calculateRMultiple(rewardPerUnit, riskPerUnit);
      const totalReward = positionSize * rewardPerUnit;

      result.rewardPerUnit = rewardPerUnit;
      result.totalReward = totalReward;
      result.rMultiple = rMultiple;

      // R-multiple quality warnings
      if (rMultiple < 1) {
        warnings.push('R-multiple below 1:1 - reward less than risk');
      } else if (rMultiple < 2) {
        warnings.push('R-multiple below 2:1 - consider better setups');
      }
    }
  }

  // Calculate TOS order ticket
  const tosOrder = calculateTOSOrder(
    inputs.entryPrice,
    inputs.stopPrice,
    inputs.targetPrice,
    positionSize,
    direction,
    inputs.entryBufferCents,
    inputs.trailingStopAmount
  );

  result.tosOrder = tosOrder;

  return result;
}
