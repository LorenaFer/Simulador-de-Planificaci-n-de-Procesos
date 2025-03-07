import { Process, ProcessState } from '../models/process.model.js';
import { SchedulerInterface } from './scheduler.interface.js';
import logger from '../../utils/logger.js';

/**
 * Abstract base class for all scheduling algorithms
 * Implements common functionality and provides hooks for algorithm-specific logic
 */
export abstract class BaseScheduler implements SchedulerInterface {
  protected readyQueue: Process[] = [];
  protected currentProcess: Process | null = null;
  protected completed: Process[] = [];
  protected time = 0;

  /**
   * Constructor for the base scheduler
   * @param processes Array of processes to schedule
   * @param name Name of the scheduling algorithm
   */
  constructor(
    protected processes: Process[],
    protected readonly name: string
  ) {
    logger.debug(`${name} scheduler initialized`, { processCount: processes.length });
  }

  /**
   * Process one time unit in the simulation
   * This method is abstract and must be implemented by concrete schedulers
   * @returns True if all processes are completed, false otherwise
   */
  abstract tick(): boolean;

  /**
   * Check for newly arrived processes and add them to the ready queue
   * Common functionality across most scheduling algorithms
   */
  protected checkArrivals(): void {
    for (const process of this.processes) {
      if (
        process.state === ProcessState.NEW && 
        process.arrivalTime <= this.time
      ) {
        process.updateState(ProcessState.READY);
        this.readyQueue.push(process);
        logger.debug(`Process ${process.name} arrived at time ${this.time}`);
      }
    }
  }
  
  /**
   * Update waiting time for processes in the ready queue
   * Common functionality across most scheduling algorithms
   */
  protected updateWaitingTimes(): void {
    for (const process of this.readyQueue) {
      process.updateWaitingTime(1);
    }
  }

  /**
   * Run the simulation until all processes are completed
   * @param maxIterations - Maximum number of time units to simulate
   * @returns The completed processes with their statistics
   */
  runSimulation(maxIterations = 1000): Process[] {
    logger.info(`Starting ${this.name} simulation`);
    
    let iterations = 0;
    let allCompleted = false;
    
    while (!allCompleted && iterations < maxIterations) {
      allCompleted = this.tick();
      iterations++;
    }
    
    if (iterations >= maxIterations) {
      logger.warn(`${this.name} simulation reached maximum iterations (${maxIterations})`);
    } else {
      logger.info(`${this.name} simulation completed in ${iterations} time units`);
    }
    
    return this.completed;
  }
  
  /**
   * Get all processes, including those currently in progress
   */
  getAllProcesses(): Process[] {
    return [
      ...this.completed,
      ...(this.currentProcess ? [this.currentProcess] : []),
      ...this.readyQueue,
      ...this.processes.filter(p => p.state === ProcessState.NEW)
    ];
  }
  
  /**
   * Get the current simulation time
   */
  getCurrentTime(): number {
    return this.time;
  }
  
  /**
   * Get the name of the scheduling algorithm
   */
  getAlgorithmName(): string {
    return this.name;
  }
} 