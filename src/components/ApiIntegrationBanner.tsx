import React from 'react';
import { Database, ArrowRight, Sparkles, Terminal, RefreshCw, XCircle } from 'lucide-react';

interface ApiIntegrationBannerProps {
  totalLoaded: number;
  isSimulated: boolean;
  onOpenConfig: () => void;
  onOpenDocs: () => void;
  onLoadSimulator: () => void;
  onClearData: () => void;
  onFetchLive: () => void;
  isLoading: boolean;
}

export const ApiIntegrationBanner: React.FC<ApiIntegrationBannerProps> = ({
  totalLoaded,
  isSimulated,
  onOpenConfig,
  onOpenDocs,
  onLoadSimulator,
  onClearData,
  onFetchLive,
  isLoading,
}) => {
  if (totalLoaded > 0) {
    return (
      <div className="bg-emerald-950/25 border-b border-emerald-800/30 px-4 sm:px-6 py-2.5 text-xs text-emerald-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              {isSimulated ? (
                <>
                  <strong>Sandbox Simulator Active:</strong> Rendering {totalLoaded} sample Singapore private property transactions.
                </>
              ) : (
                <>
                  <strong>Live Backend Active:</strong> Loaded {totalLoaded} private property transactions from endpoint.
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="banner-refresh-live-btn"
              type="button"
              onClick={onFetchLive}
              disabled={isLoading}
              className="hover:underline text-emerald-200 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refetch API
            </button>
            <span className="text-emerald-700">|</span>
            <button
              id="banner-clear-data-btn"
              type="button"
              onClick={onClearData}
              className="hover:underline text-stone-400 hover:text-stone-200 flex items-center gap-1 cursor-pointer"
            >
              <XCircle className="w-3 h-3" />
              Reset to Empty State (0 data)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 border-b border-stone-800 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-0.5 md:mt-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <p className="text-stone-200 font-medium">
              Backend API Placeholders Ready & Configured
            </p>
            <p className="text-stone-400 mt-0.5">
              No property data is bundled by default per specification. Wire your Singapore property backend or test the schema simulator.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="banner-open-config-btn"
            type="button"
            onClick={onOpenConfig}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium transition-colors"
          >
            Configure Backend URL
          </button>
          <button
            id="banner-open-docs-btn"
            type="button"
            onClick={onOpenDocs}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 flex items-center gap-1.5 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            Inspect Schema
          </button>
          <button
            id="banner-load-simulator-btn"
            type="button"
            onClick={onLoadSimulator}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Sample Payload
          </button>
        </div>
      </div>
    </div>
  );
};
