import React from 'react';
import { Database, Server, Settings, Code, Sparkles, Building2 } from 'lucide-react';
import { ApiConfig } from '../types';

interface HeaderProps {
  apiConfig: ApiConfig;
  isSimulated: boolean;
  totalLoaded: number;
  areaUnit: 'sqft' | 'sqm';
  onToggleUnit: () => void;
  onOpenConfig: () => void;
  onOpenDocs: () => void;
  onLoadSimulator: () => void;
  onClearData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiConfig,
  isSimulated,
  totalLoaded,
  areaUnit,
  onToggleUnit,
  onOpenConfig,
  onOpenDocs,
  onLoadSimulator,
  onClearData,
}) => {
  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                  Singapore Private Property Prices
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  SG Real Estate
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Residential Transaction Valuations • API Integration Ready
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Backend status pill */}
            <button
              id="header-api-status-btn"
              type="button"
              onClick={onOpenConfig}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                totalLoaded > 0
                  ? isSimulated
                    ? 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/40'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-stone-800/70 border-stone-700/70 text-amber-300 hover:bg-stone-800 hover:border-amber-700/60'
              }`}
              title="Click to configure API connection"
            >
              <span className="relative flex h-2 w-2">
                {totalLoaded > 0 ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  </>
                )}
              </span>
              <span className="truncate max-w-[170px] sm:max-w-none">
                {totalLoaded > 0
                  ? isSimulated
                    ? `Sandbox Preview (${totalLoaded} records)`
                    : `Live Backend (${totalLoaded} records)`
                  : 'API: Awaiting Connection'}
              </span>
              <Settings className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
            </button>

            {/* Sqft / Sqm Unit Switcher */}
            <button
              id="header-unit-toggle-btn"
              type="button"
              onClick={onToggleUnit}
              className="px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-700 text-xs font-mono transition-colors"
              title="Toggle measurement unit"
            >
              Unit: <strong className="text-amber-400">{areaUnit.toUpperCase()}</strong>
            </button>

            {/* Quick API Playground / Docs Button */}
            <button
              id="header-open-docs-btn"
              type="button"
              onClick={onOpenDocs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>API Schema</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
