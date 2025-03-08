import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import apiRouter from './routes/api.routes.js';
import { corsMiddleware } from './middlewares/cors.middleware.js';
import appLogger from '../utils/logger.js';

/**
 * Create and configure the Hono app
 */
export default function createApp() {
  const app = new Hono();
  
  // Global middleware
  app.use('*', honoLogger());
  app.use('*', corsMiddleware);
  
  // API routes
  app.route('/api', apiRouter);
  
  // Default route
  app.get('/', (c) => {
    return c.json({
      message: 'Process Scheduler API',
      documentation: '/api/docs',
      version: '1.0.0',
    });
  });
  
  // Not found handler
  app.notFound((c) => {
    return c.json({
      status: 'error',
      message: 'Not Found',
    }, 404);
  });
  
  // Error handler
  app.onError((err, c) => {
    appLogger.error('Unhandled error', err);
    return c.json({
      status: 'error',
      message: 'Internal Server Error',
    }, 500);
  });
  
  return app;
} 