import {
  ApiConfig,
  PropertyFilterParams,
  PropertyTransaction,
  PropertyTransactionResponse,
  DistrictSummaryStat,
} from '../types';

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: '/api/properties',
  apiKey: '',
  authHeaderName: 'Authorization',
  timeoutMs: 8000,
  dataFormat: 'REST_STANDARD',
  status: 'disconnected',
  lastPingMessage: 'Awaiting backend connection',
};

/**
 * Service client for Singapore Private Property API.
 * This client contains ready-to-use fetch implementations and placeholders
 * ready to plug into any backend service (Node/Express, Spring, Python/FastAPI, URA Realis API, etc.).
 */
export class PropertyApiService {
  private config: ApiConfig;

  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config;
  }

  public updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  /**
   * Builds headers including optional authentication token/API key.
   */
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.config.apiKey) {
      if (this.config.authHeaderName.toLowerCase() === 'authorization') {
        headers[this.config.authHeaderName] = this.config.apiKey.startsWith('Bearer ')
          ? this.config.apiKey
          : `Bearer ${this.config.apiKey}`;
      } else {
        headers[this.config.authHeaderName] = this.config.apiKey;
      }
      // Pass URA headers so serverless handler receives user key if provided in UI
      headers['AccessKey'] = this.config.apiKey;
      headers['x-ura-access-key'] = this.config.apiKey;
    }

    return headers;
  }

  /**
   * Serializes filter parameters to standard query string.
   */
  private serializeFilters(filters?: Partial<PropertyFilterParams>): string {
    if (!filters) return '';
    const params = new URLSearchParams();

    if (filters.district && filters.district !== 'ALL') {
      params.append('district', filters.district);
    }
    if (filters.marketSegment && filters.marketSegment !== 'ALL') {
      params.append('marketSegment', filters.marketSegment);
    }
    if (filters.propertyType && filters.propertyType !== 'ALL') {
      params.append('propertyType', filters.propertyType);
    }
    if (filters.tenure && filters.tenure !== 'ALL') {
      params.append('tenure', filters.tenure);
    }
    if (filters.saleType && filters.saleType !== 'ALL') {
      params.append('saleType', filters.saleType);
    }
    if (filters.minPrice != null) {
      params.append('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice != null) {
      params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters.minPsf != null) {
      params.append('minPsf', filters.minPsf.toString());
    }
    if (filters.maxPsf != null) {
      params.append('maxPsf', filters.maxPsf.toString());
    }
    if (filters.searchQuery) {
      params.append('search', filters.searchQuery.trim());
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }

    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  /**
   * PLACEHOLDER API ENDPOINT: Fetch Private Property Transactions.
   * Connect your backend endpoint: GET {baseUrl}/transactions or GET {baseUrl}
   */
  public async fetchTransactions(
    filters?: Partial<PropertyFilterParams>
  ): Promise<PropertyTransactionResponse> {
    const qs = this.serializeFilters(filters);
    const targetUrl = `${this.config.baseUrl.replace(/\/$/, '')}/transactions${qs}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const errorMessage = isAbort
        ? `Request timed out after ${this.config.timeoutMs}ms connecting to ${targetUrl}`
        : err instanceof Error
        ? err.message
        : 'Failed to connect to backend';

      // Returns structured response acknowledging no data / error
      return {
        status: 'error',
        message: errorMessage,
        meta: {
          totalRecords: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
          timestamp: new Date().toISOString(),
        },
        data: [],
      };
    }
  }

  /**
   * PLACEHOLDER API ENDPOINT: Ping health check.
   * Used to test backend connectivity and calculate round-trip latency.
   */
  public async testPing(targetUrl?: string): Promise<{
    success: boolean;
    latencyMs: number;
    message: string;
    statusCode?: number;
  }> {
    const url = (targetUrl || this.config.baseUrl).replace(/\/$/, '') + '/ping';
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        return {
          success: true,
          latencyMs,
          statusCode: response.status,
          message: `Connected successfully (${latencyMs}ms, HTTP ${response.status})`,
        };
      } else {
        return {
          success: false,
          latencyMs,
          statusCode: response.status,
          message: `Endpoint reached but returned HTTP ${response.status} (${response.statusText})`,
        };
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);
      const isAbort = err instanceof Error && err.name === 'AbortError';

      return {
        success: false,
        latencyMs,
        message: isAbort
          ? `Connection timed out (no response within 4s from ${url})`
          : `Connection refused: Unable to reach ${url}. Ensure CORS is enabled on your backend.`,
      };
    }
  }
}

export const propertyApi = new PropertyApiService();
