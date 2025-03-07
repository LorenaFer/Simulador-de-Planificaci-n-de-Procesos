import { describe, it, expect, beforeEach } from 'vitest';
import { FCFSScheduler } from '../../../../src/simulation/algorithms/non_expulsives/fcfs.js';
import { Process, ProcessState } from '../../../../src/simulation/models/process.model.js';

describe('FCFSScheduler', () => {
  let processes: Process[];
  
  beforeEach(() => {
    // Reset processes before each test
    processes = [
      new Process({ name: 'P1', arrivalTime: 0, burstTime: 5 }),
      new Process({ name: 'P2', arrivalTime: 2, burstTime: 3 }),
      new Process({ name: 'P3', arrivalTime: 4, burstTime: 1 }),
      new Process({ name: 'P4', arrivalTime: 6, burstTime: 4 }),
    ];
  });

  it('should schedule processes in order of arrival time', () => {
    const scheduler = new FCFSScheduler(processes);
    const result = scheduler.runSimulation();
    
    // Check the completion order
    expect(result.map(p => p.name)).toEqual(['P1', 'P2', 'P3', 'P4']);
  });

  it('should calculate correct waiting times', () => {
    const scheduler = new FCFSScheduler(processes);
    const result = scheduler.runSimulation();
    
    // P1: arrives at 0, starts at 0, wait = 0
    // P2: arrives at 2, starts at 5, wait = 3
    // P3: arrives at 4, starts at 8, wait = 4
    // P4: arrives at 6, starts at 9, wait = 3
    expect(result[0].waitingTime).toBe(0);
    expect(result[1].waitingTime).toBe(4);
    expect(result[2].waitingTime).toBe(5);
    expect(result[3].waitingTime).toBe(4);
  });

  it('should calculate correct turnaround times', () => {
    const scheduler = new FCFSScheduler(processes);
    const result = scheduler.runSimulation();
    
    // P1: arrives at 0, completes at 5, turnaround = 5
    // P2: arrives at 2, completes at 8, turnaround = 6
    // P3: arrives at 4, completes at 9, turnaround = 5
    // P4: arrives at 6, completes at 13, turnaround = 7
    expect(result[0].turnaroundTime).toBe(5);
    expect(result[1].turnaroundTime).toBe(6);
    expect(result[2].turnaroundTime).toBe(5);
    expect(result[3].turnaroundTime).toBe(7);
  });

  it('should handle processes with same arrival time', () => {
    const sameArrivalProcesses = [
      new Process({ name: 'P1', arrivalTime: 0, burstTime: 5 }),
      new Process({ name: 'P2', arrivalTime: 0, burstTime: 3 }),
      new Process({ name: 'P3', arrivalTime: 0, burstTime: 1 }),
    ];
    
    const scheduler = new FCFSScheduler(sameArrivalProcesses);
    const result = scheduler.runSimulation();
    
    // Since they arrive at the same time, they should be processed in the order they were added
    expect(result.map(p => p.name)).toEqual(['P1', 'P2', 'P3']);
    
    // P1: arrives at 0, starts at 0, completes at 5, wait = 0, turnaround = 5
    // P2: arrives at 0, starts at 5, completes at 8, wait = 5, turnaround = 8
    // P3: arrives at 0, starts at 8, completes at 9, wait = 8, turnaround = 9
    expect(result[0].waitingTime).toBe(0);
    expect(result[1].waitingTime).toBe(5);
    expect(result[2].waitingTime).toBe(8);
    
    expect(result[0].turnaroundTime).toBe(5);
    expect(result[1].turnaroundTime).toBe(8);
    expect(result[2].turnaroundTime).toBe(9);
  });

  it('should handle processes arriving out of order', () => {
    const unorderedProcesses = [
      new Process({ name: 'P1', arrivalTime: 5, burstTime: 3 }),
      new Process({ name: 'P2', arrivalTime: 0, burstTime: 4 }),
      new Process({ name: 'P3', arrivalTime: 2, burstTime: 2 }),
    ];
    
    const scheduler = new FCFSScheduler(unorderedProcesses);
    const result = scheduler.runSimulation();
    
    // They should be processed in arrival time order: P2, P3, P1
    expect(result.map(p => p.name)).toEqual(['P2', 'P3', 'P1']);
  });

  it('should handle empty process list', () => {
    const scheduler = new FCFSScheduler([]);
    const result = scheduler.runSimulation();
    
    expect(result).toEqual([]);
    expect(scheduler.getCurrentTime()).toBe(1);
  });

  it('should handle zero burst time processes', () => {
    const zeroBurstProcesses = [
      new Process({ name: 'P1', arrivalTime: 0, burstTime: 0 }),
      new Process({ name: 'P2', arrivalTime: 0, burstTime: 3 }),
    ];
    
    const scheduler = new FCFSScheduler(zeroBurstProcesses);
    const result = scheduler.runSimulation();
    
    expect(result.map(p => p.name)).toEqual(['P1', 'P2']);
    expect(result[0].turnaroundTime).toBe(1);
    expect(result[1].turnaroundTime).toBe(4);
  });

  it('should correctly track process states during execution', () => {
    const testProcesses = [
      new Process({ name: 'P1', arrivalTime: 0, burstTime: 1 }),
      new Process({ name: 'P2', arrivalTime: 1, burstTime: 1 }),
    ];
    
    const scheduler = new FCFSScheduler(testProcesses);
    
    // Initial state
    expect(testProcesses[0].state).toBe(ProcessState.NEW);
    expect(testProcesses[1].state).toBe(ProcessState.NEW);
    
    // First tick - P1 starts running, P2 not yet arrived
    scheduler.tick();
    expect(testProcesses[0].state).toBe(ProcessState.TERMINATED);
    expect(testProcesses[1].state).toBe(ProcessState.RUNNING);
    
    // Second tick - P1 done, P2 running
    scheduler.tick();
    expect(testProcesses[0].state).toBe(ProcessState.TERMINATED);
    expect(testProcesses[1].state).toBe(ProcessState.TERMINATED);
  });
}); 