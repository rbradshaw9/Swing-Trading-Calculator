'use client';

import { useState, useMemo } from 'react';
import { calculateTrade } from '@/lib/calculations';
import type { TradeInputs } from '@/lib/types';
import TradeResults from '@/components/TradeResults';
import TOSOrderDisplay from '@/components/TOSOrderDisplay';

export default function TradeCalculator() {
  const [accountSize, setAccountSize] = useState<string>('10000');
  const [riskPercent, setRiskPercent] = useState<string>('1');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopPrice, setStopPrice] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [entryBufferCents, setEntryBufferCents] = useState<string>('5');
  const [trailingStopAmount, setTrailingStopAmount] = useState<string>('');

  // Parse inputs and calculate trade
  const calculation = useMemo(() => {
    const inputs: TradeInputs = {
      accountSize: parseFloat(accountSize) || 0,
      riskPercent: parseFloat(riskPercent) || 0,
      entryPrice: parseFloat(entryPrice) || 0,
      stopPrice: parseFloat(stopPrice) || 0,
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      entryBufferCents: entryBufferCents ? parseFloat(entryBufferCents) : 0,
      trailingStopAmount: trailingStopAmount ? parseFloat(trailingStopAmount) : 0,
    };

    return calculateTrade(inputs);
  }, [accountSize, riskPercent, entryPrice, stopPrice, targetPrice, entryBufferCents, trailingStopAmount]);

  const hasRequiredInputs = entryPrice && stopPrice && accountSize && riskPercent;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Account Settings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Account Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="accountSize"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Account Size ($)
            </label>
            <input
              id="accountSize"
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10000"
              step="100"
              min="0"
            />
          </div>

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
              placeholder="1"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
        </div>
      </section>

      {/* Trade Structure */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Trade Structure
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="entryPrice"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Entry Price
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
              htmlFor="stopPrice"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Invalidation (Stop)
            </label>
            <input
              id="stopPrice"
              type="number"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="48.00"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label
              htmlFor="targetPrice"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Target (Optional)
            </label>
            <input
              id="targetPrice"
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="56.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          All prices are manually entered based on chart structure.
        </p>
      </section>

      {/* TOS Order Settings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Order Entry Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="entryBufferCents"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Entry Limit Buffer (cents)
            </label>
            <input
              id="entryBufferCents"
              type="number"
              value={entryBufferCents}
              onChange={(e) => setEntryBufferCents(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
              step="1"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Long: adds to stop | Short: subtracts from stop
            </p>
          </div>

          <div>
            <label
              htmlFor="trailingStopAmount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Trailing Stop Amount ($)
            </label>
            <input
              id="trailingStopAmount"
              type="number"
              value={trailingStopAmount}
              onChange={(e) => setTrailingStopAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.50"
              step="0.01"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Optional: Trail stop for position management
            </p>
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
