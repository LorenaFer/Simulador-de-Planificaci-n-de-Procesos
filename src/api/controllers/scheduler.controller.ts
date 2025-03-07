import { Context } from 'hono';
import logger from '../../utils/logger.js';
import { Process } from '../../simulation/models/process.model.js';
import { SchedulerFactory, SchedulerType } from '../../simulation/algorithms/scheduler.factory.js';

/**
 * Run a scheduling algorithm simulation
 */
export const runSimulation = async (c: Context) => {
  try {
    // Parse the request body
    const body = await c.req.json();
    
    // Validate the request
    if (!body.algorithm || !body.processes || !Array.isArray(body.processes)) {
      return c.json({
        status: 'error',
        message: 'Invalid request. Required fields: algorithm, processes',
      }, 400);
    }
    
    // Validate algorithm type
    const algorithmType = body.algorithm.toUpperCase();
    if (!Object.values(SchedulerType).includes(algorithmType)) {
      return c.json({
        status: 'error',
        message: `Invalid algorithm type. Supported types: ${Object.values(SchedulerType).join(', ')}`,
      }, 400);
    }
    
    // Create process objects from request data
    const processes: Process[] = body.processes.map((p: any) => new Process({
      name: p.name,
      arrivalTime: p.arrivalTime || 0,
      burstTime: p.burstTime,
      priority: p.priority || 0,
    }));
    
    // Run the simulation
    logger.info(`Running ${algorithmType} simulation with ${processes.length} processes`);
    const scheduler = SchedulerFactory.createScheduler(
      algorithmType as SchedulerType,
      processes,
      body.config
    );
    
    const result = scheduler.runSimulation();
    
    // Return the simulation results
    return c.json({
      status: 'success',
      algorithm: algorithmType,
      results: result.map(p => ({
        id: p.id,
        name: p.name,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
        waitingTime: p.waitingTime,
        turnaroundTime: p.turnaroundTime,
        responseTime: p.responseTime,
        completionTime: p.completionTime,
      })),
      totalTime: scheduler.getCurrentTime(),
    }, 200);
  } catch (error: unknown) {
    logger.error('Error running simulation', error instanceof Error ? error : new Error(String(error)));
    return c.json({
      status: 'error',
      message: 'Failed to run simulation',
    }, 500);
  }
};

/**
 * Get information about available algorithms
 */
export const getAlgorithms = (c: Context) => {
  return c.json({
    status: 'success',
    algorithms: Object.values(SchedulerType),
  }, 200);
}; 