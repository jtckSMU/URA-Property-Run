import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  Calendar,
  Layers,
  FileText,
  Calculator,
  Compass,
  Code,
  Check,
  Copy,
} from 'lucide-react';
import { PropertyTransaction } from '../types';
import { formatSGD, formatPSF, formatNumber, calculateBSD } from '../utils/propertyUtils';
import { REGION_DESCRIPTIONS, SINGAPORE_DISTRICTS } from '../data/singaporeDistricts';

interface TransactionDetailModalProps {
  transaction: PropertyTransaction | null;
  areaUnit: 'sqft' | 'sqm';
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  areaUnit,
  onClose,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const districtInfo = SINGAPORE_DISTRICTS.find((d) => d.code === transaction.district);
  const regionConfig = REGION_DESCRIPTIONS[transaction.marketSegment];
  const bsd = calculateBSD(transaction.transactedPrice);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(transaction, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {transaction.projectName}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    regionConfig ? regionConfig.badgeColor : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  {transaction.marketSegment}
                </span>
              </div>
              <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>
                  {transaction.streetName} • District {transaction.district}{' '}
                  {districtInfo ? `(${districtInfo.name})` : ''}
                </span>
              </p>
            </div>
          </div>
          <button
            id="tx-modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Price Overview Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-stone-950 rounded-xl border border-stone-800">
            <div>
              <span className="text-[11px] text-stone-400 font-medium block">
                Transacted Purchase Price
              </span>
              <div className="text-2xl font-bold text-white tracking-tight mt-0.5">
                {formatSGD(transaction.transactedPrice)}
              </div>
              <span className="text-[11px] text-amber-400 font-mono mt-0.5 block">
                {formatPSF(transaction.unitPricePsf)} ({formatNumber(transaction.unitPricePsm)} SGD/sqm)
              </span>
            </div>

            <div className="sm:border-l sm:border-stone-800 sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800/80">
              <span className="text-[11px] text-stone-400 font-medium block">
                Unit Specifications
              </span>
              <div className="text-sm font-semibold text-stone-200 mt-1">
                {formatNumber(transaction.areaSqft)} sqft{' '}
                <span className="text-stone-500 text-xs">({formatNumber(transaction.areaSqm)} sqm)</span>
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Floor level: <span className="text-stone-200">{transaction.floorRange || 'Unspecified'}</span>
              </div>
            </div>
          </div>

          {/* Key Transaction Attributes Grid */}
          <div>
            <h3 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2.5">
              Property & Contract Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-stone-950/60 rounded-lg border border-stone-800">
                <span className="text-stone-500 text-[10px] block">Property Type</span>
                <span className="text-stone-200 font-medium mt-0.5 block">
                  {transaction.propertyType}
                </span>
              </div>
              <div className="p-3 bg-stone-950/60 rounded-lg border border-stone-800">
                <span className="text-stone-500 text-[10px] block">Tenure</span>
                <span className="text-stone-200 font-medium mt-0.5 block">
                  {transaction.tenure}
                </span>
              </div>
              <div className="p-3 bg-stone-950/60 rounded-lg border border-stone-800">
                <span className="text-stone-500 text-[10px] block">Sale Type</span>
                <span className="text-stone-200 font-medium mt-0.5 block">
                  {transaction.typeOfSale}
                </span>
              </div>
              <div className="p-3 bg-stone-950/60 rounded-lg border border-stone-800">
                <span className="text-stone-500 text-[10px] block">Contract Date</span>
                <span className="text-stone-200 font-mono mt-0.5 block">
                  {transaction.contractDate}
                </span>
              </div>
              <div className="p-3 bg-stone-950/60 rounded-lg border border-stone-800">
                <span className="text-stone-500 text-[10px] block">Postal District</span>
                <span className="text-stone-200 font-mono mt-0.5 block">
                  {transaction.district}
                </span>
              </div>
              <div className="p-3 bg-stone-950/60 rounded-lg border border-stone-800">
                <span className="text-stone-500 text-[10px] block">Record ID</span>
                <span className="text-stone-400 font-mono text-[10px] truncate mt-0.5 block">
                  {transaction.id}
                </span>
              </div>
            </div>
          </div>

          {/* Singapore Buyer's Stamp Duty (BSD) Calculator Breakdown */}
          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-stone-200">
                  Singapore Buyer's Stamp Duty (BSD)
                </span>
              </div>
              <span className="font-mono font-bold text-amber-300">
                {formatSGD(bsd.totalBsd)} ({bsd.effectiveRate}% effective)
              </span>
            </div>

            <p className="text-[11px] text-stone-400 mt-2">
              Based on official Inland Revenue Authority of Singapore (IRAS) tiered residential rates:
            </p>

            <div className="mt-3 space-y-1.5 font-mono text-[11px]">
              {bsd.breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 px-2 rounded bg-stone-900/70 border border-stone-800/60"
                >
                  <span className="text-stone-400">{item.tier}</span>
                  <span className="text-stone-200">{formatSGD(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw JSON Inspector for Developers */}
          <div className="pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <button
                id="tx-toggle-raw-json-btn"
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-stone-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
                <span>{showRawJson ? 'Hide API Payload' : 'View Raw API JSON Payload'}</span>
              </button>

              {showRawJson && (
                <button
                  id="tx-copy-json-btn"
                  type="button"
                  onClick={handleCopyJson}
                  className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1 text-[11px]"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            {showRawJson && (
              <pre className="p-3 bg-stone-950 border border-stone-800 rounded-lg font-mono text-[11px] text-amber-200/90 overflow-x-auto max-h-48">
                {JSON.stringify(transaction, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950/80 flex justify-end">
          <button
            id="tx-modal-close-action-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
