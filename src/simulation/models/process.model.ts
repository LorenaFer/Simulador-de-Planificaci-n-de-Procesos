import { generateId } from '../../utils/helpers.js';

/**
 * Process states in the simulation
 */
export enum ProcessState {
  NEW = 'NEW',
  READY = 'READY',
  RUNNING = 'RUNNING',
  WAITING = 'WAITING',
  TERMINATED = 'TERMINATED',
}

/**
 * Input configuration for creating a process
 */
export interface ProcessConfig {
  name?: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

/**
 * Process statistics
 */
export interface ProcessStats {
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number;
  completionTime: number;
}

/**
 * Represents a process in the simulation
 */
export class Process {
  readonly id: string;
  readonly name: string;
  readonly arrivalTime: number;
  readonly burstTime: number;
  readonly priority: number;
  
  state: ProcessState;
  remainingTime: number;
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number | null;
  completionTime: number | null;
  firstRun: boolean;
  runningTimestamps: number[]; // Track timestamps when process enters running state
  
  constructor(config: ProcessConfig) {
    this.id = generateId();
    this.name = config.name || `Process-${this.id.substring(0, 4)}`;
    this.arrivalTime = config.arrivalTime;
    this.burstTime = config.burstTime;
    this.priority = config.priority || 0;
    
    // Initialize with default values
    this.state = ProcessState.NEW;
    this.remainingTime = this.burstTime;
    this.waitingTime = 0;
    this.turnaroundTime = 0;
    this.responseTime = null;
    this.completionTime = null;
    this.firstRun = true;
    this.runningTimestamps = [];
  }
  
  /**
   * Update the process state
   */
  updateState(newState: ProcessState, currentTime?: number): void {
    // If process is entering running state, record the timestamp
    if (newState === ProcessState.RUNNING && this.state !== ProcessState.RUNNING && currentTime !== undefined) {
      this.runningTimestamps.push(currentTime);
    }
    
    this.state = newState;
  }
  
  /**
   * Execute the process for one time unit
   * @returns True if process has completed execution, false otherwise
   */
  execute(timeQuantum: number = 1): boolean {
    if (this.state === ProcessState.RUNNING) {
      // For the first time the process runs, record the response time
      if (this.firstRun) {
        this.responseTime = this.waitingTime;
        this.firstRun = false;
      }
      
      // Execute for the given time quantum or until completion
      const executionTime = Math.min(timeQuantum, this.remainingTime);
      this.remainingTime -= executionTime;
      
      // Check if process has completed
      if (this.remainingTime <= 0) {
        this.state = ProcessState.TERMINATED;
        return true;
      }
    }
    return false;
  }
  
  /**
   * Update waiting time while in READY state
   */
  updateWaitingTime(time: number): void {
    if (this.state === ProcessState.READY || this.state === ProcessState.WAITING) {
      this.waitingTime += time;
    }
  }
  
  /**
   * Complete the process and calculate final statistics
   */
  complete(currentTime: number): ProcessStats {
    this.state = ProcessState.TERMINATED;
    this.completionTime = currentTime;
    this.turnaroundTime = currentTime - this.arrivalTime;
    
    return {
      waitingTime: this.waitingTime,
      turnaroundTime: this.turnaroundTime,
      responseTime: this.responseTime || 0,
      completionTime: this.completionTime,
    };
  }
  
  /**
   * Create a copy of the process
   */
  clone(): Process {
    const clone = new Process({
      name: this.name,
      arrivalTime: this.arrivalTime,
      burstTime: this.burstTime,
      priority: this.priority,
    });
    
    clone.state = this.state;
    clone.remainingTime = this.remainingTime;
    clone.waitingTime = this.waitingTime;
    clone.turnaroundTime = this.turnaroundTime;
    clone.responseTime = this.responseTime;
    clone.completionTime = this.completionTime;
    clone.firstRun = this.firstRun;
    clone.runningTimestamps = [...this.runningTimestamps];
    
    return clone;
  }
  
  /**
   * Convert process to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      arrivalTime: this.arrivalTime,
      burstTime: this.burstTime,
      priority: this.priority,
      state: this.state,
      remainingTime: this.remainingTime,
      waitingTime: this.waitingTime,
      turnaroundTime: this.turnaroundTime,
      responseTime: this.responseTime,
      completionTime: this.completionTime,
      runningTimestamps: this.runningTimestamps,
    };
  }
} 