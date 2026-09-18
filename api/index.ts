import tokenHandler from './token';
import uraHandler from './ura';
import pingHandler from './properties/ping';

/**
 * Root Serverless Entry: /api
 * Dispatches to sub-handlers based on path or query.
 */
export default async function handler(req: any, res?: any) {
  const url = req.url || '';

  if (url.includes('/token')) {
    return tokenHandler(req, res);
  }

  if (url.includes('/ping')) {
    return pingHandler(req, res);
  }

  return uraHandler(req, res);
}
