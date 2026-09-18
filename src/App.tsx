import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Building2,
  Table as TableIcon,
  LayoutGrid,
  Filter,
  Layers,
  ArrowRight,
  Sparkles,
  Download,
  AlertCircle,
  Database,
  RefreshCw,
} from 'lucide-react';
import {
  PropertyTransaction,
  PropertyFilterParams,
  ApiConfig,
} from './types';
import { DEFAULT_API_CONFIG, propertyApi } from './services/propertyApi';
import { SAMPLE_API_RESPONSE_PAYLOAD } from './services/apiSchemaDocs';
import { Header } from './components/Header';
import { ApiIntegrationBanner } from './components/ApiIntegrationBanner';
import { FilterBar } from './components/FilterBar';
import { MetricsSummary } from './components/MetricsSummary';
import { PropertyTable } from './components/PropertyTable';
import { PropertyGrid } from './components/PropertyGrid';
import { ApiConfigModal } from './components/ApiConfigModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { SingaporeDistrictGuide } from './components/SingaporeDistrictGuide';

const INITIAL_FILTERS: PropertyFilterParams = {
  searchQuery: '',
  district: 'ALL',
  marketSegment: 'ALL',
  propertyType: 'ALL',
  tenure: 'ALL',
  saleType: 'ALL',
  minPrice: null,
  maxPrice: null,
  minPsf: null,
  maxPsf: null,
  sortBy: 'date_desc',
};

export default function App() {
  // STRICT USER CONSTRAINT: Do not include any data as of now. Initial state is an empty array.
  const [transactions, setTransactions] = useState<PropertyTransaction[]>([]);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // API Client Configuration State
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('sg_property_api_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_API_CONFIG;
      }
    }
    return DEFAULT_API_CONFIG;
  });

  // UI States
  const [filters, setFilters] = useState<PropertyFilterParams>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [areaUnit, setAreaUnit] = useState<'sqft' | 'sqm'>('sqft');
  const [selectedTx, setSelectedTx] = useState<PropertyTransaction | null>(null);

  // Modals
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configModalTab, setConfigModalTab] = useState<'config' | 'schema' | 'tester'>('config');

  // Sync API Service configuration on mount and update
  useEffect(() => {
    propertyApi.updateConfig(apiConfig);
  }, [apiConfig]);

  const handleSaveConfig = (updated: ApiConfig) => {
    setApiConfig(updated);
    localStorage.setItem('sg_property_api_config', JSON.stringify(updated));
    setApiError(null);
  };

  // Attempt live query against the configured backend endpoint
  const handleFetchFromLiveApi = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await propertyApi.fetchTransactions(filters);
      if (response.status === 'success' && Array.isArray(response.data)) {
        setTransactions(response.data);
        setIsSimulated(false);
        setApiConfig((prev) => ({ ...prev, status: 'connected' }));
      } else {
        setApiError(
          response.message ||
            'Backend returned no records or connection was not reached. Ensure your API endpoint is running.'
        );
        // Ensure transactions remains empty if backend failed
        if (!isSimulated) {
          setTransactions([]);
        }
      }
    } catch (err: unknown) {
      setApiError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to backend property API. Please verify endpoint configuration.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, isSimulated]);

  // Handler for Developer Testing Sandbox / Simulator
  const handleLoadSimulator = () => {
    setTransactions(SAMPLE_API_RESPONSE_PAYLOAD.data as PropertyTransaction[]);
    setIsSimulated(true);
    setApiError(null);
  };

  // Reset to 0 records per user preference
  const handleClearData = () => {
    setTransactions([]);
    setIsSimulated(false);
    setApiError(null);
  };

  const handleFilterChange = (updated: Partial<PropertyFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Filter and Sort in-memory records (when records are loaded from backend or simulator)
  const filteredTransactions = useMemo(() => {
    if (transactions.length === 0) return [];

    return transactions
      .filter((item) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchProject = item.projectName.toLowerCase().includes(q);
          const matchStreet = item.streetName.toLowerCase().includes(q);
          const matchPostal = item.postalCode ? item.postalCode.includes(q) : false;
          if (!matchProject && !matchStreet && !matchPostal) return false;
        }

        // District
        if (filters.district !== 'ALL' && item.district !== filters.district) {
          return false;
        }

        // Market Segment (CCR, RCR, OCR)
        if (filters.marketSegment !== 'ALL' && item.marketSegment !== filters.marketSegment) {
          return false;
        }

        // Property Type
        if (filters.propertyType !== 'ALL' && item.propertyType !== filters.propertyType) {
          return false;
        }

        // Tenure
        if (filters.tenure !== 'ALL' && item.tenure !== filters.tenure) {
          return false;
        }

        // Sale Type
        if (filters.saleType !== 'ALL' && item.typeOfSale !== filters.saleType) {
          return false;
        }

        // Min/Max Price
        if (filters.minPrice !== null && item.transactedPrice < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice !== null && item.transactedPrice > filters.maxPrice) {
          return false;
        }

        // Min/Max PSF
        if (filters.minPsf !== null && item.unitPricePsf < filters.minPsf) {
          return false;
        }
        if (filters.maxPsf !== null && item.unitPricePsf > filters.maxPsf) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'date_asc':
            return a.contractDate.localeCompare(b.contractDate);
          case 'date_desc':
            return b.contractDate.localeCompare(a.contractDate);
          case 'price_asc':
            return a.transactedPrice - b.transactedPrice;
          case 'price_desc':
            return b.transactedPrice - a.transactedPrice;
          case 'psf_asc':
            return a.unitPricePsf - b.unitPricePsf;
          case 'psf_desc':
            return b.unitPricePsf - a.unitPricePsf;
          default:
            return 0;
        }
      });
  }, [transactions, filters]);

  // Export current view data to JSON
  const handleExportJson = () => {
    if (filteredTransactions.length === 0) return;
    const blob = new Blob([JSON.stringify(filteredTransactions, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `singapore_property_prices_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        apiConfig={apiConfig}
        isSimulated={isSimulated}
        totalLoaded={transactions.length}
        areaUnit={areaUnit}
        onToggleUnit={() => setAreaUnit(areaUnit === 'sqft' ? 'sqm' : 'sqft')}
        onOpenConfig={() => {
          setConfigModalTab('config');
          setIsConfigModalOpen(true);
        }}
        onOpenDocs={() => {
          setConfigModalTab('schema');
          setIsConfigModalOpen(true);
        }}
        onLoadSimulator={handleLoadSimulator}
        onClearData={handleClearData}
      />

      {/* API Notice & Quick Action Banner */}
      <ApiIntegrationBanner
        totalLoaded={transactions.length}
        isSimulated={isSimulated}
        onOpenConfig={() => {
          setConfigModalTab('config');
          setIsConfigModalOpen(true);
        }}
        onOpenDocs={() => {
          setConfigModalTab('schema');
          setIsConfigModalOpen(true);
        }}
        onLoadSimulator={handleLoadSimulator}
        onClearData={handleClearData}
        onFetchLive={handleFetchFromLiveApi}
        isLoading={isLoading}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Error Notice if API connection was attempted and returned an issue */}
        {apiError && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Backend Connection Feedback</strong>
                <p className="text-stone-300 mt-0.5">{apiError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-stone-400 hover:text-stone-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Metrics Summary Row */}
        <MetricsSummary
          transactions={filteredTransactions}
          areaUnit={areaUnit}
          onOpenConfig={() => {
            setConfigModalTab('config');
            setIsConfigModalOpen(true);
          }}
        />

        {/* Singapore District Directory & Region Guide */}
        <SingaporeDistrictGuide
          selectedDistrict={filters.district}
          onSelectDistrict={(code) => handleFilterChange({ district: code })}
        />

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalResults={filteredTransactions.length}
        />

        {/* View Switcher & Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-400">
              Showing <strong className="text-stone-200">{filteredTransactions.length}</strong> of{' '}
              <strong className="text-stone-200">{transactions.length}</strong> total loaded transactions
            </span>
            {transactions.length === 0 && (
              <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-amber-400 font-mono text-[11px]">
                0 records (Awaiting Backend)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5">
              <button
                id="view-mode-table-btn"
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Table view"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                id="view-mode-grid-btn"
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Card grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export JSON Button */}
            {filteredTransactions.length > 0 && (
              <button
                id="export-json-btn"
                type="button"
                onClick={handleExportJson}
                className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 flex items-center gap-1.5 transition-colors"
                title="Export current transactions to JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary View: Table or Grid */}
        {viewMode === 'table' ? (
          <PropertyTable
            transactions={filteredTransactions}
            areaUnit={areaUnit}
            onSelectTransaction={(tx) => setSelectedTx(tx)}
            onOpenConfig={() => {
              setConfigModalTab('config');
              setIsConfigModalOpen(true);
            }}
            onLoadSimulator={handleLoadSimulator}
            isLoading={isLoading}
          />
        ) : (
          <PropertyGrid
            transactions={filteredTransactions}
            areaUnit={areaUnit}
            onSelectTransaction={(tx) => setSelectedTx(tx)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900/60 border-t border-stone-850 mt-12 py-6 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Singapore Private Residential Property Valuation System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>Market Segments: CCR • RCR • OCR</span>
            <span>IRAS BSD Rates (Feb 2023 Update)</span>
            <button
              type="button"
              onClick={() => {
                setConfigModalTab('schema');
                setIsConfigModalOpen(true);
              }}
              className="text-amber-400 hover:underline"
            >
              API Schema Spec
            </button>
          </div>
        </div>
      </footer>

      {/* Developer API Configuration & Schemas Modal */}
      <ApiConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        apiConfig={apiConfig}
        onSaveConfig={handleSaveConfig}
        onSimulateData={(data) => {
          setTransactions(data);
          setIsSimulated(true);
          setApiError(null);
        }}
        onClearData={handleClearData}
        totalLoaded={transactions.length}
        initialTab={configModalTab}
      />

      {/* Transaction Breakdown & Stamp Duty Modal */}
      <TransactionDetailModal
        transaction={selectedTx}
        areaUnit={areaUnit}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
