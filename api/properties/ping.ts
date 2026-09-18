import { resolveUraAccessKey, getDailyUraToken } from '../ura-service';

/**
 * Serverless Route: GET /api/properties/ping
 * Checks health of serverless API and validates URA connectivity if AccessKey is present.
 */
export default async function handler(req: any, res?: any) {
  const headerKey =
    req.headers?.['x-ura-access-key'] ||
    req.headers?.['accesskey'] ||
    (typeof req.query?.accessKey === 'string' ? req.query.accessKey : undefined);

  let uraStatus = 'not_configured';
  let uraMessage = 'URA_ACCESS_KEY not provided yet';

  try {
    const key = resolveUraAccessKey(headerKey);
    if (key) {
      await getDailyUraToken(key);
      uraStatus = 'connected';
      uraMessage = 'URA AccessKey verified and daily Token retrieved';
    }
  } catch (err: unknown) {
    uraStatus = 'key_invalid_or_unreachable';
    uraMessage = err instanceof Error ? err.message : 'Unable to verify URA token';
  }

  const payload = {
    status: 'ok',
    serverless: 'active',
    uraService: {
      status: uraStatus,
      message: uraMessage,
    },
    timestamp: new Date().toISOString(),
  };

  if (res?.status) return res.status(200).json(payload);
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
