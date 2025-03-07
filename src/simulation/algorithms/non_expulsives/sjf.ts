import { Process, ProcessState } from '../../models/process.model.js';
import { BaseScheduler } from '../base-scheduler.js';
import logger from '../../../utils/logger.js';

/**
 * Shortest Job First (SJF) scheduling algorithm
 * Non-preemptive algorithm that selects the waiting process with the smallest burst time
 * Also known as Shortest Process Next (SPN)
 */
export class SJFScheduler extends BaseScheduler {
  /**
   * Create a new SJF scheduler
   * @param processes Array of processes to schedule
   */
  constructor(processes: Process[]) {
    super([...processes], 'SJF');
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
    
    // If no current process is running, get the one with shortest burst time
    if (!this.currentProcess && this.readyQueue.length > 0) {
      // Sort ready queue by burst time (or remaining time for partially executed processes)
      this.readyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
      
      // Select the process with shortest burst time
      this.currentProcess = this.readyQueue.shift() || null;
      if (this.currentProcess) {
        this.currentProcess.updateState(ProcessState.RUNNING);
        logger.debug(`Process ${this.currentProcess.name} (burst time: ${this.currentProcess.remainingTime}) started execution at time ${this.time}`);
      }
    }
    
    // Update waiting time for processes in the ready queue
    this.updateWaitingTimes();
    
    // Execute the current process if there is one
    if (this.currentProcess) {
      const isCompleted = this.currentProcess.execute();
      
      if (isCompleted) {
        // Process has completed execution
        this.currentProcess.complete(this.time);
        logger.debug(`Process ${this.currentProcess.name} completed at time ${this.time}`);
        
        this.completed.push(this.currentProcess);
        this.currentProcess = null;
        
        // Get the next process from the ready queue (will be sorted in next tick)
        if (this.readyQueue.length > 0) {
          // Sort ready queue by burst time
          this.readyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
          
          this.currentProcess = this.readyQueue.shift() || null;
          if (this.currentProcess) {
            this.currentProcess.updateState(ProcessState.RUNNING);
            logger.debug(`Process ${this.currentProcess.name} (burst time: ${this.currentProcess.remainingTime}) started execution at time ${this.time}`);
          }
        }
      }
    }
    
    // Check if all processes are completed
    return this.completed.length === this.processes.length;
  }
} 