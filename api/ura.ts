import {
  resolveUraAccessKey,
  fetchUraResidentialTransactions,
  normalizeUraTransactions,
} from './ura-service';

/**
 * Serverless Route: GET /api/ura
 *
 * Invokes URA DataService with both AccessKey and Token:
 * 1. Trades AccessKey for Token via https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1
 * 2. Fetches https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=1
 *
 * Query parameters:
 * - batch: number (1, 2, 3, or 4 - default 1)
 * - raw: "true" to return raw URA nested response, "false" to return normalized format
 * - district: filter by district (e.g. D09, D10)
 * - marketSegment: filter by CCR, RCR, OCR
 */
export default async function handler(req: any, res?: any) {
  // CORS & Security headers
  const setHeaders = (r: any) => {
    if (r?.setHeader) {
      r.setHeader('Access-Control-Allow-Origin', '*');
      r.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      r.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccessKey, x-ura-access-key, Authorization');
    }
  };

  if (res) setHeaders(res);

  if (req.method === 'OPTIONS') {
    if (res?.status) return res.status(204).end();
    return new Response(null, { status: 204 });
  }

  // Extract access key from headers, query, or environment
  const headerKey =
    req.headers?.['x-ura-access-key'] ||
    req.headers?.['accesskey'] ||
    (typeof req.query?.accessKey === 'string' ? req.query.accessKey : undefined);

  try {
    const accessKey = resolveUraAccessKey(headerKey);
    const batch = Math.max(1, Math.min(4, Number(req.query?.batch) || 1));
    const isRaw = req.query?.raw === 'true';

    // Step 1 & 2: Get token and invoke URA DataService
    const rawResult = await fetchUraResidentialTransactions(accessKey, batch);

    if (isRaw) {
      const rawPayload = {
        status: 'success',
        source: 'URA DataService (PMI_Resi_Transaction)',
        batch,
        projectCount: rawResult.length,
        data: rawResult,
      };

      if (res?.status) return res.status(200).json(rawPayload);
      return new Response(JSON.stringify(rawPayload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Normalized into app format
    let transactions = normalizeUraTransactions(rawResult);

    // Apply optional server-side filters if passed in query
    if (req.query?.district && req.query.district !== 'ALL') {
      const d = String(req.query.district).toUpperCase();
      transactions = transactions.filter((t) => t.district === d);
    }

    if (req.query?.marketSegment && req.query.marketSegment !== 'ALL') {
      const seg = String(req.query.marketSegment).toUpperCase();
      transactions = transactions.filter((t) => t.marketSegment === seg);
    }

    if (req.query?.search) {
      const q = String(req.query.search).toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.projectName.toLowerCase().includes(q) ||
          t.streetName.toLowerCase().includes(q)
      );
    }

    const payload = {
      status: 'success',
      meta: {
        totalRecords: transactions.length,
        batch,
        timestamp: new Date().toISOString(),
        source: 'URA DataService API (Live)',
      },
      data: transactions,
    };

    if (res?.status) return res.status(200).json(payload);
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'URA API invocation error';
    const errorPayload = {
      status: 'error',
      message,
      timestamp: new Date().toISOString(),
    };

    if (res?.status) return res.status(400).json(errorPayload);
    return new Response(JSON.stringify(errorPayload), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
