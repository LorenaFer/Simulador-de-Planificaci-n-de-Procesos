import { serve } from '@hono/node-server';
import createApp from './api/index.js';
import logger from './utils/logger.js';
import config from './config/index.js';

// Create the Hono app
const app = createApp();

// Start the server
const port = config.server.port;

serve({
  fetch: app.fetch,
  port,
}, (info: { port: number }) => {
  logger.info(`Server is running on http://localhost:${info.port}`);
  logger.info(`Environment: ${config.env.NODE_ENV}`);
});

// Handle graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, () => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    process.exit(0);
  });
}); 