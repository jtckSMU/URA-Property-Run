/**
 * URA (Urban Redevelopment Authority) Singapore DataService Client
 *
 * Handles:
 * 1. Daily Token Exchange: Trades URA_ACCESS_KEY for today's temporary Token via
 *    https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1
 * 2. Data Calls: Invokes URA DataService with both AccessKey & Token headers:
 *    https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=1
 * 3. Automatic Token Caching & Re-trade upon expiry.
 * 4. Normalization into the application's PropertyTransaction schema.
 */

export interface UraRawTransaction {
  area: string;
  floorRange?: string;
  noOfUnits?: string;
  contractDate: string; // e.g. "0524" (MMYY)
  typeOfSale: string; // "1" = New Sale, "2" = Sub Sale, "3" = Resale
  price: string;
  propertyType: string;
  district?: string; // e.g. "01", "09", "10"
  typeOfArea?: string;
  tenure?: string;
  nettPrice?: string;
}

export interface UraRawProject {
  project: string;
  street: string;
  marketSegment: 'CCR' | 'RCR' | 'OCR';
  transaction?: UraRawTransaction[];
}

export interface UraRawResponse {
  Status: string;
  Message?: string;
  Result?: UraRawProject[];
}

export interface UraTokenResponse {
  Status: string;
  Message?: string;
  Result?: string;
}

// In-memory token cache (valid for the calendar day)
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;
let lastUsedAccessKey: string | null = null;

const URA_TOKEN_URL = 'https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1';
const URA_INVOKE_URL = 'https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1';

/**
 * Resolves the URA AccessKey from environment or headers.
 */
export function resolveUraAccessKey(customKey?: string | null): string {
  const key =
    customKey?.trim() ||
    process.env.URA_ACCESS_KEY?.trim() ||
    process.env.VITE_URA_ACCESS_KEY?.trim();

  if (!key) {
    throw new Error(
      'URA_ACCESS_KEY is required. Please set URA_ACCESS_KEY in your environment or provide it in the API settings.'
    );
  }

  return key;
}

/**
 * Step 1: Trades the URA AccessKey for today's Token.
 * Daily token is cached in memory for up to 23 hours or until re-trade.
 */
export async function getDailyUraToken(accessKey: string, forceRefresh = false): Promise<string> {
  const now = Date.now();

  // Return cached token if valid and for the same AccessKey
  if (
    !forceRefresh &&
    cachedToken &&
    lastUsedAccessKey === accessKey &&
    now < tokenExpiresAt
  ) {
    return cachedToken;
  }

  const response = await fetch(URA_TOKEN_URL, {
    method: 'GET',
    headers: {
      AccessKey: accessKey,
      Accept: 'application/json',
      'User-Agent': 'Singapore-Property-Prices/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(
      `URA Token service returned HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data = (await response.json()) as UraTokenResponse;

  if (data.Status !== 'Success' || !data.Result) {
    throw new Error(
      `Failed to obtain URA Token: ${data.Message || 'Invalid AccessKey or URA service response'}`
    );
  }

  cachedToken = data.Result;
  lastUsedAccessKey = accessKey;
  // Tokens expire daily; set local expiry to 23 hours
  tokenExpiresAt = now + 23 * 60 * 60 * 1000;

  return cachedToken;
}

/**
 * Step 2: Calls URA DataService with BOTH AccessKey and Token headers.
 * Service: PMI_Resi_Transaction
 * Batches: 1, 2, 3, 4
 */
export async function fetchUraResidentialTransactions(
  accessKey: string,
  batch: number = 1,
  retryCount = 0
): Promise<UraRawProject[]> {
  const token = await getDailyUraToken(accessKey);

  const url = `${URA_INVOKE_URL}?service=PMI_Resi_Transaction&batch=${batch}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      AccessKey: accessKey,
      Token: token,
      Accept: 'application/json',
      'User-Agent': 'Singapore-Property-Prices/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(
      `URA DataService returned HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data = (await response.json()) as UraRawResponse;

  // Handle Token Expiry / Session Invalidation error from URA
  if (
    data.Status !== 'Success' &&
    retryCount < 1 &&
    data.Message &&
    /token|session|unauthorized|expired|invalid/i.test(data.Message)
  ) {
    // Force refresh token and retry once
    await getDailyUraToken(accessKey, true);
    return fetchUraResidentialTransactions(accessKey, batch, retryCount + 1);
  }

  if (data.Status !== 'Success') {
    throw new Error(`URA API Error: ${data.Message || 'Failed to fetch transaction records'}`);
  }

  return data.Result || [];
}

/**
 * Helper to convert MMYY (e.g. "0524") to ISO-like YYYY-MM (e.g. "2024-05")
 */
function parseUraContractDate(dateStr?: string): string {
  if (!dateStr || dateStr.length < 4) return dateStr || '';
  const month = dateStr.slice(0, 2);
  const year = dateStr.slice(2, 4);
  const fullYear = Number(year) > 50 ? `19${year}` : `20${year}`;
  return `${fullYear}-${month}`;
}

/**
 * Normalizes URA raw data format into application's PropertyTransaction records.
 */
export function normalizeUraTransactions(rawProjects: UraRawProject[]): any[] {
  const flattened: any[] = [];

  for (const proj of rawProjects) {
    const txList = proj.transaction || [];

    for (let i = 0; i < txList.length; i++) {
      const tx = txList[i];
      const areaSqm = Number(tx.area) || 0;
      const areaSqft = Math.round(areaSqm * 10.7639);
      const price = Number(tx.price) || 0;
      const unitPricePsf = areaSqft > 0 ? Math.round(price / areaSqft) : 0;
      const unitPricePsm = areaSqm > 0 ? Math.round(price / areaSqm) : 0;

      // Format district: e.g. "01" -> "D01"
      let district = tx.district || '00';
      if (!district.toUpperCase().startsWith('D')) {
        district = `D${district.padStart(2, '0')}`;
      }

      // Map sale type
      let typeOfSale = 'Resale';
      if (tx.typeOfSale === '1') typeOfSale = 'New Sale';
      else if (tx.typeOfSale === '2') typeOfSale = 'Sub Sale';

      // Map property type standard label
      let propType = tx.propertyType || 'Condominium';
      if (/terrace/i.test(propType)) propType = 'Terrace House';
      else if (/semi-detached|semi detached/i.test(propType)) propType = 'Semi-Detached House';
      else if (/detached|bungalow/i.test(propType)) propType = 'Detached House';
      else if (/executive condo/i.test(propType)) propType = 'Executive Condominium';

      flattened.push({
        id: `URA-${proj.project.replace(/\s+/g, '_')}-${tx.contractDate}-${i}`,
        projectName: proj.project,
        streetName: proj.street,
        district,
        marketSegment: proj.marketSegment || 'CCR',
        propertyType: propType,
        transactedPrice: price,
        areaSqft,
        areaSqm,
        unitPricePsf,
        unitPricePsm,
        contractDate: parseUraContractDate(tx.contractDate),
        tenure: tx.tenure || 'Freehold',
        floorRange: tx.floorRange && tx.floorRange !== '-' ? tx.floorRange : undefined,
        typeOfSale,
        numberOfUnits: Number(tx.noOfUnits) || 1,
      });
    }
  }

  return flattened;
}
