import { Process, ProcessState } from '../../models/process.model.js';
import { BaseScheduler } from '../base-scheduler.js';
import logger from '../../../utils/logger.js';

/**
 * Random Selection scheduling algorithm
 * Non-preemptive algorithm that randomly selects a process from the ready queue
 * Also known as "Selección aleatoria"
 */
export class RandomScheduler extends BaseScheduler {
  /**
   * Create a new Random scheduler
   * @param processes Array of processes to schedule
   */
  constructor(processes: Process[]) {
    super([...processes], 'Random');
  }

  /**
   * Selects a random process from the ready queue
   * @returns The selected process or null if the queue is empty
   */
  private selectRandomProcess(): Process | null {
    if (this.readyQueue.length === 0) {
      return null;
    }
    
    // Get a random index from the ready queue
    const randomIndex = Math.floor(Math.random() * this.readyQueue.length);
    
    // Remove and return the randomly selected process
    return this.readyQueue.splice(randomIndex, 1)[0];
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
    
    // If no current process is running, get a random one from the ready queue
    if (!this.currentProcess && this.readyQueue.length > 0) {
      this.currentProcess = this.selectRandomProcess();
      
      if (this.currentProcess) {
        this.currentProcess.updateState(ProcessState.RUNNING);
        logger.debug(`Process ${this.currentProcess.name} randomly selected to run at time ${this.time}`);
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
        
        // If there are more processes in the ready queue, select the next one randomly
        if (this.readyQueue.length > 0) {
          this.currentProcess = this.selectRandomProcess();
          
          if (this.currentProcess) {
            this.currentProcess.updateState(ProcessState.RUNNING);
            logger.debug(`Process ${this.currentProcess.name} randomly selected to run at time ${this.time}`);
          }
        }
      }
    }
    
    // Check if all processes are completed
    return this.completed.length === this.processes.length;
  }
} 