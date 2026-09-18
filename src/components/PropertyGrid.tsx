import React from 'react';
import { Building, MapPin, Calendar, Compass, ChevronRight, Layers } from 'lucide-react';
import { PropertyTransaction } from '../types';
import { formatSGD, formatPSF, formatNumber } from '../utils/propertyUtils';
import { REGION_DESCRIPTIONS } from '../data/singaporeDistricts';

interface PropertyGridProps {
  transactions: PropertyTransaction[];
  areaUnit: 'sqft' | 'sqm';
  onSelectTransaction: (tx: PropertyTransaction) => void;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  transactions,
  areaUnit,
  onSelectTransaction,
}) => {
  if (transactions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {transactions.map((tx) => {
        const regionConfig = REGION_DESCRIPTIONS[tx.marketSegment];
        const areaValue = areaUnit === 'sqft' ? tx.areaSqft : tx.areaSqm;
        const unitPriceValue = areaUnit === 'sqft' ? tx.unitPricePsf : tx.unitPricePsm;

        return (
          <div
            key={tx.id}
            id={`property-card-${tx.id}`}
            onClick={() => onSelectTransaction(tx)}
            className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between group"
          >
            <div>
              {/* Header: Project Name & District Badges */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                    {tx.projectName}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                    <span className="truncate">{tx.streetName}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-bold">
                    {tx.district}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      regionConfig ? regionConfig.badgeColor : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {tx.marketSegment}
                  </span>
                </div>
              </div>

              {/* Price & PSF Showcase */}
              <div className="mt-3.5 pt-3 border-t border-stone-800/80">
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-bold text-white tracking-tight">
                    {formatSGD(tx.transactedPrice)}
                  </div>
                  <div className="text-xs font-mono font-medium text-amber-300">
                    {areaUnit === 'sqft' ? formatPSF(tx.unitPricePsf) : `S$${formatNumber(tx.unitPricePsm)} psm`}
                  </div>
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-stone-950/60 p-2.5 rounded-lg border border-stone-800/60">
                <div>
                  <span className="text-stone-400 block text-[10px]">Type & Floor</span>
                  <span className="text-stone-200 font-medium truncate block">
                    {tx.propertyType} {tx.floorRange ? `(${tx.floorRange})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Floor Area</span>
                  <span className="text-stone-200 font-medium font-mono block">
                    {formatNumber(areaValue)} {areaUnit}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Tenure</span>
                  <span className="text-stone-300 truncate block">{tx.tenure}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Contract Date</span>
                  <span className="text-stone-300 font-mono block">{tx.contractDate}</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-stone-800 text-stone-300 font-medium">
                {tx.typeOfSale}
              </span>
              <span className="text-amber-400/90 group-hover:text-amber-300 text-[11px] font-medium flex items-center gap-0.5">
                Stamp Duty & Specs <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
