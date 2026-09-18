import { resolveUraAccessKey, getDailyUraToken } from './ura-service';

/**
 * Serverless Route: GET /api/token
 * Trades the URA AccessKey for today's daily Token.
 */
export default async function handler(req: any, res?: any) {
  // Extract key from header or query or environment
  const headerKey =
    req.headers?.['x-ura-access-key'] ||
    req.headers?.['accesskey'] ||
    (typeof req.query?.accessKey === 'string' ? req.query.accessKey : undefined);

  try {
    const accessKey = resolveUraAccessKey(headerKey);
    const force = req.query?.force === 'true';
    const token = await getDailyUraToken(accessKey, force);

    const payload = {
      status: 'success',
      message: 'URA daily token active',
      token,
      timestamp: new Date().toISOString(),
    };

    if (res && typeof res.status === 'function') {
      return res.status(200).json(payload);
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve URA token';
    const errorPayload = {
      status: 'error',
      message,
      timestamp: new Date().toISOString(),
    };

    if (res && typeof res.status === 'function') {
      return res.status(400).json(errorPayload);
    }

    return new Response(JSON.stringify(errorPayload), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
