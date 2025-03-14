import { createServer } from 'http';
import { serve } from '@hono/node-server';
import createApp from '../dist/api/index.js';
import SocketService from '../dist/socket/socket.service.js';
import config from '../dist/config/index.js';
import { createSocketAdapter } from './socket-adapter.js';

// Initialize the HTTP server
const httpServer = createServer();

// Create the Hono app
const app = createApp();

// Initialize Socket.IO with the HTTP server using the adapter
const io = createSocketAdapter(httpServer);
const socketService = new SocketService(httpServer, io);

// Serve the Hono app with the HTTP server
serve({
  fetch: app.fetch,
  port: process.env.PORT || config.server.port || 3001,
  server: httpServer
});

// For Vercel, export a request handler
export default async function handler(req, res) {
  // Add CORS headers directly to all responses
  const productionFrontendUrl = 'https://frontend-os-iota.vercel.app';
  const allowedOrigin = process.env.NODE_ENV === 'production' 
    ? (req.headers.origin === productionFrontendUrl ? productionFrontendUrl : req.headers.origin || '*')
    : '*';
    
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS preflight requests directly
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    // Convert Node.js request to fetch Request
    const url = new URL(req.url, `https://${req.headers.host}`);
    
    // Create fetch Request
    const fetchRequest = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.body
    });
    
    // Process with Hono
    const fetchResponse = await app.fetch(fetchRequest);
    
    // Convert fetch Response to Vercel response
    res.status(fetchResponse.status);
    fetchResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Return the response body
    const responseBody = await fetchResponse.text();
    res.send(responseBody);
  } catch (error) {
    console.error('Error processing request', error);
    res.status(500).send('Internal Server Error');
  }
} 