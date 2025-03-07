import { Process } from '../models/process.model.js';

/**
 * Interface for all scheduling algorithms
 * Defines the common methods that all schedulers must implement
 */
export interface SchedulerInterface {
  /**
   * Process one time unit in the simulation
   * @returns True if all processes are completed, false otherwise
   */
  tick(): boolean;
  
  /**
   * Run the simulation until all processes are completed or max iterations reached
   * @param maxIterations - Maximum number of time units to simulate
   * @returns The completed processes with their statistics
   */
  runSimulation(maxIterations?: number): Process[];
  
  /**
   * Get all processes, including those currently in progress
   * @returns Array of all processes in the simulation
   */
  getAllProcesses(): Process[];
  
  /**
   * Get the current simulation time
   * @returns Current time unit in the simulation
   */
  getCurrentTime(): number;
} 