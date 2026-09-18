import React, { useState } from 'react';
import { Compass, MapPin, ChevronDown, ChevronUp, ExternalLink, HelpCircle } from 'lucide-react';
import { SINGAPORE_DISTRICTS, REGION_DESCRIPTIONS } from '../data/singaporeDistricts';

interface SingaporeDistrictGuideProps {
  selectedDistrict: string;
  onSelectDistrict: (code: string) => void;
}

export const SingaporeDistrictGuide: React.FC<SingaporeDistrictGuideProps> = ({
  selectedDistrict,
  onSelectDistrict,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-sm">
      <button
        id="district-guide-toggle-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-stone-900 hover:bg-stone-850 flex items-center justify-between text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-stone-200">
              Singapore District Directory & Market Zones (CCR / RCR / OCR)
            </span>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Reference guide for all 28 Singapore postal districts and property classifications
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-stone-400 text-xs">
          <span>{isOpen ? 'Hide Directory' : 'View 28 Districts'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 text-xs space-y-4">
          {/* Region Definitions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(REGION_DESCRIPTIONS).map(([key, reg]) => (
              <div key={key} className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${reg.badgeColor}`}
                  >
                    {key}
                  </span>
                  <span className="font-semibold text-stone-200 text-xs">{reg.label}</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">{reg.desc}</p>
              </div>
            ))}
          </div>

          {/* District Grid */}
          <div>
            <span className="text-stone-400 text-[11px] font-medium block mb-2">
              Quick Filter by District (Click to filter transactions):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {SINGAPORE_DISTRICTS.map((d) => {
                const isSelected = selectedDistrict === d.code;
                const reg = REGION_DESCRIPTIONS[d.region];

                return (
                  <button
                    key={d.code}
                    id={`guide-district-${d.code.toLowerCase()}`}
                    type="button"
                    onClick={() => onSelectDistrict(isSelected ? 'ALL' : d.code)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-stone-900 border-stone-800 hover:border-stone-700 text-stone-300 hover:bg-stone-850'
                    }`}
                    title={`${d.name} (${d.region})`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs">{d.code}</span>
                      <span className={`text-[9px] font-bold px-1 rounded border ${reg.badgeColor}`}>
                        {d.region}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 line-clamp-1 mt-1 block">
                      {d.name.split(',')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
