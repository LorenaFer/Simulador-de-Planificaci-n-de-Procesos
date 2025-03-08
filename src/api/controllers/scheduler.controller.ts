import { Context } from 'hono';
import logger from '../../utils/logger.js';
import { Process, ProcessState } from '../../simulation/models/process.model.js';
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
    const totalTime = scheduler.getCurrentTime();
    
    // Calculate statistics
    const totalBurstTime = result.reduce((sum, p) => sum + p.burstTime, 0);
    const avgWaitingTime = result.reduce((sum, p) => sum + p.waitingTime, 0) / result.length;
    const avgTurnaroundTime = result.reduce((sum, p) => sum + p.turnaroundTime, 0) / result.length;
    const avgResponseTime = result.reduce((sum, p) => sum + (p.responseTime || 0), 0) / result.length;
    const cpuUtilization = (totalBurstTime / totalTime) * 100;
    
    // Group processes by arrival time to calculate arrival rate
    const processArrivals: Record<number, number> = {};
    processes.forEach(p => {
      processArrivals[p.arrivalTime] = (processArrivals[p.arrivalTime] || 0) + 1;
    });
    
    const avgArrivalsPerStep = processes.length / (Math.max(...Object.keys(processArrivals).map(Number)) + 1);
    
    // Return the simulation results with enhanced statistics
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
      statistics: {
        totalProcesses: result.length,
        totalTime,
        cpuUtilization: cpuUtilization.toFixed(2),
        avgWaitingTime: avgWaitingTime.toFixed(2),
        avgTurnaroundTime: avgTurnaroundTime.toFixed(2),
        avgResponseTime: avgResponseTime.toFixed(2),
        avgArrivalsPerStep: avgArrivalsPerStep.toFixed(2),
        throughput: (result.length / totalTime).toFixed(2),
      }
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