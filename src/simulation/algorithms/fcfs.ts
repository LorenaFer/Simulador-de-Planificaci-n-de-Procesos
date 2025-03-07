import { Process, ProcessState } from '../models/process.model.js';
import logger from '../../utils/logger.js';

/**
 * First-Come, First-Served (FCFS) scheduling algorithm
 * Processes are executed in order of their arrival time
 */
export class FCFSScheduler {
  private readyQueue: Process[] = [];
  private currentProcess: Process | null = null;
  private completed: Process[] = [];
  private time = 0;

  constructor(private processes: Process[]) {
    // Sort processes by arrival time to ensure FCFS ordering
    this.processes = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    logger.debug('FCFS scheduler initialized', { processCount: processes.length });
  }

  /**
   * Process one time unit in the simulation
   * @returns True if all processes are completed, false otherwise
   */
  tick(): boolean {
    // Update current time
    this.time++;
    
    // Check for newly arrived processes
    this.checkArrivals();
    
    // If no current process is running, get one from the ready queue
    if (!this.currentProcess && this.readyQueue.length > 0) {
      this.currentProcess = this.readyQueue.shift() || null;
      if (this.currentProcess) {
        this.currentProcess.updateState(ProcessState.RUNNING);
        logger.debug(`Process ${this.currentProcess.name} started execution at time ${this.time}`);
      }
    }
    
    // Update waiting time for processes in the ready queue
    for (const process of this.readyQueue) {
      process.updateWaitingTime(1);
    }
    
    // Execute the current process if there is one
    if (this.currentProcess) {
      const isCompleted = this.currentProcess.execute();
      
      if (isCompleted) {
        // Process has completed execution
        this.currentProcess.complete(this.time);
        logger.debug(`Process ${this.currentProcess.name} completed at time ${this.time}`);
        
        this.completed.push(this.currentProcess);
        this.currentProcess = null;
        
        // Get the next process from the ready queue
        if (this.readyQueue.length > 0) {
          this.currentProcess = this.readyQueue.shift() || null;
          if (this.currentProcess) {
            this.currentProcess.updateState(ProcessState.RUNNING);
            logger.debug(`Process ${this.currentProcess.name} started execution at time ${this.time}`);
          }
        }
      }
    }
    
    // Check if all processes are completed
    return this.completed.length === this.processes.length;
  }
  
  /**
   * Check for newly arrived processes and add them to the ready queue
   */
  private checkArrivals(): void {
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
   * Run the simulation until all processes are completed
   * @param maxIterations - Maximum number of time units to simulate
   * @returns The completed processes with their statistics
   */
  runSimulation(maxIterations = 1000): Process[] {
    logger.info('Starting FCFS simulation');
    
    let iterations = 0;
    let allCompleted = false;
    
    while (!allCompleted && iterations < maxIterations) {
      allCompleted = this.tick();
      iterations++;
    }
    
    if (iterations >= maxIterations) {
      logger.warn(`FCFS simulation reached maximum iterations (${maxIterations})`);
    } else {
      logger.info(`FCFS simulation completed in ${iterations} time units`);
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
    ];
  }
  
  /**
   * Get the current simulation time
   */
  getCurrentTime(): number {
    return this.time;
  }
} 