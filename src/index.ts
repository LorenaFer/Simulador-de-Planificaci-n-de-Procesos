import { createServer } from 'http';
import { Hono } from 'hono';
import createApp from './api/index.js';
import SocketService from './socket/socket.service.js';
import logger from './utils/logger.js';
import config from './config/index.js';

// Create the Hono app
const app = createApp();

// Create an HTTP server
const httpServer = createServer();

// Setup route handler for the HTTP server
httpServer.on('request', async (req, res) => {
  // Add CORS headers directly to all responses
  // In production, allow requests from the specific frontend URL or dynamic origin as fallback
  const productionFrontendUrl = 'https://frontend-os-iota.vercel.app';
  const allowedOrigin = config.env.NODE_ENV === 'production' 
    ? (req.headers.origin === productionFrontendUrl ? productionFrontendUrl : req.headers.origin || '*')
    : 'http://localhost:3000';
    
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS preflight requests directly
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Convert Node.js request to fetch Request
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  
  // Read request body if present
  let body = null;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    if (chunks.length > 0) {
      body = Buffer.concat(chunks);
    }
  }
  
  // Create fetch Request
  const fetchRequest = new Request(url, {
    method: req.method,
    headers: req.headers as any,
    body
  });
  
  try {
    // Process with Hono
    const fetchResponse = await app.fetch(fetchRequest);
    
    // Convert fetch Response to Node.js response
    res.statusCode = fetchResponse.status;
    fetchResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Stream the response body
    if (fetchResponse.body) {
      const reader = fetchResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error: unknown) {
    logger.error('Error processing request', error instanceof Error ? error : new Error(String(error)));
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

// Initialize Socket.IO service with the HTTP server
const socketService = new SocketService(httpServer);

// Start the server
const port = config.server.port;

httpServer.listen(port, '0.0.0.0', () => {
  logger.info(`Server is running on http://localhost:${port}`);
  logger.info(`Environment: ${config.env.NODE_ENV}`);
  logger.info('WebSocket server initialized');
});

// Handle graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, () => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    httpServer.close(() => {
      process.exit(0);
    });
  });
}); 