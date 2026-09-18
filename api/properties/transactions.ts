import uraHandler from '../ura';

/**
 * Serverless Route: GET /api/properties/transactions
 * Direct route compatible with the app's default transactions client.
 */
export default async function handler(req: any, res?: any) {
  return uraHandler(req, res);
}
