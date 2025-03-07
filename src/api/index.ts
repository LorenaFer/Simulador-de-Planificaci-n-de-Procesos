import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import { cors } from 'hono/cors';
import { Context } from 'hono';
import apiRouter from './routes/api.routes.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Create and configure the Hono app
 */
export const createApp = () => {
  const app = new Hono();
  
  // Add global middlewares
  app.use('*', honoLogger());
  app.use('*', cors());
  
  // Mount API routes
  app.route('/api', apiRouter);
  
  // Default 404 handler
  app.notFound((c: Context) => {
    return c.json({
      status: 'error',
      message: 'Not Found',
      path: c.req.path,
    }, 404);
  });
  
  // Default error handler
  app.onError((err: Error, c: Context) => {
    logger.error('Unhandled error', err);
    return c.json({
      status: 'error',
      message: 'Internal Server Error',
    }, 500);
  });
  
  return app;
};

export default createApp; 