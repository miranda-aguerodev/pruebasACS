# NovaTech — Evaluación de Usabilidad

## Objetivo

Evaluar la facilidad de uso, claridad, consistencia, prevención de errores y retroalimentación de las principales interfaces del Sistema de Gestión de Solicitudes de Mantenimiento NovaTech.

La evaluación se realizó sobre el MVP funcional utilizando los tres roles disponibles:

- Solicitante.
- Administrador.
- Técnico.

---

# Tipo de evaluación

Se realizó una **evaluación heurística de usabilidad** sobre las interfaces principales del sistema.

No se utilizaron participantes externos ni se presentan los resultados como una prueba formal con usuarios.

La evaluación consistió en inspeccionar las pantallas y ejecutar los principales flujos del sistema para identificar problemas relacionados con:

- Claridad de acciones.
- Visibilidad del estado del sistema.
- Consistencia.
- Prevención de errores.
- Retroalimentación.
- Legibilidad.
- Control del usuario.
- Reconocimiento de controles.
- Recuperación ante acciones.

---

# Escala de severidad

Para clasificar los hallazgos se utilizó la siguiente escala:

| Nivel | Descripción |
|---|---|
| 0 | Sin problema de usabilidad |
| 1 | Mejora cosmética u opcional |
| 2 | Problema menor de usabilidad |
| 3 | Problema importante |
| 4 | Problema crítico o bloqueante |

---

# 1. Pantalla de inicio de sesión

## Elementos evaluados

Se revisaron:

- Identificación del sistema.
- Propósito de la pantalla.
- Campos de correo y contraseña.
- Acción principal.
- Legibilidad.
- Información de usuarios de demostración.

## Resultados

| Criterio | Observación | Severidad |
|---|---|---:|
| Claridad | Se identifica inmediatamente NovaTech y la finalidad del sistema. | 0 |
| Etiquetas | Los campos Correo electrónico y Contraseña poseen etiquetas visibles. | 0 |
| Acción principal | El botón `Iniciar sesión` es visible y describe claramente la acción. | 0 |
| Consistencia | Tipografía, colores y espaciado son consistentes con el resto de la aplicación. | 0 |
| Reconocimiento | Los usuarios de demostración permiten identificar fácilmente las cuentas disponibles en el entorno académico. | 0 |
| Contraseña | No existe una opción visual para mostrar u ocultar la contraseña. | 1 |

## Resultado

**PASS**

No se identificaron problemas que impidan o dificulten de forma significativa el inicio de sesión.

---

# 2. Panel del Solicitante

## Elementos evaluados

Se revisaron:

- Orientación dentro del sistema.
- Formulario de creación.
- Límites de campos.
- Tabla de solicitudes.
- Estados y prioridades.
- Consulta de historial.

## Resultados

| Criterio | Observación | Severidad |
|---|---|---:|
| Orientación | `Mis solicitudes` y el texto introductorio explican claramente la función de la pantalla. | 0 |
| Formulario | Descripción, Ubicación y Categoría poseen etiquetas comprensibles. | 0 |
| Prevención de errores | Los contadores `0/255` y `0/120` informan los límites antes del envío. | 0 |
| Acción principal | `Registrar solicitud` describe claramente la operación. | 0 |
| Visibilidad del estado | Prioridad y Estado utilizan texto además de indicadores visuales. | 0 |
| Legibilidad | Los textos extensos ya no provocan desbordamiento de la tabla. | 0 |
| Historial | La acción `Ver historial` se mantiene disponible de forma consistente. | 0 |
| Contador | El número total de solicitudes se muestra sin una etiqueta explícita. | 1 |
| Información redundante | La columna Solicitante siempre muestra el usuario actual y aporta poca información adicional. | 1 |

## Resultado

**PASS**

Se identificaron únicamente oportunidades cosméticas de mejora.

---

# 3. Historial de solicitudes

## Elementos evaluados

Se revisaron:

- Estado actual.
- Prioridad.
- Técnico.
- Cronología.
- Autor de eventos.
- Tipo de evento.
- Fechas.
- Manejo de textos largos.

## Resultados

| Criterio | Observación | Severidad |
|---|---|---:|
| Visibilidad | Estado, prioridad y técnico se muestran claramente. | 0 |
| Trazabilidad | Los eventos aparecen en orden cronológico y con autor. | 0 |
| Comprensión | Se diferencia entre eventos del sistema y comentarios. | 0 |
| Control | El modal cuenta con una acción visible para cerrarlo. | 0 |
| Legibilidad | Los textos extensos se ajustan a varias líneas sin generar overflow horizontal. | 0 |

## Resultado

**PASS**

---

# 4. Panel de Administración

## Elementos evaluados

Se revisaron:

- Resumen de solicitudes.
- Prioridades.
- Estados.
- Asignación de técnicos.
- Cierre normal.
- Reapertura.
- Cierre administrativo.
- Historial.

## Aspectos positivos

Las tarjetas:

```text
Total
Pendientes
En proceso
Finalizadas
Cerradas
```

permiten conocer rápidamente el estado general del sistema.

Los estados y prioridades utilizan la misma terminología y representación visual empleada en las demás interfaces.

Las solicitudes cerradas muestran:

```text
✓ Caso cerrado
```

indicando claramente que ya no existen acciones de edición.

---

## Hallazgo UX-01 / DEF-13

### Situación observada

En la columna Acciones se mostraban tres controles consecutivos:

```text
Media
Pendiente
Sin asignar
```

sin etiquetas visibles.

Un usuario debía inferir que correspondían a:

```text
Prioridad
Estado
Técnico
```

### Severidad

**2 — Problema menor**

### Principio afectado

Reconocimiento de controles y reducción de carga cognitiva.

### Corrección

Se agregaron etiquetas visibles:

```text
PRIORIDAD
ESTADO
TÉCNICO
```

También se reemplazó:

```text
Guardar
```

por:

```text
Guardar cambios
```

El botón permanece deshabilitado mientras no exista ninguna modificación.

Cuando el Administrador modifica cualquier valor, el botón se habilita automáticamente.

### Regresión

Se comprobó visualmente que:

- Las tres acciones pueden identificarse sin inferencia.
- El botón aparece deshabilitado cuando no existen cambios.
- El botón se activa cuando se modifica prioridad, estado o técnico.

Resultado:

**PASS**

Estado:

**CERRADO**

---

# 5. Cierre administrativo

## Flujo evaluado

Se inspeccionó el cierre de una solicitud Pendiente.

El sistema presenta:

```text
Cerrar administrativamente
```

y posteriormente permite:

```text
Cancelar cierre
Seleccione motivo...
Confirmar cierre
```

Los motivos disponibles son:

```text
Solicitud duplicada
Reporte inválido
Ya resuelto
Otro
```

## Resultados

| Criterio | Observación | Severidad |
|---|---|---:|
| Prevención | El cierre requiere iniciar explícitamente el flujo antes de confirmar. | 0 |
| Control | Existe la opción `Cancelar cierre`. | 0 |
| Reconocimiento | El motivo de cierre se selecciona entre opciones comprensibles. | 0 |
| Validación | Una solicitud duplicada requiere una solicitud relacionada. | 0 |
| Confirmación | La acción final se identifica como `Confirmar cierre`. | 0 |

Durante la mejora de usabilidad se agregaron además etiquetas visibles para:

```text
Motivo de cierre
Detalle del motivo
Solicitud relacionada
```

## Resultado

**PASS**

---

# 6. Panel Técnico

## Elementos evaluados

Se revisaron:

- Solicitudes asignadas.
- Inicio y finalización de trabajo.
- Comentarios.
- Estados.
- Historial.
- Solicitudes completadas.

## Aspectos positivos

El encabezado:

```text
Panel Técnico
Solicitudes de mantenimiento asignadas
```

indica claramente el contexto.

Las solicitudes activas permiten registrar comentarios.

El botón `Comentar` permanece deshabilitado mientras el campo esté vacío.

Las solicitudes completadas muestran:

```text
✓ Trabajo completado
```

y dejan de presentar acciones operativas.

---

# Hallazgo UX-02 / DEF-14

## Situación observada

Durante la evaluación se presionó:

```text
Finalizar
```

sobre una solicitud en estado:

```text
En Proceso
```

El sistema cambió inmediatamente el estado a:

```text
Finalizada
```

sin solicitar confirmación.

## Riesgo

Un clic accidental podía finalizar una solicitud todavía activa.

Después de finalizarla:

- El Técnico deja de poder agregar comentarios.
- El trabajo queda marcado como completado.
- Para recuperar la solicitud es necesaria la intervención del Administrador mediante reapertura.

## Severidad

**Media**

## Principio afectado

Prevención de errores y control del usuario.

---

# Corrección de DEF-14

Se incorporó un paso de confirmación antes de finalizar.

Al pulsar:

```text
Finalizar
```

el sistema ahora muestra:

```text
¿Finalizar esta solicitud?

Después de finalizarla no podrá agregar más comentarios,
salvo que un administrador la reabra.

Cancelar
Finalizar solicitud
```

---

## Regresión — Cancelar

Se seleccionó:

```text
Cancelar
```

Resultado esperado:

```text
Estado: En Proceso
```

Resultado obtenido:

**PASS**

La solicitud permaneció En Proceso y el Técnico pudo continuar agregando comentarios.

---

## Regresión — Confirmar

Se volvió a seleccionar:

```text
Finalizar
```

y posteriormente:

```text
Finalizar solicitud
```

Resultado esperado:

```text
Estado: Finalizada
```

Resultado obtenido:

**PASS**

La interfaz mostró:

```text
✓ Trabajo completado
```

y las acciones para agregar comentarios dejaron de estar disponibles.

## Estado

**CERRADO**

---

# Hallazgos cosméticos no bloqueantes

Durante la inspección también se identificaron oportunidades de mejora que no impiden completar tareas:

1. El contador de solicitudes del Solicitante y del Técnico muestra únicamente un número y podría incluir una etiqueta.
2. La columna Técnico es redundante dentro del panel del propio Técnico.
3. La columna Solicitante es redundante dentro del panel del propio Solicitante.
4. El campo de comentarios podría incorporar una etiqueta visible además del placeholder.
5. El Login podría incluir una opción para mostrar u ocultar contraseña.
6. En escenarios con un número elevado de solicitudes podrían incorporarse búsqueda, filtros o paginación.

Estas observaciones se consideran mejoras futuras y no defectos bloqueantes del MVP actual.

---

# Limitaciones de la evaluación

La evaluación realizada fue heurística y no incluyó participantes externos.

Por lo tanto, no se obtuvieron métricas como:

- Tiempo promedio de tarea por usuario.
- Tasa de éxito de participantes externos.
- Escalas SUS.
- Satisfacción percibida de usuarios reales.

Tampoco se realizó en esta sesión una auditoría formal de accesibilidad con tecnologías asistivas.

Por este motivo los resultados deben interpretarse como una inspección de usabilidad del MVP y no como un estudio representativo de usuarios finales.

---

# Regresión técnica posterior

Después de corregir DEF-13 y DEF-14 se ejecutó nuevamente la regresión automatizada.

## Oxlint

```text
Found 0 warnings and 0 errors.
29 files
92 rules
```

Resultado:

**PASS**

---

## Vitest

```text
Test Files  2 passed (2)
Tests       14 passed (14)
```

Resultado:

**PASS**

---

## Vite Build

```text
45 modules transformed.
✓ built
```

Resultado:

**PASS**

---

## Playwright

```text
2 passed
```

Resultado:

**PASS**

---

# Resumen

| Métrica | Resultado |
|---|---:|
| Roles evaluados | 3 |
| Interfaces principales evaluadas | 6 |
| Defectos de usabilidad encontrados | 2 |
| Defectos corregidos | 2 |
| Defectos abiertos | 0 |
| Mejoras cosméticas registradas | 6 |

## Defectos encontrados

```text
DEF-13  Etiquetas ausentes en controles administrativos  → CERRADO
DEF-14  Finalización sin confirmación                     → CERRADO
```

## Resultado general

**PASS**

La evaluación heurística permitió identificar y corregir dos problemas de usabilidad reales sin necesidad de realizar cambios estructurales sobre el MVP.

Después de las correcciones, las interfaces principales permiten ejecutar los flujos críticos de forma clara, consistente y con mayores mecanismos de prevención de errores.