# NovaTech — Pruebas Básicas de Rendimiento

## Objetivo

Evaluar el comportamiento básico de rendimiento del Sistema de Gestión de Solicitudes de Mantenimiento NovaTech sobre operaciones críticas del backend.

La prueba busca obtener métricas reproducibles sobre:

- Inicio de sesión.
- Consulta de solicitudes.
- Consulta de historial.
- Ejecución de solicitudes concurrentes.

---

# Alcance

La prueba se ejecutó sobre el MVP funcionando en un entorno local.

Servidor evaluado:

```text
http://localhost:3000
```

La medición corresponde al volumen de datos y condiciones existentes durante la ejecución de la prueba.

Por lo tanto, los resultados **no deben interpretarse como una prueba de capacidad de producción, estrés o escalabilidad empresarial**.

---

# Herramienta utilizada

Se creó un script reproducible:

```text
scripts/performance_test.js
```

El script utiliza:

```text
Node.js
Fetch API
node:perf_hooks
```

para medir tiempos de respuesta reales del backend.

No se utilizaron datos simulados para los tiempos reportados.

---

# Configuración de la prueba

## Iteraciones

Para cada endpoint se ejecutaron:

```text
20 iteraciones
```

## Concurrencia

Para la prueba de concurrencia básica se utilizaron:

```text
10 solicitudes simultáneas
```

---

# Criterios definidos antes de la ejecución

Se establecieron los siguientes criterios de aceptación para el entorno local del MVP:

| Métrica | Criterio |
|---|---:|
| Tiempo promedio por endpoint | ≤ 500 ms |
| Percentil 95 por endpoint | ≤ 1000 ms |
| Lote de 10 solicitudes concurrentes | ≤ 2000 ms |
| Errores HTTP | 0 |

El objetivo de estos límites es detectar degradaciones evidentes de rendimiento dentro del entorno académico y local del proyecto.

---

# Endpoints evaluados

Se midieron las siguientes operaciones:

```text
POST /api/login
GET  /api/solicitudes
GET  /api/solicitudes/:id/historial
```

También se ejecutaron múltiples peticiones simultáneas contra:

```text
GET /api/solicitudes
```

---

# Resultados

## PERF-01 — Inicio de sesión

Endpoint:

```text
POST /api/login
```

Iteraciones:

```text
20
```

Resultados:

| Métrica | Resultado |
|---|---:|
| Mínimo | 4.49 ms |
| Promedio | 17.66 ms |
| P95 | 19.72 ms |
| Máximo | 112.32 ms |

### Evaluación

```text
Promedio <= 500 ms   PASS
P95 <= 1000 ms       PASS
```

Resultado:

**PASS**

---

# PERF-02 — Consulta de solicitudes

Endpoint:

```text
GET /api/solicitudes
```

Iteraciones:

```text
20
```

Resultados:

| Métrica | Resultado |
|---|---:|
| Mínimo | 2.51 ms |
| Promedio | 13.88 ms |
| P95 | 21.07 ms |
| Máximo | 21.37 ms |

### Evaluación

```text
Promedio <= 500 ms   PASS
P95 <= 1000 ms       PASS
```

Resultado:

**PASS**

---

# PERF-03 — Consulta de historial

Endpoint utilizado durante la prueba:

```text
GET /api/solicitudes/9/historial
```

Iteraciones:

```text
20
```

Resultados:

| Métrica | Resultado |
|---|---:|
| Mínimo | 3.11 ms |
| Promedio | 12.68 ms |
| P95 | 20.47 ms |
| Máximo | 29.12 ms |

### Evaluación

```text
Promedio <= 500 ms   PASS
P95 <= 1000 ms       PASS
```

Resultado:

**PASS**

---

# PERF-04 — Concurrencia básica

Se realizaron simultáneamente:

```text
10 solicitudes
```

sobre:

```text
GET /api/solicitudes
```

Resultados:

| Métrica | Resultado |
|---|---:|
| Solicitudes simultáneas | 10 |
| Respuestas exitosas | 10/10 |
| Tiempo total del lote | 26.54 ms |
| Promedio individual | 17.97 ms |
| Errores HTTP | 0 |

Criterio:

```text
10 solicitudes concurrentes <= 2000 ms
```

Resultado:

**PASS**

---

# Resumen de resultados

| ID | Escenario | Promedio | P95 | Resultado |
|---|---|---:|---:|---|
| PERF-01 | Inicio de sesión | 17.66 ms | 19.72 ms | PASS |
| PERF-02 | Listado de solicitudes | 13.88 ms | 21.07 ms | PASS |
| PERF-03 | Consulta de historial | 12.68 ms | 20.47 ms | PASS |
| PERF-04 | 10 solicitudes concurrentes | 26.54 ms total | N/A | PASS |

---

# Resultado general

```text
PERF-01   PASS
PERF-02   PASS
PERF-03   PASS
PERF-04   PASS
```

Resultado general:

**PASS**

No se produjeron errores HTTP durante la ejecución registrada.

---

# Observaciones

## Variación en el inicio de sesión

El mayor tiempo individual registrado durante el login fue:

```text
112.32 ms
```

Sin embargo:

```text
Promedio: 17.66 ms
P95:      19.72 ms
```

por lo que esa ejecución aislada no provocó incumplimiento de los criterios establecidos.

---

# Interpretación

En el entorno local utilizado y con el volumen actual de información del MVP:

- El inicio de sesión respondió dentro de los límites establecidos.
- La consulta de solicitudes respondió dentro de los límites establecidos.
- La consulta del historial respondió dentro de los límites establecidos.
- Las 10 solicitudes simultáneas fueron procesadas correctamente.
- No se observaron errores HTTP durante la ejecución.
- No se identificaron defectos de rendimiento que requirieran corrección en esta prueba.

---

# Limitaciones

Esta prueba presenta las siguientes limitaciones:

1. Fue ejecutada en un entorno local.
2. El servidor, base de datos y cliente se encuentran en una infraestructura de desarrollo.
3. El volumen actual de datos es reducido.
4. Se utilizó una concurrencia máxima de 10 solicitudes simultáneas.
5. No se evaluaron cientos o miles de usuarios concurrentes.
6. No se evaluó rendimiento bajo condiciones de red externa.
7. No se realizó una prueba de estrés hasta encontrar el punto de falla.
8. No se realizó una prueba prolongada de endurance o soak testing.

Por lo tanto, los resultados permiten caracterizar el **rendimiento básico del MVP**, pero no predecir el comportamiento de una implementación de producción a gran escala.

---

# Reproducibilidad

Para repetir la prueba se debe mantener el backend ejecutándose y utilizar desde la raíz del proyecto:

```bash
node scripts/performance_test.js
```

El script permite modificar algunos parámetros mediante variables de entorno:

```text
PERF_BASE_URL
PERF_EMAIL
PERF_PASSWORD
PERF_ITERATIONS
PERF_CONCURRENCY
```

Los valores predeterminados utilizados para esta ejecución fueron:

```text
Base URL:     http://localhost:3000
Iteraciones:  20
Concurrencia: 10
Usuario:      Administrador de prueba
```

---

# Conclusión

Las pruebas básicas de rendimiento de NovaTech finalizaron satisfactoriamente.

Los tres endpoints críticos evaluados mantuvieron tiempos promedio inferiores a:

```text
20 ms
```

en la ejecución registrada.

Asimismo, el backend procesó:

```text
10/10
```

solicitudes concurrentes correctamente y dentro del umbral establecido.

## Estado

**PASS**

No se registró un nuevo defecto de rendimiento durante esta ejecución.