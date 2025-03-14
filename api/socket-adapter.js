import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

// Redis configuration for Socket.io persistence
// Required for Vercel's serverless environment
export function createSocketAdapter(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://frontend-os-iota.vercel.app', process.env.VERCEL_URL || '']
        : '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling']
  });

  // If Redis URL is provided, use Redis adapter for multi-instance support
  if (process.env.REDIS_URL) {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    // Connect to Redis
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log('Socket.IO connected to Redis adapter');
    }).catch(err => {
      console.error('Could not connect to Redis:', err);
    });
  } else {
    console.log('Redis URL not provided, using in-memory adapter (not recommended for production)');
  }

  return io;
} 