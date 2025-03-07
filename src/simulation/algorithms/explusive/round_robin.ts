import { Process, ProcessState } from '../../models/process.model.js';
import { BaseScheduler } from '../base-scheduler.js';
import logger from '../../../utils/logger.js';

/**
 * Round Robin (RR) scheduling algorithm
 * Preemptive time-sharing algorithm that allocates a fixed time quantum to each process
 * When a process uses its time quantum, it's moved to the back of the ready queue
 * Also known as "Turno rotativo"
 */
export class RoundRobinScheduler extends BaseScheduler {
  private timeQuantum: number;
  private timeSliceRemaining: number;

  /**
   * Create a new Round Robin scheduler
   * @param processes Array of processes to schedule
   * @param timeQuantum Time slice allocated to each process
   */
  constructor(processes: Process[], timeQuantum = 2) {
    super([...processes], 'Round-Robin');
    this.timeQuantum = timeQuantum;
    this.timeSliceRemaining = 0;
    logger.debug(`Round Robin scheduler initialized with time quantum: ${timeQuantum}`);
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
        this.timeSliceRemaining = this.timeQuantum;
        logger.debug(`Process ${this.currentProcess.name} started execution at time ${this.time}, time quantum: ${this.timeQuantum}`);
      }
    }
    
    // Update waiting time for processes in the ready queue
    this.updateWaitingTimes();
    
    // Execute the current process if there is one
    if (this.currentProcess) {
      // Decrement time slice remaining
      this.timeSliceRemaining--;
      
      // Execute the process for one time unit
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
            this.timeSliceRemaining = this.timeQuantum;
            logger.debug(`Process ${this.currentProcess.name} started execution at time ${this.time}, time quantum: ${this.timeQuantum}`);
          }
        }
      } else if (this.timeSliceRemaining <= 0) {
        // Time quantum expired, move the process to the back of the ready queue
        logger.debug(`Process ${this.currentProcess.name} time quantum expired at time ${this.time}`);
        
        // Change state back to READY
        this.currentProcess.updateState(ProcessState.READY);
        
        // If there are other processes waiting, add current process to the back of the queue
        if (this.readyQueue.length > 0) {
          this.readyQueue.push(this.currentProcess);
          this.currentProcess = this.readyQueue.shift() || null;
          
          if (this.currentProcess) {
            this.currentProcess.updateState(ProcessState.RUNNING);
            this.timeSliceRemaining = this.timeQuantum;
            logger.debug(`Process ${this.currentProcess.name} started execution at time ${this.time}, time quantum: ${this.timeQuantum}`);
          }
        } else {
          // If no other process, continue with the current one
          this.timeSliceRemaining = this.timeQuantum;
          logger.debug(`Process ${this.currentProcess.name} continues execution (no other processes in ready queue) at time ${this.time}`);
        }
      }
    }
    
    // Check if all processes are completed
    return this.completed.length === this.processes.length;
  }
} 