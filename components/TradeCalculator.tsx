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

  // Required inputs only
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [atr, setATR] = useState<string>('');
  const [riskPercent, setRiskPercent] = useState<string>('1');
  
  // Fixed defaults (not editable by user)
  const DEFAULTS = {
    entryBufferDollars: 0.15,
    stopMultiple: 2.0,
    targetRMultiple: 2.0,
    trailingMultiple: 0.5,
  };

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
  const maxDollarRiskDisplay = (accountSizeNum * riskPercentNum) / 100;

  // Parse inputs and calculate trade
  const calculation = useMemo(() => {
    const inputs: TradeInputs = {
      direction,
      entryPrice: parseFloat(entryPrice) || 0,
      atr: parseFloat(atr) || 0,
      accountSize: accountSizeNum,
      useFixedDollarRisk: false,
      riskPercent: riskPercentNum,
      fixedDollarRisk: 0,
      stopMultiple: DEFAULTS.stopMultiple,
      targetRMultiple: DEFAULTS.targetRMultiple,
      trailingMultiple: DEFAULTS.trailingMultiple,
      entryBufferDollars: DEFAULTS.entryBufferDollars,
    };

    return calculateTrade(inputs);
  }, [direction, entryPrice, atr, accountSizeNum, riskPercentNum]);

  const hasRequiredInputs = entryPrice && atr && accountSize && riskPercent;

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
      </section>

      {/* Default Rules Display */}
      <section className="mb-8">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Using Default Rules
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-medium">Entry Buffer:</span> $0.15
            </div>
            <div>
              <span className="font-medium">Stop:</span> 2.0 × ATR
            </div>
            <div>
              <span className="font-medium">Target:</span> 2.0R
            </div>
            <div>
              <span className="font-medium">Trail:</span> 0.5 × ATR
            </div>
          </div>
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
