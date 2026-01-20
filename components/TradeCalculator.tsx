'use client';

import { useState, useMemo, useEffect } from 'react';
import { calculateTrade } from '@/lib/calculations';
import type { TradeInputs } from '@/lib/types';
import TradeResults from '@/components/TradeResults';
import TOSOrderDisplay from '@/components/TOSOrderDisplay';

export default function TradeCalculator() {
  // Load account size from localStorage on mount
  const [accountSize, setAccountSize] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tradingAccountSize');
    setAccountSize(saved || '10000');
    setIsLoaded(true);
  }, []);

  // Save account size to localStorage when changed
  const handleAccountSizeChange = (value: string) => {
    setAccountSize(value);
    if (value && parseFloat(value) > 0) {
      localStorage.setItem('tradingAccountSize', value);
    }
  };

  // Required inputs
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [atr, setATR] = useState<string>('');
  
  // Risk tolerance
  const [useFixedDollarRisk, setUseFixedDollarRisk] = useState<boolean>(false);
  const [riskPercent, setRiskPercent] = useState<string>('1');
  const [fixedDollarRisk, setFixedDollarRisk] = useState<string>('100');
  
  // Defaults (editable)
  const [stopMultiple, setStopMultiple] = useState<string>('2');
  const [targetRMultiple, setTargetRMultiple] = useState<string>('2');
  const [trailingMultiple, setTrailingMultiple] = useState<string>('1');
  const [entryBufferDollars, setEntryBufferDollars] = useState<string>('0.05');

  // Get risk level label
  const getRiskLabel = (percent: number): { label: string; color: string } => {
    if (percent < 0.25) return { label: 'Very conservative', color: 'text-green-600 dark:text-green-400' };
    if (percent <= 1.5) return { label: 'Standard', color: 'text-blue-600 dark:text-blue-400' };
    if (percent <= 2.0) return { label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' };
    return { label: 'Aggressive', color: 'text-red-600 dark:text-red-400' };
  };

  const riskPercentNum = parseFloat(riskPercent) || 0;
  const riskLabel = getRiskLabel(riskPercentNum);

  // Calculate max dollar risk for display
  const accountSizeNum = parseFloat(accountSize) || 0;
  const maxDollarRiskDisplay = useFixedDollarRisk 
    ? parseFloat(fixedDollarRisk) || 0
    : (accountSizeNum * riskPercentNum) / 100;

  // Parse inputs and calculate trade
  const calculation = useMemo(() => {
    const inputs: TradeInputs = {
      direction,
      entryPrice: parseFloat(entryPrice) || 0,
      atr: parseFloat(atr) || 0,
      accountSize: accountSizeNum,
      useFixedDollarRisk,
      riskPercent: riskPercentNum,
      fixedDollarRisk: parseFloat(fixedDollarRisk) || 0,
      stopMultiple: parseFloat(stopMultiple) || 0,
      targetRMultiple: parseFloat(targetRMultiple) || 0,
      trailingMultiple: parseFloat(trailingMultiple) || 0,
      entryBufferDollars: parseFloat(entryBufferDollars) || 0,
    };

    return calculateTrade(inputs);
  }, [direction, entryPrice, atr, accountSizeNum, useFixedDollarRisk, riskPercentNum, fixedDollarRisk, stopMultiple, targetRMultiple, trailingMultiple, entryBufferDollars]);

  const hasRequiredInputs = entryPrice && atr && accountSize && (useFixedDollarRisk ? fixedDollarRisk : riskPercent);

  // Don't render until localStorage is loaded
  if (!isLoaded) {
    return <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Trade Direction */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Trade Direction
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setDirection('long')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              direction === 'long'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            📈 LONG
          </button>
          <button
            onClick={() => setDirection('short')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              direction === 'short'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            📉 SHORT
          </button>
        </div>
      </section>

      {/* Required Inputs */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Trade Setup
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="entryPrice"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Planned Entry Price
            </label>
            <input
              id="entryPrice"
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50.00"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label
              htmlFor="atr"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              ATR (Average True Range)
            </label>
            <input
              id="atr"
              type="number"
              value={atr}
              onChange={(e) => setATR(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1.50"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </section>

      {/* Account Settings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Account Settings
        </h2>
        <div>
          <label
            htmlFor="accountSize"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Account Size (Capital allocated to this strategy)
          </label>
          <input
            id="accountSize"
            type="number"
            value={accountSize}
            onChange={(e) => handleAccountSizeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="10000"
            step="100"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            This is the fixed capital base for your position sizing. It represents the total capital 
            allocated to this trading strategy, not necessarily your entire brokerage account.
          </p>
        </div>
      </section>

      {/* Risk Tolerance */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Risk Tolerance
        </h2>
        
        {/* Risk Method Toggle */}
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={() => setUseFixedDollarRisk(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !useFixedDollarRisk
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Percent-Based (Default)
          </button>
          <button
            onClick={() => setUseFixedDollarRisk(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              useFixedDollarRisk
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Fixed Dollar (Advanced)
          </button>
        </div>

        {!useFixedDollarRisk ? (
          <div>
            <label
              htmlFor="riskPercent"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Risk Per Trade (%)
            </label>
            <input
              id="riskPercent"
              type="number"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1.0"
              step="0.1"
              min="0"
            />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className={`font-medium ${riskLabel.color}`}>
                {riskLabel.label}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Max Dollar Risk: <span className="font-semibold text-gray-900 dark:text-gray-100">
                  ${maxDollarRiskDisplay.toFixed(2)}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div>
            <label
              htmlFor="fixedDollarRisk"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Fixed Dollar Risk Per Trade
            </label>
            <input
              id="fixedDollarRisk"
              type="number"
              value={fixedDollarRisk}
              onChange={(e) => setFixedDollarRisk(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100"
              step="10"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Advanced: Set a specific dollar amount to risk per trade
            </p>
          </div>
        )}
      </section>

      {/* ATR-Based Multiples */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          ATR-Based Multiples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="stopMultiple"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Stop Distance (× ATR)
            </label>
            <input
              id="stopMultiple"
              type="number"
              value={stopMultiple}
              onChange={(e) => setStopMultiple(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2"
              step="0.1"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Stop = Entry {direction === 'long' ? '−' : '+'} (ATR × {stopMultiple || '?'})
            </p>
          </div>

          <div>
            <label
              htmlFor="targetRMultiple"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Target R-Multiple
            </label>
            <input
              id="targetRMultiple"
              type="number"
              value={targetRMultiple}
              onChange={(e) => setTargetRMultiple(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2"
              step="0.1"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Target distance = Risk × {targetRMultiple || '?'}
            </p>
          </div>

          <div>
            <label
              htmlFor="trailingMultiple"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Trailing Stop (× ATR)
            </label>
            <input
              id="trailingMultiple"
              type="number"
              value={trailingMultiple}
              onChange={(e) => setTrailingMultiple(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
              step="0.1"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Trail amount = ATR × {trailingMultiple || '?'}
            </p>
          </div>
        </div>
      </section>

      {/* Order Execution Settings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Order Execution
        </h2>
        <div>
          <label
            htmlFor="entryBufferDollars"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Entry Limit Buffer ($)
          </label>
          <input
            id="entryBufferDollars"
            type="number"
            value={entryBufferDollars}
            onChange={(e) => setEntryBufferDollars(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.05"
            step="0.01"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {direction === 'long' 
              ? 'Long: Limit = Stop + Buffer (ensures fill above entry)'
              : 'Short: Limit = Stop − Buffer (ensures fill below entry)'}
          </p>
        </div>
      </section>

      {/* Results */}
      {hasRequiredInputs && <TradeResults calculation={calculation} />}
      
      {/* TOS Order Ticket */}
      {hasRequiredInputs && calculation.tosOrder && (
        <TOSOrderDisplay order={calculation.tosOrder} />
      )}
    </div>
  );
}
