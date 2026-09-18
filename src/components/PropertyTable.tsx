import React from 'react';
import {
  Building,
  ChevronRight,
  Sparkles,
  Settings,
  Database,
  Calendar,
  Layers,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { PropertyTransaction } from '../types';
import { formatSGD, formatPSF, formatNumber } from '../utils/propertyUtils';
import { REGION_DESCRIPTIONS } from '../data/singaporeDistricts';

interface PropertyTableProps {
  transactions: PropertyTransaction[];
  areaUnit: 'sqft' | 'sqm';
  onSelectTransaction: (tx: PropertyTransaction) => void;
  onOpenConfig: () => void;
  onLoadSimulator: () => void;
  isLoading: boolean;
}

export const PropertyTable: React.FC<PropertyTableProps> = ({
  transactions,
  areaUnit,
  onSelectTransaction,
  onOpenConfig,
  onLoadSimulator,
  isLoading,
}) => {
  const hasData = transactions.length > 0;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-sm">
      {/* Table Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Building className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-stone-100">
            Singapore Private Residential Transactions
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
            {transactions.length} {transactions.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="text-xs text-stone-400 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> CCR
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span> RCR
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> OCR
          </span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mb-3"></div>
          <p className="text-sm text-stone-300 font-medium">Querying property API endpoint...</p>
          <p className="text-xs text-stone-500 mt-1">Applying filters and calculating metrics</p>
        </div>
      )}

      {/* Populated Table */}
      {!isLoading && hasData && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950/80 text-stone-400 font-medium border-b border-stone-800 select-none">
              <tr>
                <th className="px-4 py-3">Project / Street</th>
                <th className="px-4 py-3">District & Region</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Floor Area</th>
                <th className="px-4 py-3 text-right">Transacted Price</th>
                <th className="px-4 py-3 text-right">Unit Price ({areaUnit.toUpperCase()})</th>
                <th className="px-4 py-3">Sale Type</th>
                <th className="px-4 py-3">Tenure</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {transactions.map((tx) => {
                const regionConfig = REGION_DESCRIPTIONS[tx.marketSegment];
                const areaValue = areaUnit === 'sqft' ? tx.areaSqft : tx.areaSqm;
                const unitPriceValue = areaUnit === 'sqft' ? tx.unitPricePsf : tx.unitPricePsm;

                return (
                  <tr
                    key={tx.id}
                    id={`property-row-${tx.id}`}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-stone-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Project & Street */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-stone-100 group-hover:text-amber-400 transition-colors">
                        {tx.projectName}
                      </div>
                      <div className="text-[11px] text-stone-400 truncate max-w-[200px]">
                        {tx.streetName}
                      </div>
                    </td>

                    {/* District & Region */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-stone-200">{tx.district}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            regionConfig ? regionConfig.badgeColor : 'bg-stone-800 text-stone-300'
                          }`}
                        >
                          {tx.marketSegment}
                        </span>
                      </div>
                    </td>

                    {/* Property Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-stone-300">{tx.propertyType}</span>
                      {tx.floorRange && (
                        <span className="block text-[10px] text-stone-500">
                          Floor {tx.floorRange}
                        </span>
                      )}
                    </td>

                    {/* Floor Area */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="font-mono text-stone-200">
                        {formatNumber(areaValue)} {areaUnit}
                      </span>
                      <span className="block text-[10px] text-stone-500">
                        {areaUnit === 'sqft'
                          ? `${formatNumber(tx.areaSqm)} sqm`
                          : `${formatNumber(tx.areaSqft)} sqft`}
                      </span>
                    </td>

                    {/* Transacted Price */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-stone-100 text-sm">
                        {formatSGD(tx.transactedPrice)}
                      </span>
                    </td>

                    {/* Unit Price PSF / PSM */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="font-mono text-amber-300 font-medium">
                        {areaUnit === 'sqft' ? formatPSF(tx.unitPricePsf) : `S$${formatNumber(tx.unitPricePsm)} psm`}
                      </span>
                    </td>

                    {/* Sale Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                          tx.typeOfSale === 'New Sale'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-stone-800 text-stone-300 border border-stone-700'
                        }`}
                      >
                        {tx.typeOfSale}
                      </span>
                    </td>

                    {/* Tenure */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-stone-300">{tx.tenure}</span>
                    </td>

                    {/* Contract Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-stone-400">
                      {tx.contractDate}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(tx);
                        }}
                        className="p-1 rounded hover:bg-stone-700 text-stone-400 hover:text-amber-300 transition-colors"
                        title="View Stamp Duty & Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State: Clear API Integration Guidance per user mandate */}
      {!isLoading && !hasData && (
        <div className="p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <Database className="w-6 h-6" />
          </div>

          <h3 className="text-base font-semibold text-stone-100 mt-4">
            No Property Data Loaded
          </h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto mt-1.5 leading-relaxed">
            As requested, no mock or pre-bundled records are loaded by default.
            Connect your backend API endpoint or run the sample simulator to preview the UI.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              id="empty-state-config-btn"
              type="button"
              onClick={onOpenConfig}
              className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium flex items-center gap-2 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Configure API Endpoint
            </button>
            <button
              id="empty-state-simulator-btn"
              type="button"
              onClick={onLoadSimulator}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Simulate Backend Response (5 records)
            </button>
          </div>

          {/* Integration Specs Preview */}
          <div className="mt-8 max-w-2xl mx-auto bg-stone-950 border border-stone-800/80 rounded-xl p-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="text-[11px] font-mono text-amber-400">
                Expected Backend Endpoint: GET /api/properties/transactions
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Status: Awaiting Feed</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-[11px]">
              <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Project Name</span>
                <span className="text-stone-200 font-mono truncate block">projectName: string</span>
              </div>
              <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                <span className="text-stone-400 block text-[10px]">District & Segment</span>
                <span className="text-stone-200 font-mono truncate block">district: D01..D28</span>
              </div>
              <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Transacted Price</span>
                <span className="text-stone-200 font-mono truncate block">transactedPrice: SGD</span>
              </div>
              <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Unit Price PSF</span>
                <span className="text-stone-200 font-mono truncate block">unitPricePsf: number</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
