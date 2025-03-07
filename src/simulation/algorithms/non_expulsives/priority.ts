import { Process, ProcessState } from '../../models/process.model.js';
import { BaseScheduler } from '../base-scheduler.js';
import logger from '../../../utils/logger.js';

/**
 * Priority Scheduling algorithm (non-preemptive)
 * Non-preemptive algorithm that selects the process with the highest priority (lowest priority value)
 * Also known as "Planificación basada en prioridades"
 */
export class PriorityScheduler extends BaseScheduler {
  /**
   * Create a new Priority scheduler
   * @param processes Array of processes to schedule
   */
  constructor(processes: Process[]) {
    super([...processes], 'Priority');
  }

  /**
   * Sort the ready queue by priority (lowest value first)
   * If two processes have the same priority, the one that arrived earlier is selected (FCFS as tie-breaker)
   */
  private sortReadyQueue(): void {
    this.readyQueue.sort((a, b) => {
      // First sort by priority (lower value = higher priority)
      const priorityDiff = a.priority - b.priority;
      
      // If priorities are equal, sort by arrival time
      if (priorityDiff === 0) {
        return a.arrivalTime - b.arrivalTime;
      }
      
      return priorityDiff;
    });
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
    
    // If no current process is running, get the one with highest priority
    if (!this.currentProcess && this.readyQueue.length > 0) {
      // Sort ready queue by priority
      this.sortReadyQueue();
      
      // Select the process with highest priority (lowest priority value)
      this.currentProcess = this.readyQueue.shift() || null;
      if (this.currentProcess) {
        this.currentProcess.updateState(ProcessState.RUNNING);
        logger.debug(`Process ${this.currentProcess.name} (priority: ${this.currentProcess.priority}) started execution at time ${this.time}`);
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
          // Sort ready queue by priority
          this.sortReadyQueue();
          
          this.currentProcess = this.readyQueue.shift() || null;
          if (this.currentProcess) {
            this.currentProcess.updateState(ProcessState.RUNNING);
            logger.debug(`Process ${this.currentProcess.name} (priority: ${this.currentProcess.priority}) started execution at time ${this.time}`);
          }
        }
      }
    }
    
    // Check if all processes are completed
    return this.completed.length === this.processes.length;
  }
} 