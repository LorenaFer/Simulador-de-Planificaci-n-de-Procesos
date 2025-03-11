import { Context, Next } from 'hono';
import config from '../../config/index.js';

/**
 * CORS middleware for cross-origin requests - disabled for debugging
 */
export const corsMiddleware = async (c: Context, next: Next) => {
  // Allow all origins and methods
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', '*');
  c.header('Access-Control-Allow-Headers', '*');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  
  await next();
}; 