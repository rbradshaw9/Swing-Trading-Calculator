import type { TOSOrderTicket } from '@/lib/types';

interface TOSOrderTicketProps {
  order: TOSOrderTicket;
}

export default function TOSOrderDisplay({ order }: TOSOrderTicketProps) {
  const formatPrice = (value: number): string => {
    return value.toFixed(2);
  };

  const formatTrailingAmount = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <section className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Thinkorswim Order Ticket
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Copy these values exactly into your TOS order entry
      </p>

      <div className="space-y-4">
        {/* Entry Order */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
          <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-3">
            1. ENTRY ORDER
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-red-900 dark:text-red-200">
                {order.entryType}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Stop Price (STP)</div>
                <div className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">
                  ${formatPrice(order.entryStopPrice)}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Limit Price (LMT)</div>
                <div className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">
                  ${formatPrice(order.entryLimitPrice)}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Quantity (QTY)</div>
                <div className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">
                  {order.quantity}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profit Target */}
        {order.profitTargetPrice && (
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-3">
              2. PROFIT TARGET
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-green-900 dark:text-green-200">
                  {order.profitTargetType} (Profit Target)
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Limit Price (LMT)</div>
                <div className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">
                  ${formatPrice(order.profitTargetPrice)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trailing Stop */}
        {order.trailingStopAmount !== undefined && (
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-3">
              3. TRAILING STOP
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-green-900 dark:text-green-200">
                  {order.trailingStopType} (MARK)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Trail Type</div>
                  <div className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">
                    {order.trailingStopMark}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Trail Amount (TR)</div>
                  <div className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">
                    ${formatTrailingAmount(order.trailingStopAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Order */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Advanced Order
              </h3>
              <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                {order.advancedOrder}
              </p>
            </div>
            <div className="text-2xl">🔗</div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
        <p className="font-semibold mb-1">Order Entry Notes:</p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>Entry order (red) is triggered when price hits your stop</li>
          <li>Once filled, the OCO bracket activates (green orders)</li>
          <li>Profit target and trailing stop are linked - one cancels the other</li>
          <li>All values are calculated from your manual price inputs</li>
        </ul>
      </div>
    </section>
  );
}
