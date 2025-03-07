import { Hono } from 'hono';
import { healthCheck } from '../controllers/health.controller.js';
import { runSimulation, getAlgorithms } from '../controllers/scheduler.controller.js';
import { apiKeyAuth } from '../middlewares/auth.middleware.js';

/**
 * API routes
 */
const apiRouter = new Hono();

// Public health check endpoint
apiRouter.get('/health', healthCheck);

// Protected health check endpoint (requires API key)
apiRouter.get('/health/secure', apiKeyAuth, healthCheck);

// Scheduler endpoints
apiRouter.get('/scheduler/algorithms', getAlgorithms);
apiRouter.post('/scheduler/simulate', runSimulation);

// Future endpoints will be added here

export default apiRouter; 