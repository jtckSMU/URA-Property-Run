export type MarketSegment = 'CCR' | 'RCR' | 'OCR';

export type PropertyType =
  | 'Condominium'
  | 'Apartment'
  | 'Executive Condominium'
  | 'Terrace House'
  | 'Semi-Detached House'
  | 'Detached House'
  | 'Good Class Bungalow'
  | 'Strata Landed';

export type TenureType =
  | 'Freehold'
  | '99-year Leasehold'
  | '999-year Leasehold'
  | '9999-year Leasehold';

export type SaleType = 'New Sale' | 'Resale' | 'Sub Sale';

export interface DistrictInfo {
  code: string; // e.g. 'D01'
  name: string; // e.g. 'Raffles Place, Marina, Cecil'
  region: MarketSegment;
  postalSectors: string[];
}

export interface PropertyTransaction {
  id: string;
  projectName: string;
  streetName: string;
  district: string; // e.g. 'D09'
  marketSegment: MarketSegment;
  propertyType: PropertyType;
  transactedPrice: number; // in SGD
  areaSqft: number;
  areaSqm: number;
  unitPricePsf: number;
  unitPricePsm: number;
  contractDate: string; // YYYY-MM or YYYY-MM-DD
  tenure: TenureType;
  leaseStartDate?: string;
  floorRange?: string; // e.g. '11 to 15'
  typeOfSale: SaleType;
  numberOfUnits?: number;
  postalCode?: string;
  developer?: string;
}

export interface PropertyFilterParams {
  searchQuery: string;
  district: string; // 'ALL' or 'D01'..'D28'
  marketSegment: MarketSegment | 'ALL';
  propertyType: PropertyType | 'ALL';
  tenure: TenureType | 'ALL';
  saleType: SaleType | 'ALL';
  minPrice: number | null;
  maxPrice: number | null;
  minPsf: number | null;
  maxPsf: number | null;
  sortBy: 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc' | 'psf_desc' | 'psf_asc';
}

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  authHeaderName: string;
  timeoutMs: number;
  dataFormat: 'REST_STANDARD' | 'URA_REALIS';
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastPingMessage?: string;
  latencyMs?: number;
}

export interface ApiResponseMeta {
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  timestamp: string;
  executionTimeMs?: number;
}

export interface PropertyTransactionResponse {
  data: PropertyTransaction[];
  meta: ApiResponseMeta;
  status: 'success' | 'error';
  message?: string;
}

export interface DistrictSummaryStat {
  district: string;
  name: string;
  region: MarketSegment;
  medianPsf: number;
  medianPrice: number;
  transactionCount: number;
}
