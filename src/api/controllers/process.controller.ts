import { Context } from 'hono';
import logger from '../../utils/logger.js';
import { ProcessConfig } from '../../simulation/models/process.model.js';
import { SchedulerType } from '../../simulation/algorithms/scheduler.factory.js';

/**
 * Generate random processes for simulation
 */
export const generateRandomProcesses = (c: Context) => {
  try {
    const { count = 5, maxBurstTime = 10, maxIoBurstTime = 5, maxPriority = 10, maxArrivalTime = 10 } = c.req.query();
    
    const processCount = parseInt(count as string, 10);
    const maxBurst = parseInt(maxBurstTime as string, 10);
    const maxIoBurst = parseInt(maxIoBurstTime as string, 10);
    const maxPrio = parseInt(maxPriority as string, 10);
    const maxArrival = parseInt(maxArrivalTime as string, 10);
    
    if (isNaN(processCount) || processCount <= 0 || processCount > 100) {
      return c.json({
        status: 'error',
        message: 'Invalid process count. Must be between 1 and 100',
      }, 400);
    }
    
    const processes: ProcessConfig[] = Array.from({ length: processCount }, (_, i) => {
      const burstTime = Math.floor(Math.random() * maxBurst) + 1; // Min burst time is 1
      return {
        name: `Process-${i + 1}`,
        arrivalTime: Math.floor(Math.random() * maxArrival),
        burstTime: burstTime,
        ioBurstTime: Math.floor(Math.random() * maxIoBurst),
        priority: Math.floor(Math.random() * maxPrio) + 1,
      };
    });
    
    return c.json({
      status: 'success',
      processes,
    }, 200);
  } catch (error: unknown) {
    logger.error('Error generating random processes', error instanceof Error ? error : new Error(String(error)));
    return c.json({
      status: 'error',
      message: 'Failed to generate random processes',
    }, 500);
  }
};

/**
 * Get algorithm descriptions for the frontend
 */
export const getAlgorithmDescriptions = (c: Context) => {
  const descriptions = {
    [SchedulerType.FCFS]: {
      name: "First-Come, First-Served (FCFS)",
      description: "A non-preemptive scheduling algorithm that executes processes in the order they arrive in the ready queue. The process that arrives first gets executed first. Simple but can lead to the 'convoy effect' where short processes wait behind long ones.",
      type: "non-preemptive",
      parameters: []
    },
    [SchedulerType.SJF]: {
      name: "Shortest Job First (SJF)",
      description: "A non-preemptive scheduling algorithm that selects the process with the shortest burst time to execute next. Optimal for minimizing average waiting time but requires knowing the burst time in advance.",
      type: "non-preemptive",
      parameters: []
    },
    [SchedulerType.SRTF]: {
      name: "Shortest Remaining Time First (SRTF)",
      description: "A preemptive version of SJF that selects the process with the shortest remaining execution time. If a new process arrives with a shorter burst time than the remaining time of the current process, the current process is preempted.",
      type: "preemptive",
      parameters: []
    },
    [SchedulerType.RR]: {
      name: "Round Robin (RR)",
      description: "A preemptive scheduling algorithm that allocates a fixed time quantum to each process in a circular manner. Once a process uses its time quantum, it's moved to the back of the ready queue to wait for its next turn.",
      type: "preemptive",
      parameters: [
        {
          name: "timeQuantum",
          description: "The maximum time a process can execute before being preempted",
          type: "number",
          default: 2
        }
      ]
    },
    [SchedulerType.PRIORITY]: {
      name: "Priority Scheduling",
      description: "A non-preemptive scheduling algorithm that selects the process with the highest priority to execute next. Priorities are assigned to processes externally, with lower numbers typically representing higher priority.",
      type: "non-preemptive",
      parameters: []
    },
    [SchedulerType.PRIORITY_P]: {
      name: "Priority Scheduling (Preemptive)",
      description: "A preemptive version of Priority Scheduling that preempts the current process if a higher priority process arrives.",
      type: "preemptive",
      parameters: []
    },
    [SchedulerType.RANDOM]: {
      name: "Random Selection",
      description: "A non-preemptive scheduling algorithm that randomly selects a process from the ready queue to execute next. Used primarily for demonstrating the impact of randomness in scheduling decisions.",
      type: "non-preemptive",
      parameters: []
    }
  };
  
  return c.json({
    status: 'success',
    descriptions,
  }, 200);
};

/**
 * Get parameter explanations for process generation
 */
export const getProcessParameterInfo = (c: Context) => {
  const parameterInfo = {
    burstTime: {
      name: "Burst Time",
      description: "The total CPU time required by the process to complete its execution. Measured in time units."
    },
    ioBurstTime: {
      name: "I/O Burst Time",
      description: "The time a process spends performing I/O operations. During this time, the CPU can execute other processes."
    },
    arrivalTime: {
      name: "Arrival Time",
      description: "The time at which a process enters the system (becomes available for execution). Measured in time units from simulation start."
    },
    priority: {
      name: "Priority",
      description: "A numerical value that represents the importance of a process. Lower values typically indicate higher priority."
    },
    timeQuantum: {
      name: "Time Quantum",
      description: "In Round Robin scheduling, the maximum time a process can execute before being preempted. Affects how frequently the CPU switches between processes."
    }
  };
  
  return c.json({
    status: 'success',
    parameterInfo,
  }, 200);
}; 