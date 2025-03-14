# Algoritmos de Planificación de Procesos

Este documento presenta explicaciones sencillas de los algoritmos de planificación implementados en nuestro simulador de procesos.

## FCFS (First-Come, First-Served)

**Descripción:** El algoritmo más simple. Los procesos se ejecutan exactamente en el orden en que llegan a la cola de listos.

**Funcionamiento:**
- No hay interrupciones - cada proceso se ejecuta hasta completarse
- Si un proceso llega mientras otro está en ejecución, debe esperar
- Similar a una fila de supermercado: el primero en llegar, el primero en ser atendido

**Ventajas:**
- Fácil de implementar y entender
- Justo en el sentido de que los procesos se atienden en orden de llegada

**Desventajas:**
- Puede generar largos tiempos de espera si un proceso largo está al principio
- No optimiza el tiempo de respuesta global
- Sufre del "efecto convoy": procesos cortos quedan bloqueados detrás de procesos largos

**Mejor uso:** Sistemas por lotes (batch) donde el tiempo de respuesta no es crítico.

## SJF (Shortest Job First)

**Descripción:** Prioriza la ejecución de los procesos más cortos primero.

**Funcionamiento:**
- De todos los procesos disponibles, se ejecuta primero el que tenga menor tiempo de ejecución
- No apropiativo: una vez que un proceso comienza, se ejecuta hasta completarse
- Requiere conocer (o estimar) el tiempo de ejecución de cada proceso

**Ventajas:**
- Minimiza el tiempo de espera promedio
- Maximiza el rendimiento (throughput) del sistema
- Óptimo en términos de tiempo de espera promedio

**Desventajas:**
- Los procesos largos pueden sufrir "inanición" (starvation) si constantemente llegan procesos cortos
- Difícil predecir con exactitud el tiempo de ejecución de los procesos
- No apropiativo: no responde bien a procesos interactivos

**Mejor uso:** Sistemas por lotes donde se conocen los tiempos de ejecución.

## SRTF (Shortest Remaining Time First)

**Descripción:** Versión apropiativa de SJF. También conocido como SJF Apropiativo.

**Funcionamiento:**
- Siempre se ejecuta el proceso con el menor tiempo restante de ejecución
- Si llega un nuevo proceso con tiempo de ejecución menor que lo que le queda al proceso actual, se produce un cambio de contexto
- Constantemente se reevalúa qué proceso tiene el menor tiempo restante

**Ventajas:**
- Optimiza aún más el tiempo de espera promedio que SJF
- Responde mejor a la llegada de procesos cortos
- Teóricamente óptimo para minimizar el tiempo de espera promedio

**Desventajas:**
- Mayor sobrecarga por los cambios de contexto frecuentes
- Posible inanición para procesos largos
- Requiere estimación continua del tiempo restante

**Mejor uso:** Sistemas que necesitan respuesta rápida a trabajos cortos manteniendo buen rendimiento general.

## Round Robin

**Descripción:** Asigna un pequeño intervalo de tiempo (quantum) a cada proceso en forma circular.

**Funcionamiento:**
- Los procesos se organizan en una cola circular
- Cada proceso recibe un quantum de tiempo fijo para ejecutarse
- Si un proceso no termina en su quantum, se coloca al final de la cola
- Si un proceso termina antes de agotar su quantum, el siguiente proceso inicia inmediatamente

**Ventajas:**
- Distribución justa del tiempo de CPU entre todos los procesos
- Buen tiempo de respuesta para procesos cortos e interactivos
- Evita la inanición, ya que todos los procesos reciben tiempo de CPU

**Desventajas:**
- El rendimiento depende mucho del tamaño del quantum:
  - Un quantum muy pequeño genera demasiada sobrecarga por cambios de contexto
  - Un quantum muy grande degenera en FCFS
- No optimiza el tiempo de espera promedio

**Mejor uso:** Sistemas de tiempo compartido e interactivos.

## Prioridad (No Apropiativo)

**Descripción:** Asigna un valor de prioridad a cada proceso y ejecuta según estas prioridades.

**Funcionamiento:**
- Cada proceso tiene un valor de prioridad (normalmente los números más bajos indican mayor prioridad)
- Se ejecuta siempre el proceso disponible de mayor prioridad
- Una vez que un proceso comienza a ejecutarse, continúa hasta completarse
- Los procesos con igual prioridad suelen manejarse con FCFS

**Ventajas:**
- Permite reflejar la importancia relativa de los procesos
- Útil para sistemas donde ciertos procesos son más críticos que otros
- Flexible y adaptable a diferentes necesidades del sistema

**Desventajas:**
- Posible inanición de procesos de baja prioridad
- No optimiza necesariamente el tiempo de respuesta global
- Puede ser complejo determinar prioridades adecuadas

**Mejor uso:** Sistemas con procesos de diferente importancia donde algunos necesitan atención preferente.

## Prioridad Apropiativo

**Descripción:** Versión apropiativa del algoritmo de prioridad.

**Funcionamiento:**
- Similar al algoritmo de prioridad, pero permite interrupciones
- Si llega un nuevo proceso con mayor prioridad que el actual, este último se suspende
- El proceso de mayor prioridad siempre está en ejecución

**Ventajas:**
- Mejor tiempo de respuesta para procesos de alta prioridad
- Garantiza que los procesos críticos reciban atención inmediata
- Mayor flexibilidad que la versión no apropiativa

**Desventajas:**
- Mayor sobrecarga por los cambios de contexto
- Mayor riesgo de inanición para procesos de baja prioridad
- Posibles problemas de "inversión de prioridad" si no se implementan mecanismos adicionales

**Mejor uso:** Sistemas en tiempo real donde los procesos críticos deben responder con rapidez.

## Random

**Descripción:** Selecciona aleatoriamente el siguiente proceso a ejecutar de la cola de listos.

**Funcionamiento:**
- Cuando el CPU está disponible, se elige al azar un proceso de la cola de listos
- No hay criterios de selección específicos, solo la aleatoriedad

**Ventajas:**
- Muy simple de implementar
- Evita patrones predecibles de inanición
- Distribución estadísticamente equitativa a largo plazo

**Desventajas:**
- No es eficiente ni optimiza ninguna métrica específica
- Impredecible en términos de tiempo de respuesta y espera
- Raramente usado en sistemas reales

**Mejor uso:** Principalmente para fines educativos o como referencia de comparación para otros algoritmos. 