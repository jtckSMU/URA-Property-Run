import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, SlidersHorizontal, MapPin } from 'lucide-react';
import { PropertyFilterParams, MarketSegment, PropertyType, TenureType, SaleType } from '../types';
import { SINGAPORE_DISTRICTS, PROPERTY_TYPES, TENURE_TYPES, SALE_TYPES } from '../data/singaporeDistricts';

interface FilterBarProps {
  filters: PropertyFilterParams;
  onFilterChange: (updated: Partial<PropertyFilterParams>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = [
    filters.district !== 'ALL',
    filters.marketSegment !== 'ALL',
    filters.propertyType !== 'ALL',
    filters.tenure !== 'ALL',
    filters.saleType !== 'ALL',
    filters.minPrice !== null || filters.maxPrice !== null,
    filters.minPsf !== null || filters.maxPsf !== null,
    filters.searchQuery.trim().length > 0,
  ].filter(Boolean).length;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
      {/* Top Search & Primary Filters Row */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="filter-search-input"
            type="text"
            placeholder="Search by project name, street, or postal code (e.g. Marina, Leedon, Amber)..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
          />
        </div>

        {/* Region Segment Tabs */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 shrink-0 overflow-x-auto">
          {(['ALL', 'CCR', 'RCR', 'OCR'] as const).map((seg) => (
            <button
              key={seg}
              id={`filter-segment-${seg.toLowerCase()}`}
              type="button"
              onClick={() => onFilterChange({ marketSegment: seg })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filters.marketSegment === seg
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
              title={
                seg === 'ALL'
                  ? 'All Singapore regions'
                  : seg === 'CCR'
                  ? 'Core Central Region (Prime)'
                  : seg === 'RCR'
                  ? 'Rest of Central Region (City fringe)'
                  : 'Outside Central Region (Suburban)'
              }
            >
              {seg === 'ALL' ? 'All Regions' : seg}
            </button>
          ))}
        </div>

        {/* District Selector */}
        <div className="min-w-[190px]">
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="filter-district-select"
              value={filters.district}
              onChange={(e) => onFilterChange({ district: e.target.value })}
              aria-label="Filter by Singapore Postal District"
              className="w-full pl-9 pr-8 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
            >
              <option value="ALL">All Districts (D01 – D28)</option>
              {SINGAPORE_DISTRICTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} - {d.name} ({d.region})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Toggle Detailed Filters Button */}
        <div className="flex items-center gap-2">
          <button
            id="filter-toggle-detailed-btn"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              isExpanded || activeFilterCount > 0
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] flex items-center justify-center ml-0.5">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              id="filter-reset-btn"
              type="button"
              onClick={onResetFilters}
              className="p-2 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Secondary Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Property Type */}
          <div>
            <label className="block text-stone-400 font-medium mb-1.5">Property Type</label>
            <select
              id="filter-property-type-select"
              value={filters.propertyType}
              onChange={(e) => onFilterChange({ propertyType: e.target.value as PropertyType | 'ALL' })}
              aria-label="Filter by Property Type"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="ALL">All Residential Types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sale Type */}
          <div>
            <label className="block text-stone-400 font-medium mb-1.5">Type of Sale</label>
            <select
              id="filter-sale-type-select"
              value={filters.saleType}
              onChange={(e) => onFilterChange({ saleType: e.target.value as SaleType | 'ALL' })}
              aria-label="Filter by Type of Sale"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="ALL">All Sales (New & Resale)</option>
              {SALE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Tenure */}
          <div>
            <label className="block text-stone-400 font-medium mb-1.5">Tenure</label>
            <select
              id="filter-tenure-select"
              value={filters.tenure}
              onChange={(e) => onFilterChange({ tenure: e.target.value as TenureType | 'ALL' })}
              aria-label="Filter by Property Tenure"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="ALL">All Tenures</option>
              {TENURE_TYPES.map((ten) => (
                <option key={ten} value={ten}>
                  {ten}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-stone-400 font-medium mb-1.5">Sort Order</label>
            <select
              id="filter-sort-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as PropertyFilterParams['sortBy'] })}
              aria-label="Select Sort Order"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="date_desc">Latest Contract Date</option>
              <option value="price_desc">Price: Highest to Lowest</option>
              <option value="price_asc">Price: Lowest to Highest</option>
              <option value="psf_desc">Unit PSF: Highest to Lowest</option>
              <option value="psf_asc">Unit PSF: Lowest to Highest</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
