import TradeCalculator from "@/components/TradeCalculator";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Swing Trading Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Risk-first trade planning • No signals • No predictions
          </p>
        </header>
        
        <TradeCalculator />
        
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-500">
          <p>
            This calculator validates risk and position sizing based on your manual entries.
          </p>
          <p className="mt-1">
            It does not generate trade signals or predict price movement.
          </p>
        </footer>
      </div>
    </main>
  );
}
