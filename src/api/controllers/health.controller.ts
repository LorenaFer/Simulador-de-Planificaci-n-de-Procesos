import { Context } from 'hono';
import logger from '../../utils/logger.js';

/**
 * Health check controller
 */
export const healthCheck = (c: Context) => {
  logger.debug('Health check requested');
  
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'process-scheduler-simulator',
    version: '1.0.0',
  }, 200);
}; 