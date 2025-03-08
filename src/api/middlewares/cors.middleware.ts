import { Context, Next } from 'hono';
import config from '../../config/index.js';

/**
 * CORS middleware for cross-origin requests
 */
export const corsMiddleware = async (c: Context, next: Next) => {
  // Get the origin from the request
  const origin = c.req.header('Origin') || '*';
  
  // Access control headers
  c.header('Access-Control-Allow-Origin', origin);
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  
  await next();
}; 