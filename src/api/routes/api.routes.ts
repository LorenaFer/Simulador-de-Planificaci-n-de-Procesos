import { Hono } from 'hono';
import { healthCheck } from '../controllers/health.controller.js';
import { runSimulation, getAlgorithms } from '../controllers/scheduler.controller.js';
import { generateRandomProcesses, getAlgorithmDescriptions, getProcessParameterInfo } from '../controllers/process.controller.js';
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

// Process generation endpoints
apiRouter.get('/processes/random', generateRandomProcesses);
apiRouter.get('/algorithms/descriptions', getAlgorithmDescriptions);
apiRouter.get('/processes/parameters', getProcessParameterInfo);

// Future endpoints will be added here

export default apiRouter; 