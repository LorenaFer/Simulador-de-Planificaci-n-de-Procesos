# Process Scheduler Simulator - Frontend Integration Guide

This document provides guidance on how to integrate a NextJS frontend with the Process Scheduler Simulator backend.

## API Endpoints

The backend provides several RESTful API endpoints for managing and simulating process scheduling:

### Algorithms

#### `GET /api/scheduler/algorithms`

Returns a list of available scheduling algorithms.

**Response:**
```json
{
  "status": "success",
  "algorithms": ["FCFS", "SJF", "SRTF", "RR", "PRIORITY", "PRIORITY_P", "RANDOM"]
}
```

#### `GET /api/algorithms/descriptions`

Returns detailed descriptions for each algorithm.

**Response:**
```json
{
  "status": "success",
  "descriptions": {
    "FCFS": {
      "name": "First-Come, First-Served (FCFS)",
      "description": "A non-preemptive scheduling algorithm that executes processes in the order they arrive in the ready queue...",
      "type": "non-preemptive",
      "parameters": []
    },
    // Other algorithms...
  }
}
```

### Processes

#### `GET /api/processes/random`

Generates random processes for simulation.

**Query Parameters:**
- `count`: Number of processes to generate (default: 5)
- `maxBurstTime`: Maximum burst time (default: 10)
- `maxIoBurstTime`: Maximum I/O burst time (default: 5)
- `maxPriority`: Maximum priority value (default: 10)
- `maxArrivalTime`: Maximum arrival time (default: 10)

**Response:**
```json
{
  "status": "success",
  "processes": [
    {
      "name": "Process-1",
      "arrivalTime": 2,
      "burstTime": 5,
      "ioBurstTime": 2,
      "priority": 3
    },
    // More processes...
  ]
}
```

#### `GET /api/processes/parameters`

Returns descriptions of process parameters.

**Response:**
```json
{
  "status": "success",
  "parameterInfo": {
    "burstTime": {
      "name": "Burst Time",
      "description": "The total CPU time required by the process to complete its execution."
    },
    // Other parameters...
  }
}
```

### Simulation

#### `POST /api/scheduler/simulate`

Runs a one-time simulation with the specified algorithm and processes.

**Request Body:**
```json
{
  "algorithm": "SJF",
  "processes": [
    {
      "name": "Process-1",
      "arrivalTime": 0,
      "burstTime": 5,
      "priority": 2
    },
    // More processes...
  ],
  "config": {
    "timeQuantum": 2 // Only required for RR algorithm
  }
}
```

**Response:**
```json
{
  "status": "success",
  "algorithm": "SJF",
  "results": [
    {
      "id": "abc123",
      "name": "Process-1",
      "arrivalTime": 0,
      "burstTime": 5,
      "priority": 2,
      "waitingTime": 0,
      "turnaroundTime": 5,
      "responseTime": 0,
      "completionTime": 5
    },
    // More processes...
  ],
  "statistics": {
    "totalProcesses": 5,
    "totalTime": 20,
    "cpuUtilization": "85.00",
    "avgWaitingTime": "5.50",
    "avgTurnaroundTime": "12.00",
    "avgResponseTime": "5.50",
    "avgArrivalsPerStep": "0.50",
    "throughput": "0.25"
  }
}
```

## Real-time Simulation with WebSockets

For real-time visualization, the backend provides WebSocket communication:

### Socket.IO Events

#### Client Events (From Frontend to Backend)

- `start-simulation`: Start a new simulation
- `pause-simulation`: Pause the current simulation
- `resume-simulation`: Resume the paused simulation
- `step-simulation`: Execute a single step in the simulation
- `reset-simulation`: Reset the current simulation

#### Server Events (From Backend to Frontend)

- `simulation-state`: Current simulation state (running, paused, reset)
- `simulation-step`: State update after each simulation step
- `simulation-completed`: Final results when simulation completes
- `simulation-error`: Error information

### Example Socket.IO Integration in NextJS

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:3000';

export default function Simulation() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [simulationState, setSimulationState] = useState({
    currentTime: 0,
    processes: [],
    queues: {
      readyQueue: [],
      runningProcess: null,
      waitingQueue: 0,
      completedProcesses: 0
    },
    statistics: {
      cpuUtilization: '0.00',
      avgWaitingTime: '0.00',
      avgTurnaroundTime: '0.00'
    }
  });
  
  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(API_URL);
    setSocket(socketInstance);
    
    // Setup event listeners
    socketInstance.on('simulation-step', (data) => {
      setSimulationState(data);
    });
    
    socketInstance.on('simulation-completed', (data) => {
      console.log('Simulation completed', data);
      // Handle completion
    });
    
    socketInstance.on('simulation-error', (error) => {
      console.error('Simulation error', error);
      // Handle error
    });
    
    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  
  const startSimulation = () => {
    socket?.emit('start-simulation', {
      algorithm: 'SRTF',
      processes: [
        {
          name: "Process-1",
          arrivalTime: 0,
          burstTime: 5,
          priority: 1
        },
        // More processes...
      ],
      stepInterval: 1000, // 1 second per step
      config: {
        timeQuantum: 2 // For RR algorithm
      }
    });
  };
  
  const pauseSimulation = () => {
    socket?.emit('pause-simulation');
  };
  
  const resumeSimulation = () => {
    socket?.emit('resume-simulation');
  };
  
  const stepSimulation = () => {
    socket?.emit('step-simulation');
  };
  
  const resetSimulation = () => {
    socket?.emit('reset-simulation');
  };
  
  return (
    <div>
      <h1>Process Scheduler Simulation</h1>
      
      <div className="controls">
        <button onClick={startSimulation}>Start</button>
        <button onClick={pauseSimulation}>Pause</button>
        <button onClick={resumeSimulation}>Resume</button>
        <button onClick={stepSimulation}>Step</button>
        <button onClick={resetSimulation}>Reset</button>
      </div>
      
      <div className="simulation-info">
        <p>Current Time: {simulationState.currentTime}</p>
        <p>CPU Utilization: {simulationState.statistics.cpuUtilization}%</p>
        <p>Average Waiting Time: {simulationState.statistics.avgWaitingTime}</p>
        <p>Average Turnaround Time: {simulationState.statistics.avgTurnaroundTime}</p>
      </div>
      
      <div className="processes">
        <h2>Processes</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>State</th>
              <th>Arrival Time</th>
              <th>Burst Time</th>
              <th>Remaining Time</th>
              <th>Waiting Time</th>
            </tr>
          </thead>
          <tbody>
            {simulationState.processes.map((process) => (
              <tr key={process.id}>
                <td>{process.name}</td>
                <td>{process.state}</td>
                <td>{process.arrivalTime}</td>
                <td>{process.burstTime}</td>
                <td>{process.remainingTime}</td>
                <td>{process.waitingTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="queues">
        <h2>Ready Queue</h2>
        <ul>
          {simulationState.queues.readyQueue.map((process) => (
            <li key={process.id}>
              {process.name} (Remaining: {process.remainingTime})
            </li>
          ))}
        </ul>
        
        <h2>CPU</h2>
        {simulationState.queues.runningProcess ? (
          <div className="cpu-process">
            {simulationState.queues.runningProcess.name}
          </div>
        ) : (
          <div className="cpu-idle">Idle</div>
        )}
      </div>
    </div>
  );
}
```

## Required Frontend Visualizations

The NextJS frontend should implement the following visualizations:

1. **Process States**: Visual representation of processes in different states (new, ready, running, blocked, terminated)
2. **Ready Queue**: Display of processes waiting to be executed
3. **CPU**: Current process being executed in the CPU
4. **Blocked Queue**: Processes waiting for I/O operations
5. **Completed Processes**: List of processes that have completed execution

## Statistics to Display

- **CPU Utilization**: Percentage of time the CPU is actively executing processes
- **Average Waiting Time**: Average time processes spend in the ready queue
- **Average Turnaround Time**: Average time from process arrival to completion
- **Average Response Time**: Average time from arrival to first execution
- **Total Processes**: Number of processes in the simulation
- **Completed Processes**: Number of processes that have completed execution
- **Average Arrivals Per Step**: Rate at which new processes arrive
- **Throughput**: Number of processes completed per unit time

## User Interface Requirements

The UI should allow users to:

1. Generate random processes with configurable parameters
2. Select different scheduling algorithms
3. Configure algorithm parameters (e.g., time quantum for Round Robin)
4. Control the simulation (start, pause, resume, step, reset)
5. View explanations of process parameters and scheduling algorithms

## Example NextJS Project Structure

```
/process-scheduler-frontend
  /components
    /visualization
      ProcessStateVisualization.tsx
      QueueVisualization.tsx
      CPUVisualization.tsx
      StatisticsPanel.tsx
    /controls
      AlgorithmSelector.tsx
      ProcessGenerator.tsx
      SimulationControls.tsx
    /layout
      Header.tsx
      Footer.tsx
      Layout.tsx
  /pages
    index.tsx
    about.tsx
  /lib
    api.ts
    socket.ts
    types.ts
  /styles
    globals.css
    Home.module.css
  /public
    favicon.ico
    icons/
```

## Getting Started

1. Create a new NextJS project
2. Install Socket.IO client: `npm install socket.io-client`
3. Configure the API and WebSocket connections to point to the backend
4. Implement the UI components according to the requirements
5. Create the real-time visualization for the simulation

## Support

For any questions or issues, please contact the backend development team. 