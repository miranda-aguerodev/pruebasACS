# NovaTech — Pruebas Exploratorias

## Objetivo

Explorar NovaTech de manera estructurada para identificar comportamientos inesperados relacionados con roles, permisos, persistencia de información, historial y transiciones del ciclo de vida de las solicitudes.

A diferencia de los casos de prueba funcionales previamente definidos, esta sesión no siguió una secuencia rígida de pasos.

Se utilizó un charter de exploración para orientar las pruebas hacia áreas consideradas de mayor riesgo para el producto.

---

# 1. Charter de exploración

## Identificador

`EXP-01`

## Nombre

Exploración de roles, permisos y transiciones de solicitudes.

## Objetivo del charter

Explorar el comportamiento del sistema intentando realizar acciones dentro y fuera del flujo normal de cada rol, verificando especialmente controles de acceso, persistencia, restricciones de estados e historial.

## Áreas exploradas

- Acceso a paneles según rol.
- Restricciones entre Solicitante, Técnico y Administrador.
- Solicitudes sin técnico asignado.
- Solicitudes cerradas.
- Reapertura de solicitudes.
- Persistencia de información.
- Comentarios técnicos.
- Historial y trazabilidad.
- Transiciones de estado fuera del flujo normal.

## Riesgos considerados

- Un usuario puede acceder a funcionalidades correspondientes a otro rol.
- Un técnico puede visualizar solicitudes que no tiene asignadas.
- Una solicitud cerrada puede continuar siendo modificada.
- Una reapertura puede dejar la solicitud en un estado inconsistente.
- Los cambios pueden perderse después de recargar la aplicación.
- Los comentarios pueden desaparecer al cambiar de sesión.
- El historial puede no registrar correctamente las acciones.
- Pueden permitirse transiciones de estado incoherentes.

---

# 2. Enfoque de exploración

Durante la sesión se utilizó principalmente un **tour de flujo de trabajo**.

El flujo normal de referencia fue:

```text
Solicitante
    ↓
Crear solicitud
    ↓
Pendiente
    ↓
Administrador
    ↓
Asignar prioridad y técnico
    ↓
Técnico
    ↓
Iniciar trabajo
    ↓
En Proceso
    ↓
Agregar comentarios
    ↓
Finalizar
    ↓
Finalizada
    ↓
Administrador
    ↓
Cerrar o reabrir
```

Durante la exploración se realizaron desviaciones intencionales de este flujo para comprobar cómo respondía NovaTech.

---

# 3. Escenarios ejecutados

## EXP-01-A — Acceso directo a panel de otro rol

### Objetivo

Comprobar si un usuario autenticado puede acceder manualmente a una ruta correspondiente a otro rol.

### Ejecución

Se inició sesión con el rol Solicitante.

Posteriormente se intentó acceder directamente a:

```text
http://localhost:5173/admin
```

### Resultado esperado

El Solicitante no debe poder acceder al Panel de Administración.

### Resultado obtenido

**PASS**

El sistema bloqueó el acceso desde la interfaz y redirigió al usuario hacia:

```text
/login
```

### Clasificación

**Sin hallazgo**

El control de acceso de rutas según rol funcionó correctamente desde la interfaz.

---

## EXP-01-B — Técnico y solicitudes no asignadas

### Objetivo

Comprobar si las solicitudes que no han sido asignadas a un técnico aparecen dentro de su panel de trabajo.

### Ejecución

Se utilizaron solicitudes registradas que aparecían como:

```text
Sin asignar
```

Posteriormente se inició sesión como Técnico NovaTech y se revisó el Panel Técnico.

### Resultado esperado

Las solicitudes sin técnico asignado no deben aparecer dentro de `Mis solicitudes` del técnico.

### Resultado obtenido

**PASS**

Las solicitudes no asignadas no aparecieron dentro del Panel Técnico.

El técnico visualizó únicamente las solicitudes que habían sido asignadas a su usuario.

### Clasificación

**Sin hallazgo**

El filtrado de solicitudes según técnico funcionó correctamente.

---

## EXP-01-C — Solicitudes cerradas

### Objetivo

Comprobar si una solicitud Cerrada puede continuar siendo modificada por el técnico.

### Ejecución

Se revisaron solicitudes previamente cerradas desde el Panel Técnico.

### Resultado esperado

Una solicitud Cerrada debe permanecer en modo de solo lectura y no debe permitir:

- Agregar comentarios.
- Modificar el estado.
- Finalizar nuevamente el trabajo.

### Resultado obtenido

**PASS**

Las solicitudes Cerradas mostraron únicamente:

```text
✓ Trabajo completado
```

y:

```text
Ver historial
```

Los controles para modificar el trabajo dejaron de estar disponibles.

### Clasificación

**Sin hallazgo**

Las solicitudes cerradas permanecieron correctamente protegidas contra modificaciones desde el Panel Técnico.

---

## EXP-01-D — Reapertura de solicitud

### Objetivo

Comprobar qué ocurre después de reabrir una solicitud Finalizada y verificar que el técnico pueda continuar trabajando normalmente.

### Ejecución

Se utilizó la solicitud #1:

```text
Aire acondicionado no enciende
```

La solicitud se encontraba en estado:

```text
Finalizada
```

Desde el Panel de Administración se utilizó la acción:

```text
Reabrir
```

Posteriormente se inició sesión nuevamente como Técnico NovaTech.

### Resultado esperado

La solicitud debe:

- Cambiar a `En Proceso`.
- Continuar asignada al técnico.
- Permitir agregar comentarios nuevamente.
- Permitir Finalizar nuevamente.
- Registrar la reapertura en el historial.

### Resultado obtenido

**PASS**

La solicitud cambió correctamente a:

```text
En Proceso
```

El técnico recuperó las acciones:

- Finalizar.
- Agregar comentario.
- Comentar.
- Ver historial.

El historial registró:

```text
Administrador NovaTech
Evento del Sistema
Solicitud reabierta
```

### Clasificación

**Sin hallazgo**

La reapertura restauró correctamente el flujo de trabajo de la solicitud.

---

## EXP-01-E — Persistencia de información

### Objetivo

Comprobar que los cambios realizados sobre una solicitud permanezcan almacenados después de recargar la página y cambiar de usuario.

### Ejecución

Después de reabrir la solicitud #1, el Técnico NovaTech agregó el comentario:

```text
Prueba de persistencia después de reapertura
```

Posteriormente se realizaron las siguientes acciones:

1. Se verificó el comentario en el historial.
2. Se recargó completamente la aplicación.
3. Se volvió a consultar el historial.
4. Se cerró la sesión del técnico.
5. Se inició sesión como Administrador.
6. Se consultó nuevamente el historial de la solicitud.

### Resultado esperado

Después de recargar y cambiar de usuario deben mantenerse:

- El estado de la solicitud.
- La asignación del técnico.
- Los comentarios.
- Los eventos anteriores.
- La reapertura.
- Las fechas y responsables.

### Resultado obtenido

**PASS**

Después de recargar la aplicación:

- La solicitud continuó en `En Proceso`.
- El comentario permaneció almacenado.
- La reapertura continuó visible.
- Los eventos anteriores permanecieron disponibles.

Después de iniciar sesión como Administrador, el mismo historial continuó disponible.

### Clasificación

**Sin hallazgo**

La persistencia de la información funcionó correctamente.

---

## EXP-01-F — Transiciones de estado e historial

### Objetivo

Explorar si NovaTech controla correctamente las transiciones entre los diferentes estados del ciclo de vida de una solicitud.

### Ejecución

Se utilizó la solicitud #6.

Estado inicial:

```text
Pendiente
```

Técnico:

```text
Sin asignar
```

Desde el Panel de Administración se intentó cambiar directamente el estado de:

```text
Pendiente
```

a:

```text
Finalizada
```

sin:

- Asignar un técnico.
- Pasar por `En Proceso`.
- Registrar trabajo técnico.

### Resultado esperado

El sistema debería impedir una transición que no corresponde con el flujo normal de trabajo.

El flujo normal esperado es:

```text
Pendiente
    ↓
En Proceso
    ↓
Finalizada
    ↓
Cerrada
```

### Resultado obtenido

**FAIL**

NovaTech permitió cambiar directamente la solicitud de:

```text
Pendiente → Finalizada
```

sin asignar técnico y sin pasar por el estado `En Proceso`.

La solicitud quedó con la combinación:

```text
Estado: Finalizada
Técnico: Sin asignar
```

### Validación del historial

Se abrió posteriormente `Ver historial`.

El sistema registró correctamente:

```text
Solicitante NovaTech
Evento del Sistema
Solicitud creada
```

y posteriormente:

```text
Administrador NovaTech
Evento del Sistema
Estado cambiado de pendiente a finalizada
```

Esto confirmó que el mecanismo de trazabilidad funcionaba correctamente, aunque la transición permitida era incoherente con el flujo de negocio.

### Clasificación

**Defecto**

### Defecto asociado

`DEF-10 — Transiciones de estado no validadas`

---

# 4. Análisis de DEF-10

## Descripción

NovaTech permitía que el Administrador modificara el estado de una solicitud sin comprobar si la transición correspondía con el ciclo de vida esperado.

Durante la prueba exploratoria fue posible cambiar una solicitud directamente de:

```text
Pendiente → Finalizada
```

aunque:

- No tenía técnico asignado.
- Nunca estuvo `En Proceso`.
- No existió intervención técnica.

## Impacto

El sistema podía almacenar solicitudes en estados incoherentes con el proceso de mantenimiento.

Ejemplo:

```text
Estado: Finalizada
Técnico: Sin asignar
```

Esto podía afectar:

- La consistencia del flujo de trabajo.
- La interpretación de indicadores.
- La trazabilidad.
- La confiabilidad de reportes futuros.

## Severidad

**Media**

---

# 5. Refinamiento de la regla de negocio

Durante el análisis del defecto se identificó una excepción válida.

Varios usuarios pueden reportar el mismo problema. Por ejemplo, diferentes personas pueden registrar solicitudes relacionadas con el mismo equipo o incidente.

En ese caso no sería correcto asignar un segundo técnico ni simular un trabajo técnico independiente.

Por esta razón se definieron dos tipos de flujo.

## Flujo normal

```text
Pendiente → En Proceso → Finalizada → Cerrada
```

Reglas:

```text
Pendiente → En Proceso       ✅ Requiere técnico
Pendiente → Finalizada       ❌ No permitido

En Proceso → Finalizada      ✅ Requiere técnico

Finalizada → En Proceso      ✅ Reapertura
Finalizada → Cerrada         ✅ Cierre normal

Cerrada → Otro estado        ❌ No permitido
```

## Cierre administrativo excepcional

También se definió:

```text
Pendiente → Cerrada
```

como una transición válida únicamente cuando existe una justificación administrativa.

Los motivos incorporados en NovaTech son:

- Solicitud duplicada.
- Reporte inválido.
- Ya resuelto.
- Otro.

Cuando el motivo es:

```text
Solicitud duplicada
```

se debe indicar una solicitud relacionada.

---

# 6. Corrección aplicada

La validación se implementó tanto en backend como en frontend.

## Backend

El endpoint:

```text
PUT /api/solicitudes/:id
```

ahora valida las transiciones permitidas antes de actualizar la base de datos.

También comprueba que:

- Una solicitud no pueda pasar de Pendiente a Finalizada.
- Una solicitud no pueda pasar a En Proceso sin técnico.
- Una solicitud no pueda pasar a Finalizada sin técnico.
- Una solicitud Cerrada no pueda seguir modificándose.
- Un cierre administrativo desde Pendiente incluya un motivo.
- Una solicitud duplicada incluya una solicitud relacionada.
- La solicitud relacionada exista.
- Una solicitud no pueda relacionarse consigo misma.

## Frontend

El Panel de Administración fue ajustado para mostrar únicamente las transiciones válidas.

Para una solicitud Pendiente, el selector de estado muestra:

```text
Pendiente
En Proceso
```

La opción de cierre excepcional se presenta mediante:

```text
Cerrar administrativamente
```

Desde este flujo se solicita un motivo y, cuando corresponde, una solicitud relacionada.

---

# 7. Regresión de DEF-10

Después de aplicar la corrección se ejecutaron pruebas de regresión.

| Prueba | Resultado esperado | Resultado |
|---|---|---|
| Pendiente → Finalizada | Rechazado | PASS |
| Pendiente → En Proceso sin técnico | Rechazado | PASS |
| Pendiente → Cerrada con motivo administrativo | Permitido | PASS |
| Duplicada sin solicitud relacionada | Rechazado | PASS |
| Duplicada con solicitud inexistente | Rechazado | PASS |
| Duplicada relacionada consigo misma | Rechazado | PASS |
| Duplicada con solicitud existente | Permitido | PASS |
| Registro del motivo en historial | Registrado | PASS |
| Registro de solicitud relacionada | Registrado | PASS |

Una de las respuestas verificadas directamente desde la API fue:

```text
Transición de estado no permitida: pendiente → finalizada
```

También se comprobó:

```text
Debe asignar un técnico antes de cambiar la solicitud a ese estado
```

para el intento de iniciar trabajo sin técnico.

---

# 8. Evidencia de cierre administrativo

Se realizó un cierre administrativo de una solicitud utilizando:

```text
Motivo: Solicitud duplicada
Caso relacionado: Solicitud #6
```

El historial registró:

```text
Administrador NovaTech
Evento del sistema

Solicitud cerrada. Motivo: Solicitud duplicada.
Caso relacionado: Solicitud #6
```

La solicitud quedó:

```text
Estado: Cerrada
Técnico: Sin asignar
```

En este caso la ausencia de técnico es válida, ya que se trata de un cierre administrativo y no de la finalización de un trabajo de mantenimiento.

---

# 9. Estado de DEF-10

## Resultado inicial

**FAIL**

El escenario exploratorio permitió descubrir el defecto.

## Resultado después de la corrección

**PASS**

Las pruebas de regresión confirmaron que las nuevas reglas de negocio funcionan correctamente.

## Estado final

**CERRADO**

---

# 10. Registro de hallazgos

| ID | Escenario | Clasificación | Resultado inicial | Estado posterior |
|---|---|---|---|---|
| EXP-01-A | Acceso directo a panel de otro rol | Sin hallazgo | PASS | Correcto |
| EXP-01-B | Solicitudes no asignadas | Sin hallazgo | PASS | Correcto |
| EXP-01-C | Solicitudes cerradas | Sin hallazgo | PASS | Correcto |
| EXP-01-D | Reapertura | Sin hallazgo | PASS | Correcto |
| EXP-01-E | Persistencia | Sin hallazgo | PASS | Correcto |
| EXP-01-F | Transición directa Pendiente → Finalizada | Defecto DEF-10 | FAIL | Corregido y validado |

---

# 11. Resumen de la sesión exploratoria

| Resultado | Cantidad |
|---|---:|
| Escenarios ejecutados | 6 |
| PASS iniciales | 5 |
| FAIL iniciales | 1 |
| Defectos nuevos encontrados | 1 |
| Defectos corregidos posteriormente | 1 |
| Defectos abiertos relacionados con la sesión | 0 |

### Defecto identificado

`DEF-10 — Transiciones de estado no validadas`

### Severidad

**Media**

### Estado final

**Cerrado**

---

# 12. Resultados adicionales

La sesión exploratoria permitió comprobar satisfactoriamente:

- Protección de rutas por rol desde la interfaz.
- Filtrado de solicitudes según técnico asignado.
- Bloqueo de edición de solicitudes cerradas.
- Funcionamiento de la reapertura.
- Persistencia de datos después de recargar.
- Persistencia entre diferentes sesiones.
- Registro cronológico de eventos y comentarios.
- Identificación de transiciones de estado incoherentes.

Además, la exploración permitió refinar una regla de negocio que no había sido contemplada inicialmente:

**Una solicitud Pendiente puede cerrarse sin intervención técnica cuando existe una excepción administrativa válida, como un reporte duplicado.**

---

# 13. Regresión técnica posterior

Después de implementar las correcciones se ejecutaron nuevamente controles técnicos del frontend.

## Análisis estático — Oxlint

Resultado:

```text
Found 0 warnings and 0 errors.
29 files
92 rules
```

**PASS**

## Pruebas unitarias — Vitest

Resultado:

```text
Test Files  2 passed (2)
Tests       14 passed (14)
```

**PASS**

## Build de producción — Vite

Resultado final:

```text
45 modules transformed
✓ built
```

**PASS**

## Pruebas End-to-End — Playwright

Resultado:

```text
2 passed
```

**PASS**

---

# 14. Estado de la sesión

**Charter:** Completado.

**Escenarios ejecutados:** 6 de 6.

**Escenarios aprobados inicialmente:** 5.

**Escenarios con hallazgo:** 1.

**Defectos identificados:** 1.

**Defectos corregidos:** 1.

**Defectos abiertos:** 0.

**Estado general:** COMPLETADO CON HALLAZGO CORREGIDO.

---

# 15. Conclusión

La prueba exploratoria complementó los casos de prueba estructurados al permitir desviarse intencionalmente del flujo normal de NovaTech y observar el comportamiento del sistema ante situaciones no contempladas previamente.

Los escenarios relacionados con roles, solicitudes asignadas, solicitudes cerradas, reapertura, persistencia e historial funcionaron correctamente.

La exploración permitió descubrir `DEF-10`, relacionado con la ausencia de reglas de negocio para validar las transiciones entre estados.

El análisis posterior permitió además identificar una excepción legítima para solicitudes duplicadas, lo que llevó a mejorar la lógica del producto en lugar de limitarse únicamente a bloquear estados.

El defecto fue corregido en backend y frontend y posteriormente validado mediante pruebas de regresión.

El proceso aplicado fue:

**Charter → Exploración → Observación → Identificación del defecto → Análisis de negocio → Corrección → Regresión → Cierre**