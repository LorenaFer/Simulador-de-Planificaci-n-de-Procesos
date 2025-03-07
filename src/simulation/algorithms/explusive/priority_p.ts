import { Process, ProcessState } from '../../models/process.model.js';
import { BaseScheduler } from '../base-scheduler.js';
import logger from '../../../utils/logger.js';

/**
 * Priority Scheduling algorithm (preemptive)
 * Preemptive algorithm that selects the process with the highest priority (lowest priority value)
 * If a new process arrives with a higher priority than the currently running process,
 * the current process is preempted (moved back to ready queue) and the new process starts running.
 */
export class PriorityPreemptiveScheduler extends BaseScheduler {
  /**
   * Create a new Priority Preemptive scheduler
   * @param processes Array of processes to schedule
   */
  constructor(processes: Process[]) {
    super([...processes], 'Priority-Preemptive');
  }

  /**
   * Check if there are any processes in the ready queue with higher priority
   * than the currently running process
   * @returns True if a process with higher priority exists
   */
  private hasHigherPriorityProcess(): boolean {
    if (!this.currentProcess) return false;
    
    // Find the process with highest priority in the ready queue
    let highestPriorityProcess = this.readyQueue.reduce((highest, current) => {
      if (current.priority < highest.priority) {
        return current;
      }
      if (current.priority === highest.priority && current.arrivalTime < highest.arrivalTime) {
        return current;
      }
      return highest;
    }, this.readyQueue[0]);
    
    // If there's no process in the ready queue, return false
    if (!highestPriorityProcess) return false;
    
    // Return true if the highest priority process has higher priority than the current process
    return highestPriorityProcess.priority < this.currentProcess.priority;
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
    
    // Check if we need to preempt the current process
    if (this.currentProcess && this.hasHigherPriorityProcess()) {
      logger.debug(`Process ${this.currentProcess.name} preempted at time ${this.time}`);
      this.currentProcess.updateState(ProcessState.READY);
      this.readyQueue.push(this.currentProcess);
      this.currentProcess = null;
    }
    
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
      }
    }
    
    // Check if all processes are completed
    return this.completed.length === this.processes.length;
  }
} 