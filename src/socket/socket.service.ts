import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import logger from '../utils/logger.js';
import { Process, ProcessState } from '../simulation/models/process.model.js';
import { SchedulerFactory, SchedulerType } from '../simulation/algorithms/scheduler.factory.js';

/**
 * Socket.IO events for the simulation
 */
export enum SocketEvents {
  CONNECT = 'connection',
  DISCONNECT = 'disconnect',
  
  // Client events (received from clients)
  START_SIMULATION = 'start-simulation',
  PAUSE_SIMULATION = 'pause-simulation',
  RESUME_SIMULATION = 'resume-simulation',
  STEP_SIMULATION = 'step-simulation',
  RESET_SIMULATION = 'reset-simulation',
  
  // Server events (sent to clients)
  SIMULATION_STATE = 'simulation-state',
  SIMULATION_STEP = 'simulation-step',
  SIMULATION_COMPLETED = 'simulation-completed',
  SIMULATION_ERROR = 'simulation-error',
}

/**
 * Socket.IO service for real-time simulation updates
 */
export class SocketService {
  private io: Server;
  private simulations: Map<string, {
    scheduler: any;
    intervalId?: NodeJS.Timeout;
    paused: boolean;
  }> = new Map();
  
  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    
    this.setupEventHandlers();
    logger.info('Socket.IO service initialized');
  }
  
  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    this.io.on(SocketEvents.CONNECT, (socket) => {
      const clientId = socket.id;
      logger.debug(`Client connected: ${clientId}`);
      
      // Event: Start Simulation
      socket.on(SocketEvents.START_SIMULATION, (data) => {
        try {
          if (!data.algorithm || !data.processes || !Array.isArray(data.processes)) {
            this.emitError(socket, 'Invalid request. Required fields: algorithm, processes');
            return;
          }
          
          const algorithmType = data.algorithm.toUpperCase();
          if (!Object.values(SchedulerType).includes(algorithmType)) {
            this.emitError(
              socket, 
              `Invalid algorithm type. Supported types: ${Object.values(SchedulerType).join(', ')}`
            );
            return;
          }
          
          // Create process objects from request data
          const processes: Process[] = data.processes.map((p: any) => new Process({
            name: p.name,
            arrivalTime: p.arrivalTime || 0,
            burstTime: p.burstTime,
            priority: p.priority || 0,
          }));
          
          // Create scheduler
          const scheduler = SchedulerFactory.createScheduler(
            algorithmType as SchedulerType,
            processes,
            data.config
          );
          
          // Store simulation
          this.simulations.set(clientId, {
            scheduler,
            paused: false,
          });
          
          // Start simulation with interval to send updates in real-time
          const stepInterval = data.stepInterval || 1000; // Default: 1 second per step
          
          // Send initial state
          this.emitSimulationState(socket, scheduler);
          
          // Setup interval to run steps
          const intervalId = setInterval(() => {
            const simulation = this.simulations.get(clientId);
            if (!simulation || simulation.paused) return;
            
            const isCompleted = this.runSimulationStep(socket, simulation.scheduler);
            
            if (isCompleted) {
              clearInterval(intervalId);
              this.simulations.delete(clientId);
              socket.emit(SocketEvents.SIMULATION_COMPLETED, {
                message: 'Simulation completed',
                results: simulation.scheduler.getAllProcesses().map((p: Process) => ({
                  id: p.id,
                  name: p.name,
                  state: p.state,
                  arrivalTime: p.arrivalTime,
                  burstTime: p.burstTime,
                  priority: p.priority,
                  waitingTime: p.waitingTime,
                  turnaroundTime: p.turnaroundTime,
                  responseTime: p.responseTime,
                  completionTime: p.completionTime,
                })),
                totalTime: simulation.scheduler.getCurrentTime(),
              });
            }
          }, stepInterval);
          
          // Update simulation with intervalId
          const currentSimulation = this.simulations.get(clientId);
          if (currentSimulation) {
            this.simulations.set(clientId, {
              ...currentSimulation,
              intervalId,
            });
          }
          
          logger.info(`Started ${algorithmType} simulation for client ${clientId} with ${processes.length} processes`);
          
        } catch (error: unknown) {
          logger.error('Error starting simulation', error instanceof Error ? error : new Error(String(error)));
          this.emitError(socket, 'Failed to start simulation');
        }
      });
      
      // Event: Pause Simulation
      socket.on(SocketEvents.PAUSE_SIMULATION, () => {
        const simulation = this.simulations.get(clientId);
        if (simulation) {
          simulation.paused = true;
          this.simulations.set(clientId, simulation);
          socket.emit(SocketEvents.SIMULATION_STATE, {
            state: 'paused',
            currentTime: simulation.scheduler.getCurrentTime(),
          });
          logger.debug(`Paused simulation for client ${clientId}`);
        }
      });
      
      // Event: Resume Simulation
      socket.on(SocketEvents.RESUME_SIMULATION, () => {
        const simulation = this.simulations.get(clientId);
        if (simulation) {
          simulation.paused = false;
          this.simulations.set(clientId, simulation);
          socket.emit(SocketEvents.SIMULATION_STATE, {
            state: 'running',
            currentTime: simulation.scheduler.getCurrentTime(),
          });
          logger.debug(`Resumed simulation for client ${clientId}`);
        }
      });
      
      // Event: Step Simulation
      socket.on(SocketEvents.STEP_SIMULATION, () => {
        const simulation = this.simulations.get(clientId);
        if (simulation) {
          this.runSimulationStep(socket, simulation.scheduler);
          logger.debug(`Stepped simulation for client ${clientId}`);
        }
      });
      
      // Event: Reset Simulation
      socket.on(SocketEvents.RESET_SIMULATION, () => {
        const simulation = this.simulations.get(clientId);
        if (simulation && simulation.intervalId) {
          clearInterval(simulation.intervalId);
          this.simulations.delete(clientId);
          socket.emit(SocketEvents.SIMULATION_STATE, {
            state: 'reset',
            currentTime: 0,
          });
          logger.debug(`Reset simulation for client ${clientId}`);
        }
      });
      
      // Event: Disconnect
      socket.on(SocketEvents.DISCONNECT, () => {
        const simulation = this.simulations.get(clientId);
        if (simulation && simulation.intervalId) {
          clearInterval(simulation.intervalId);
          this.simulations.delete(clientId);
        }
        logger.debug(`Client disconnected: ${clientId}`);
      });
    });
  }
  
  /**
   * Run a single step in the simulation
   * @param socket Client socket
   * @param scheduler Scheduler instance
   * @returns True if simulation is completed
   */
  private runSimulationStep(socket: any, scheduler: any): boolean {
    const isCompleted = scheduler.tick();
    
    // Emit step update
    this.emitSimulationState(socket, scheduler);
    
    return isCompleted;
  }
  
  /**
   * Emit the current simulation state to the client
   * @param socket Client socket
   * @param scheduler Scheduler instance
   */
  private emitSimulationState(socket: any, scheduler: any): void {
    const allProcesses = scheduler.getAllProcesses();
    
    // Group processes by state
    const processesByState = {
      [ProcessState.NEW]: allProcesses.filter((p: Process) => p.state === ProcessState.NEW),
      [ProcessState.READY]: allProcesses.filter((p: Process) => p.state === ProcessState.READY),
      [ProcessState.RUNNING]: allProcesses.filter((p: Process) => p.state === ProcessState.RUNNING),
      [ProcessState.WAITING]: allProcesses.filter((p: Process) => p.state === ProcessState.WAITING),
      [ProcessState.TERMINATED]: allProcesses.filter((p: Process) => p.state === ProcessState.TERMINATED)
    };
    
    // Calculate real-time statistics
    const completedProcesses = processesByState[ProcessState.TERMINATED];
    const currentTime = scheduler.getCurrentTime();
    
    let cpuUtilization = 0;
    let avgWaitingTime = 0;
    let avgTurnaroundTime = 0;
    
    if (completedProcesses.length > 0) {
      const totalBurstTime = completedProcesses.reduce((sum: number, p: Process) => sum + p.burstTime, 0);
      cpuUtilization = (totalBurstTime / currentTime) * 100;
      avgWaitingTime = completedProcesses.reduce((sum: number, p: Process) => sum + p.waitingTime, 0) / completedProcesses.length;
      avgTurnaroundTime = completedProcesses.reduce((sum: number, p: Process) => sum + p.turnaroundTime, 0) / completedProcesses.length;
    }
    
    socket.emit(SocketEvents.SIMULATION_STEP, {
      currentTime: currentTime,
      processes: allProcesses.map((p: Process) => ({
        id: p.id,
        name: p.name,
        state: p.state,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
        remainingTime: p.remainingTime,
        waitingTime: p.waitingTime,
      })),
      queues: {
        newProcesses: processesByState[ProcessState.NEW].length,
        readyQueue: processesByState[ProcessState.READY].map((p: Process) => ({
          id: p.id,
          name: p.name,
          remainingTime: p.remainingTime,
          priority: p.priority
        })),
        runningProcess: processesByState[ProcessState.RUNNING].length > 0 
          ? processesByState[ProcessState.RUNNING][0] 
          : null,
        waitingQueue: processesByState[ProcessState.WAITING].length,
        completedProcesses: processesByState[ProcessState.TERMINATED].length
      },
      statistics: {
        cpuUtilization: cpuUtilization.toFixed(2),
        avgWaitingTime: avgWaitingTime.toFixed(2),
        avgTurnaroundTime: avgTurnaroundTime.toFixed(2),
        totalProcesses: allProcesses.length,
        completedProcesses: completedProcesses.length,
        throughput: completedProcesses.length > 0 
          ? (completedProcesses.length / currentTime).toFixed(2) 
          : "0.00"
      }
    });
  }
  
  /**
   * Emit an error to the client
   * @param socket Client socket
   * @param message Error message
   */
  private emitError(socket: any, message: string): void {
    socket.emit(SocketEvents.SIMULATION_ERROR, {
      message,
    });
  }
}

export default SocketService; 