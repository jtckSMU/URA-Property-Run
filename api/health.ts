import { resolveUraAccessKey, getDailyUraToken } from './ura-service';

/**
 * Serverless Route: GET /api/health
 *
 * Provides a comprehensive health check for the application's API layer:
 * - Server status, uptime, and timestamp
 * - Runtime environment and memory consumption
 * - Verification of URA DataService integration and access key configuration
 * - Available API routes manifest
 */
export default async function handler(req: any, res?: any) {
  // CORS & Security headers
  const setHeaders = (r: any) => {
    if (r?.setHeader) {
      r.setHeader('Access-Control-Allow-Origin', '*');
      r.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      r.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccessKey, x-ura-access-key, Authorization');
      r.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  };

  if (res) setHeaders(res);

  if (req.method === 'OPTIONS') {
    if (res?.status) return res.status(204).end();
    return new Response(null, { status: 204 });
  }

  // Check incoming header or environment for URA_ACCESS_KEY
  const headerKey =
    req.headers?.['x-ura-access-key'] ||
    req.headers?.['accesskey'] ||
    (typeof req.query?.accessKey === 'string' ? req.query.accessKey : undefined);

  let uraStatus: 'connected' | 'unconfigured' | 'error' = 'unconfigured';
  let uraDetails = 'URA_ACCESS_KEY is not set in environment or request headers.';
  let isKeyConfigured = false;
  let maskedKey: string | undefined = undefined;

  try {
    const resolvedKey = resolveUraAccessKey(headerKey);
    if (resolvedKey) {
      isKeyConfigured = true;
      maskedKey = resolvedKey.length > 8 
        ? `${resolvedKey.slice(0, 4)}...${resolvedKey.slice(-4)}`
        : '***configured***';

      // Verify token trading with URA if checkToken query is true or key provided in request
      const shouldVerifyToken = req.query?.verify === 'true';
      if (shouldVerifyToken) {
        await getDailyUraToken(resolvedKey);
        uraStatus = 'connected';
        uraDetails = 'URA DataService credentials verified; active daily token secured.';
      } else {
        uraStatus = 'connected';
        uraDetails = 'URA AccessKey detected and ready for token exchange.';
      }
    }
  } catch (err: unknown) {
    if (isKeyConfigured) {
      uraStatus = 'error';
      uraDetails = err instanceof Error ? err.message : 'Failed to reach URA DataService with provided key.';
    } else {
      uraStatus = 'unconfigured';
      uraDetails = 'URA_ACCESS_KEY is not set. API will await user-provided key.';
    }
  }

  // System memory stats
  let memoryStats: Record<string, string> | undefined;
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const mem = process.memoryUsage();
    memoryStats = {
      heapUsedMb: (mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMb: (mem.heapTotal / 1024 / 1024).toFixed(2),
      rssMb: (mem.rss / 1024 / 1024).toFixed(2),
    };
  }

  const uptimeSeconds = typeof process !== 'undefined' && process.uptime ? Math.floor(process.uptime()) : 0;

  const payload = {
    status: 'healthy',
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: typeof process !== 'undefined' ? process.version : undefined,
    services: {
      serverlessApi: {
        status: 'up',
      },
      uraDataService: {
        status: uraStatus,
        keyConfigured: isKeyConfigured,
        maskedKey,
        message: uraDetails,
      },
    },
    system: {
      memory: memoryStats,
    },
    routes: [
      { path: '/api/health', method: 'GET', description: 'System and service health check' },
      { path: '/api/token', method: 'GET', description: 'Trades URA AccessKey for daily active token' },
      { path: '/api/ura', method: 'GET', description: 'URA Realis residential transactions query' },
      { path: '/api/properties/transactions', method: 'GET', description: 'Normalized property transactions for frontend' },
      { path: '/api/properties/ping', method: 'GET', description: 'Lightweight diagnostic ping' },
    ],
  };

  if (res?.status) {
    return res.status(200).json(payload);
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
