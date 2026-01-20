import type { TradeCalculation } from '@/lib/types';

interface TradeResultsProps {
  calculation: TradeCalculation;
}

export default function TradeResults({ calculation }: TradeResultsProps) {
  const { isValid, errors, warnings, direction, positionSize, rMultiple } = calculation;

  // Determine R-multiple quality color
  const getRMultipleColor = (r?: number): string => {
    if (!r) return 'text-gray-600 dark:text-gray-400';
    if (r < 1) return 'text-red-600 dark:text-red-400';
    if (r < 2) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 0): string => {
    return value.toFixed(decimals);
  };

  return (
    <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Calculation Results
      </h2>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
            ⚠️ Invalid Trade Setup
          </h3>
          <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
            {errors.map((error, idx) => (
              <li key={idx}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            ⚠️ Warnings
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
            {warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Valid Results */}
      {isValid && (
        <>
          {/* Direction Badge */}
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                direction === 'long'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  : direction === 'short'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}
            >
              {direction === 'long' ? '📈 LONG' : direction === 'short' ? '📉 SHORT' : 'UNKNOWN'}
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Position Size */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Position Size
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(positionSize)} units
              </div>
            </div>

            {/* Dollar Risk */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Dollar Risk
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(calculation.dollarRisk)}
              </div>
            </div>

            {/* Total Cost */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Cost
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(calculation.totalCost)}
              </div>
            </div>
          </div>

          {/* Risk Details */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Risk Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Risk per unit:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(calculation.riskPerUnit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Max dollar risk:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(calculation.maxDollarRisk)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Breakeven:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(calculation.breakeven)}
                </span>
              </div>
            </div>
          </div>

          {/* Reward Metrics (if target provided) */}
          {calculation.rewardPerUnit !== undefined && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Reward Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reward per unit:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(calculation.rewardPerUnit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total reward:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(calculation.totalReward || 0)}
                  </span>
                </div>
              </div>

              {/* R-Multiple Display */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    R-Multiple (Reward:Risk)
                  </span>
                  <span className={`text-3xl font-bold ${getRMultipleColor(rMultiple)}`}>
                    {formatNumber(rMultiple || 0, 2)}R
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  {(rMultiple || 0) >= 2 ? '✓ Good risk-reward ratio' : 
                   (rMultiple || 0) >= 1 ? '⚠️ Marginal risk-reward' : 
                   '❌ Poor risk-reward ratio'}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Zero Position Size Notice */}
      {isValid && positionSize === 0 && (
        <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
          <p className="text-sm text-orange-800 dark:text-orange-300">
            <strong>Trade Not Viable:</strong> Risk per unit is too large relative to your account risk tolerance.
            Consider waiting for a better setup with a tighter stop.
          </p>
        </div>
      )}
    </section>
  );
}
