import { Process } from '../models/process.model.js';
import { SchedulerInterface } from './scheduler.interface.js';
import { FCFSScheduler } from './non_expulsives/fcfs.js';
import { SJFScheduler } from './non_expulsives/sjf.js';
import { RandomScheduler } from './non_expulsives/random.js';
import { PriorityScheduler } from './non_expulsives/priority.js';
import { PriorityPreemptiveScheduler } from './explusive/priority_p.js';
import { RoundRobinScheduler } from './explusive/round_robin.js';
import { SRTFScheduler } from './explusive/srtf.js';

/**
 * Enum defining the available scheduling algorithm types
 */
export enum SchedulerType {
  FCFS = 'FCFS',           // First-Come, First-Served
  SJF = 'SJF',             // Shortest Job First (non-preemptive)
  SRTF = 'SRTF',           // Shortest Remaining Time First (preemptive)
  RR = 'RR',               // Round Robin
  PRIORITY = 'PRIORITY',   // Priority Scheduling (non-preemptive)
  PRIORITY_P = 'PRIORITY_P', // Priority Scheduling (preemptive)
  RANDOM = 'RANDOM'        // Random Selection (Selección aleatoria)
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
      
      case SchedulerType.RANDOM:
        return new RandomScheduler(processes);
      
      case SchedulerType.PRIORITY:
        return new PriorityScheduler(processes);
        
      case SchedulerType.PRIORITY_P:
        return new PriorityPreemptiveScheduler(processes);
        
      case SchedulerType.RR:
        const timeQuantum = config?.timeQuantum || 2;
        return new RoundRobinScheduler(processes, timeQuantum);
        
      case SchedulerType.SRTF:
        return new SRTFScheduler(processes);
      
      default:
        // For now, fallback to FCFS for unimplemented schedulers
        console.warn(`Scheduler type ${type} not implemented yet. Using FCFS instead.`);
        return new FCFSScheduler(processes);
    }
  }
} 