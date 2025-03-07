import { Process, ProcessState } from '../../models/process.model.js';
import { BaseScheduler } from '../base-scheduler.js';
import logger from '../../../utils/logger.js';

/**
 * First-Come, First-Served (FCFS) scheduling algorithm
 * Processes are executed in order of their arrival time
 */
export class FCFSScheduler extends BaseScheduler {
  /**
   * Create a new FCFS scheduler
   * @param processes Array of processes to schedule
   */
  constructor(processes: Process[]) {
    // Sort processes by arrival time to ensure FCFS ordering
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    super(sortedProcesses, 'FCFS');
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
} 