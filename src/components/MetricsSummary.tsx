import React from 'react';
import { DollarSign, TrendingUp, Layers, Compass, HelpCircle } from 'lucide-react';
import { PropertyTransaction } from '../types';
import { formatSGD, formatPSF, calculateSummaryMetrics } from '../utils/propertyUtils';

interface MetricsSummaryProps {
  transactions: PropertyTransaction[];
  areaUnit: 'sqft' | 'sqm';
  onOpenConfig: () => void;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({
  transactions,
  areaUnit,
  onOpenConfig,
}) => {
  const metrics = calculateSummaryMetrics(transactions);
  const hasData = transactions.length > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Metric 1: Median Price */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-400">Median Transacted Price</span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          {hasData ? (
            <>
              <div className="text-xl font-bold text-white tracking-tight">
                {formatSGD(metrics.medianPrice)}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Range: {formatSGD(metrics.minPrice)} – {formatSGD(metrics.maxPrice)}
              </p>
            </>
          ) : (
            <>
              <div className="text-xl font-semibold text-stone-500 tracking-tight flex items-center gap-2">
                <span>— SGD</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                  Placeholder
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Awaiting property transaction feed
              </p>
            </>
          )}
        </div>
      </div>

      {/* Metric 2: Median PSF / PSM */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-400">
            Median Unit Price ({areaUnit.toUpperCase()})
          </span>
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          {hasData ? (
            <>
              <div className="text-xl font-bold text-white tracking-tight">
                {formatPSF(metrics.medianPsf)}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Avg: {formatPSF(metrics.avgPsf)}
              </p>
            </>
          ) : (
            <>
              <div className="text-xl font-semibold text-stone-500 tracking-tight flex items-center gap-2">
                <span>— PSF</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                  Placeholder
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Calculated per sq ft / sq m
              </p>
            </>
          )}
        </div>
      </div>

      {/* Metric 3: Total Transaction Volume */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-400">Total Transacted Units</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          {hasData ? (
            <>
              <div className="text-xl font-bold text-white tracking-tight">
                {metrics.count.toLocaleString()}{' '}
                <span className="text-xs font-normal text-stone-400">units</span>
              </div>
              <p className="text-[11px] text-emerald-400 mt-1">
                Active dataset filtered
              </p>
            </>
          ) : (
            <>
              <div className="text-xl font-semibold text-stone-500 tracking-tight flex items-center gap-2">
                <span>0 units</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                  Empty
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Zero data loaded as of now
              </p>
            </>
          )}
        </div>
      </div>

      {/* Metric 4: Singapore Market Segments */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-400">Market Segment Distribution</span>
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          {hasData ? (
            <div className="flex items-center gap-3 text-xs mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-stone-300">CCR: {metrics.ccrCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span className="text-stone-300">RCR: {metrics.rcrCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-stone-300">OCR: {metrics.ocrCount}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                <span className="font-mono text-stone-500">CCR • RCR • OCR</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                Segments map to SG postal districts
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
