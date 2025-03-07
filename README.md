# Simulador de Planificación de Procesos

## Descripción

Este proyecto es un simulador de planificación de procesos de sistemas operativos implementado como una API REST utilizando Hono.js. Permite visualizar y comprender el funcionamiento de diferentes algoritmos de planificación de procesos, como son utilizados por los sistemas operativos para gestionar la ejecución de múltiples procesos en un entorno de recursos limitados.

## Motivación

La planificación de procesos es uno de los conceptos fundamentales en sistemas operativos. Entender cómo funcionan estos algoritmos es crucial para comprender:

- Cómo los sistemas operativos gestionan múltiples procesos
- Los compromisos entre tiempo de respuesta, eficiencia y equidad
- El impacto de diferentes estrategias de planificación en el rendimiento del sistema

Este simulador proporciona una herramienta visual e interactiva para experimentar con diferentes algoritmos de planificación, permitiendo a estudiantes y profesionales:

1. Visualizar el comportamiento de cada algoritmo paso a paso
2. Comparar métricas de rendimiento entre diferentes algoritmos
3. Entender los escenarios donde cada algoritmo es más adecuado
4. Experimentar con diferentes configuraciones de procesos y parámetros

## Algoritmos Implementados

El simulador incluye los siguientes algoritmos de planificación:

- **FCFS (First-Come, First-Served)**: Procesa las tareas en el orden exacto en que llegan.
- **SJF (Shortest Job First)**: Prioriza los procesos con menor tiempo de ejecución.
- **SRTF (Shortest Remaining Time First)**: Versión apropiativa de SJF.
- **Round Robin**: Asigna un quantum de tiempo a cada proceso en forma circular.
- **Prioridad**: Planifica según valores de prioridad asignados a cada proceso.

## Estructura del Proyecto

```
project-root/
├── src/
│   ├── api/                    # Rutas, controladores y middlewares de la API
│   │   ├── controllers/        # Lógica de respuesta de cada endpoint
│   │   ├── routes/             # Definición de rutas y endpoints
│   │   ├── middlewares/        # Middlewares de autenticación, logging, etc.
│   │   └── index.ts            # Configuración e inicialización de Hono
│   │
│   ├── simulation/             # Lógica de la simulación de procesos
│   │   ├── algorithms/         # Implementación de los algoritmos de planificación
│   │   ├── models/             # Modelos de datos
│   │   ├── services/           # Servicios que gestionan la simulación
│   │   └── simulationManager.ts # Punto central de control de la simulación
│   │
│   ├── config/                 # Configuración general del proyecto
│   ├── utils/                  # Utilidades y funciones de ayuda
│   ├── types/                  # Declaración de tipos e interfaces globales
│   └── index.ts                # Punto de entrada de la aplicación
│
├── tests/                      # Pruebas unitarias y de integración
```

## Requisitos

- Node.js (v16 o superior)
- pnpm

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/process-scheduler-simulator.git
cd process-scheduler-simulator

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
```

## Ejecución

```bash
# Modo desarrollo
pnpm dev

# Compilar
pnpm build

# Ejecutar versión compilada
pnpm start
```

## Uso de la API

### Endpoints Públicos

- `GET /api/health`: Verificar el estado del servicio

### Endpoints Protegidos (requieren API Key)

- `GET /api/health/secure`: Verificar el estado del servicio (protegido)
- `POST /api/simulation/create`: Crear una nueva simulación
- `POST /api/simulation/:id/run`: Ejecutar una simulación
- `GET /api/simulation/:id/status`: Obtener el estado actual de una simulación
- `GET /api/simulation/:id/results`: Obtener los resultados de una simulación

Para acceder a los endpoints protegidos, incluye el header `X-API-Key` con el valor configurado.

## Ejemplo de Uso

```bash
# Crear una nueva simulación con FCFS
curl -X POST http://localhost:3000/api/simulation/create \
  -H "X-API-Key: tu-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "algorithm": "fcfs",
    "processes": [
      {"name": "P1", "arrivalTime": 0, "burstTime": 5},
      {"name": "P2", "arrivalTime": 1, "burstTime": 3},
      {"name": "P3", "arrivalTime": 2, "burstTime": 8}
    ]
  }'
```

## Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia ISC.
