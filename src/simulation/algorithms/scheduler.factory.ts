import { Process } from '../models/process.model.js';
import { SchedulerInterface } from './scheduler.interface.js';
import { FCFSScheduler } from './non_expulsives/fcfs.js';
import { SJFScheduler } from './non_expulsives/sjf.js';

/**
 * Enum defining the available scheduling algorithm types
 */
export enum SchedulerType {
  FCFS = 'FCFS',           // First-Come, First-Served
  SJF = 'SJF',             // Shortest Job First (non-preemptive)
  SRTF = 'SRTF',           // Shortest Remaining Time First (preemptive)
  RR = 'RR',               // Round Robin
  PRIORITY = 'PRIORITY',   // Priority Scheduling (non-preemptive)
  PRIORITY_P = 'PRIORITY_P' // Priority Scheduling (preemptive)
}

/**
 * Optional configuration for schedulers
 */
export interface SchedulerConfig {
  timeQuantum?: number;    // Time quantum for Round Robin
  priorityAging?: boolean; // Whether to apply priority aging
}

/**
 * Factory class for creating scheduler instances
 */
export class SchedulerFactory {
  /**
   * Create a scheduler of the specified type
   * @param type The type of scheduler to create
   * @param processes The processes to schedule
   * @param config Optional configuration for the scheduler
   * @returns A scheduler implementation
   */
  static createScheduler(
    type: SchedulerType, 
    processes: Process[],
    config?: SchedulerConfig
  ): SchedulerInterface {
    switch (type) {
      case SchedulerType.FCFS:
        return new FCFSScheduler(processes);
        
      case SchedulerType.SJF:
        return new SJFScheduler(processes);
      
      // Other scheduler types will be implemented later
      case SchedulerType.SRTF:
      case SchedulerType.RR:
      case SchedulerType.PRIORITY:
      case SchedulerType.PRIORITY_P:
      default:
        // For now, fallback to FCFS for unimplemented schedulers
        console.warn(`Scheduler type ${type} not implemented yet. Using FCFS instead.`);
        return new FCFSScheduler(processes);
    }
  }
} 