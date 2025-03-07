import { Context, Next } from 'hono';
import logger from '../../utils/logger.js';

/**
 * Simple API key authentication middleware
 * For demonstration purposes only
 */
export const apiKeyAuth = (c: Context, next: Next) => {
  const apiKey = c.req.header('X-API-Key');
  
  // For demo purposes, we're using a simple check
  // In a real app, you'd validate against stored keys
  if (!apiKey || apiKey !== 'test-api-key') {
    logger.warn('Invalid or missing API key', { path: c.req.path });
    return c.json({
      status: 'error',
      message: 'Unauthorized: Invalid or missing API key',
    }, 401);
  }
  
  return next();
}; 