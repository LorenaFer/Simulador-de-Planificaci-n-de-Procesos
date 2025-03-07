import { Process, ProcessState } from '../../models/process.model.js';
import { BaseScheduler } from '../base-scheduler.js';
import logger from '../../../utils/logger.js';

/**
 * Shortest Remaining Time First (SRTF) scheduling algorithm
 * Preemptive version of SJF that selects the process with the shortest remaining time
 * If a new process arrives with a shorter remaining time than the current process,
 * the current process is preempted
 * Also known as Shortest Remaining Job First (SRJF)
 */
export class SRTFScheduler extends BaseScheduler {
  /**
   * Create a new SRTF scheduler
   * @param processes Array of processes to schedule
   */
  constructor(processes: Process[]) {
    super([...processes], 'SRTF');
  }

  /**
   * Check if there are any processes in the ready queue with shorter
   * remaining time than the currently running process
   * @returns True if a process with shorter remaining time exists
   */
  private hasShorterRemainingTimeProcess(): boolean {
    if (!this.currentProcess) return false;
    
    // Find the process with shortest remaining time in the ready queue
    let shortestProcess = this.readyQueue.reduce((shortest, current) => {
      if (current.remainingTime < shortest.remainingTime) {
        return current;
      }
      if (current.remainingTime === shortest.remainingTime && current.arrivalTime < shortest.arrivalTime) {
        return current;
      }
      return shortest;
    }, this.readyQueue[0]);
    
    // If there's no process in the ready queue, return false
    if (!shortestProcess) return false;
    
    // Return true if the shortest process has shorter remaining time than the current process
    return shortestProcess.remainingTime < this.currentProcess.remainingTime;
  }

  /**
   * Sort the ready queue by remaining time (shortest first)
   * If two processes have the same remaining time, the one that arrived earlier is selected
   */
  private sortReadyQueue(): void {
    this.readyQueue.sort((a, b) => {
      // First sort by remaining time
      const remainingTimeDiff = a.remainingTime - b.remainingTime;
      
      // If remaining times are equal, sort by arrival time
      if (remainingTimeDiff === 0) {
        return a.arrivalTime - b.arrivalTime;
      }
      
      return remainingTimeDiff;
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
    if (this.currentProcess && this.hasShorterRemainingTimeProcess()) {
      logger.debug(`Process ${this.currentProcess.name} preempted at time ${this.time}`);
      this.currentProcess.updateState(ProcessState.READY);
      this.readyQueue.push(this.currentProcess);
      this.currentProcess = null;
    }
    
    // If no current process is running, get the one with shortest remaining time
    if (!this.currentProcess && this.readyQueue.length > 0) {
      // Sort ready queue by remaining time
      this.sortReadyQueue();
      
      // Select the process with shortest remaining time
      this.currentProcess = this.readyQueue.shift() || null;
      if (this.currentProcess) {
        this.currentProcess.updateState(ProcessState.RUNNING);
        logger.debug(`Process ${this.currentProcess.name} (remaining time: ${this.currentProcess.remainingTime}) started execution at time ${this.time}`);
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