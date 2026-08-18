# NovaTech — Registro de Defectos

## Objetivo

Documentar los defectos identificados durante el desarrollo, las pruebas funcionales, automatizadas, exploratorias y de regresión del Sistema de Gestión de Solicitudes de Mantenimiento NovaTech.

| ID | Defecto | Severidad | Estado | Solución aplicada |
|---|---|---|---|---|
| DEF-01 | El archivo `TechnicianDashboard.jsx` contenía dos `export default`, provocando que Vite no compilara la aplicación. | Alta | Cerrado | Se eliminó la definición duplicada y se dejó un único componente exportado. |
| DEF-02 | Código correspondiente a `TechnicianRequestActions` fue colocado accidentalmente en `StatusBadge.jsx`, provocando pantalla en blanco al ingresar como técnico. | Alta | Cerrado | Se restauró `StatusBadge.jsx` y se ubicó la lógica en el componente correcto. |
| DEF-03 | Los comentarios del técnico se almacenaban correctamente en MySQL, pero no podían visualizarse posteriormente desde la interfaz. | Media | Cerrado | Se creó `RequestHistory.jsx` y se agregó la consulta del historial desde la interfaz. |
| DEF-04 | Una solicitud finalizada continuaba mostrando controles generales de edición al administrador. | Media | Cerrado | Se implementó el flujo Finalizada → Cerrar/Reabrir y Cerrada → Solo lectura. |
| DEF-05 | La tarjeta “Finalizadas” contabilizaba también las solicitudes cerradas. | Baja | Cerrado | Se separaron los conteos de solicitudes Finalizadas y Cerradas. |
| DEF-06 | El botón “Comentar” no comunicaba visualmente con suficiente claridad que estaba deshabilitado cuando el campo estaba vacío y no proporcionaba retroalimentación suficiente al usuario. | Baja | Cerrado | Se mejoró el estado visual del botón deshabilitado, se agregó un tooltip explicativo y posteriormente se reemplazaron las alertas nativas por notificaciones tipo toast no intrusivas. |
| DEF-07 | Los headers personalizados enviados mediante `apiRequest` sobrescribían el header predeterminado `Content-Type: application/json`. | Media | Cerrado | Una prueba unitaria automatizada con Vitest detectó el defecto. Se corrigió el orden de construcción de las opciones de `fetch` para conservar el `Content-Type` junto con headers adicionales. |
| DEF-08 | Los campos Descripción y Ubicación no validaban sus longitudes máximas antes del envío. Al superar 255 y 120 caracteres respectivamente, la base de datos rechazaba la operación con `ER_DATA_TOO_LONG` y la interfaz mostraba un mensaje genérico. | Baja | Cerrado | Se agregó `maxLength` y contador visual en frontend, además de validación explícita en backend con respuestas HTTP 400 y mensajes específicos. |
| DEF-09 | Los textos extensos permitidos en los campos Descripción y Ubicación desbordaban sus celdas en la tabla y afectaban la visualización de otras columnas. | Baja | Cerrado | Se limitaron visualmente las columnas de Descripción y Ubicación a dos líneas, aplicando control de overflow, ajuste de palabras y visualización del contenido completo mediante tooltip. |
| DEF-10 | NovaTech permitía transiciones de estado sin validar el contexto del flujo de negocio. Durante una prueba exploratoria fue posible cambiar una solicitud directamente de Pendiente a Finalizada sin técnico asignado y sin pasar por En Proceso. | Media | Cerrado | Se implementaron reglas de transición en backend y frontend. Pendiente → En Proceso requiere técnico; En Proceso → Finalizada requiere técnico; Finalizada → En Proceso permite reapertura; Finalizada → Cerrada permite cierre normal. También se agregó Pendiente → Cerrada como excepción administrativa justificada. Para solicitudes duplicadas se exige una solicitud relacionada existente y diferente de la solicitud actual. |
| DEF-11 | Los textos extensos, especialmente ubicaciones cercanas al máximo permitido, podían desbordar horizontalmente el modal de historial. | Baja | Cerrado | Se agregaron reglas CSS de `overflow-wrap`, `word-break`, límites de ancho y control de overflow horizontal al modal, encabezado, resumen y entradas del historial. |

---

## Detalle de DEF-10

### Origen

El defecto fue identificado durante la sesión de pruebas exploratorias `EXP-01`.

Se utilizó una solicitud en estado:

```text
Pendiente
```

sin técnico asignado.

El administrador pudo modificarla directamente a:

```text
Finalizada
```

sin pasar por el flujo esperado:

```text
Pendiente
→ En Proceso
→ Finalizada
→ Cerrada
```

### Riesgo identificado

El comportamiento permitía almacenar solicitudes en estados incoherentes con el proceso real de mantenimiento.

Ejemplo observado:

```text
Estado: Finalizada
Técnico: Sin asignar
```

### Ajuste de la regla de negocio

Durante el análisis del defecto se identificó una excepción válida: varias personas pueden reportar el mismo problema.

Por este motivo se definió el siguiente comportamiento:

```text
Pendiente → En Proceso       ✅ Requiere técnico
Pendiente → Finalizada       ❌ No permitido
Pendiente → Cerrada          ✅ Cierre administrativo justificado

En Proceso → Finalizada      ✅ Requiere técnico

Finalizada → En Proceso      ✅ Reapertura
Finalizada → Cerrada         ✅ Cierre normal

Cerrada → Otro estado        ❌ No permitido
```

### Cierre administrativo

Una solicitud Pendiente puede cerrarse sin técnico únicamente mediante una excepción administrativa.

Los motivos disponibles en la interfaz incluyen:

- Solicitud duplicada.
- Reporte inválido.
- Ya resuelto.
- Otro.

Cuando se selecciona:

```text
Solicitud duplicada
```

NovaTech exige indicar una solicitud relacionada.

El backend valida que:

1. Se haya indicado una solicitud relacionada.
2. La solicitud relacionada exista.
3. La solicitud no se relacione consigo misma.

### Regresión ejecutada

Se realizaron las siguientes comprobaciones:

| Prueba | Resultado esperado | Resultado |
|---|---|---|
| Pendiente → Finalizada | Rechazado | PASS |
| Pendiente → En Proceso sin técnico | Rechazado | PASS |
| Pendiente → Cerrada con motivo administrativo | Permitido | PASS |
| Duplicada con solicitud inexistente | Rechazado | PASS |
| Duplicada con solicitud existente | Permitido | PASS |
| Registro del motivo en historial | Registrado | PASS |
| Registro de solicitud relacionada | Registrado | PASS |

El historial confirmó correctamente un cierre como:

```text
Solicitud cerrada. Motivo: Solicitud duplicada.
Caso relacionado: Solicitud #6
```

### Estado final

**CERRADO**

---

## Detalle de DEF-11

### Origen

El defecto fue detectado visualmente durante la revisión del historial de una solicitud creada con una ubicación cercana al límite máximo permitido de 120 caracteres.

### Comportamiento observado

El texto de ubicación excedía visualmente el ancho disponible dentro del encabezado del modal de historial.

Esto provocaba:

- Desbordamiento horizontal.
- Dificultad de lectura.
- Pérdida de consistencia visual.

### Corrección

Se agregaron reglas CSS para:

- Limitar el ancho máximo del modal.
- Evitar overflow horizontal.
- Permitir ruptura de cadenas largas.
- Ajustar palabras dentro del encabezado.
- Ajustar textos dentro del resumen.
- Ajustar contenido de las entradas del historial.

Se utilizaron principalmente:

```css
overflow-wrap: anywhere;
word-break: break-word;
overflow-x: hidden;
min-width: 0;
```

### Regresión

Se volvió a abrir el historial de una solicitud con una ubicación extensa.

Resultado:

**PASS**

El contenido ahora se divide en varias líneas dentro del modal sin provocar desplazamiento horizontal.

### Estado final

**CERRADO**

---

## Regresión posterior a las correcciones

Después de corregir DEF-10 y DEF-11 se ejecutaron nuevamente las principales comprobaciones técnicas del frontend.

### Análisis estático

Herramienta:

```text
Oxlint
```

Resultado:

```text
Found 0 warnings and 0 errors.
29 files
92 rules
```

**PASS**

### Pruebas unitarias

Herramienta:

```text
Vitest
```

Resultado:

```text
Test Files  2 passed (2)
Tests       14 passed (14)
```

**PASS**

### Build de producción

Herramienta:

```text
Vite
```

Después de corregir la resolución del import de `AuthProvider`, el resultado fue:

```text
45 modules transformed
✓ built
```

**PASS**

### Pruebas End-to-End

Herramienta:

```text
Playwright
```

Resultado:

```text
2 passed
```

**PASS**

---

## Resumen

- Total de defectos registrados: **11**
- Defectos cerrados: **11**
- Defectos abiertos: **0**
- Defectos de severidad alta: **2**
- Defectos de severidad media: **4**
- Defectos de severidad baja: **5**
- Defectos críticos o bloqueantes pendientes: **0**

### Estado general

**Todos los defectos registrados se encuentran corregidos y cerrados.**