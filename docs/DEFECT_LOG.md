# NovaTech — Registro de Defectos

## Objetivo

Documentar los defectos identificados durante el desarrollo, las pruebas funcionales, automatizadas, exploratorias, de seguridad, usabilidad y regresión del Sistema de Gestión de Solicitudes de Mantenimiento NovaTech.

---

## Registro general de defectos

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
| DEF-12 | Los endpoints del backend podían consultarse y modificarse directamente sin autenticación ni autorización efectiva por rol. Las restricciones existentes en React protegían la interfaz, pero podían omitirse mediante peticiones directas a la API. | Alta | Cerrado | Se implementó autenticación mediante JWT, envío automático del token desde el frontend y autorización por rol y propiedad en el backend. El servidor obtiene la identidad y rol desde el JWT y aplica restricciones específicas para Administrador, Técnico y Solicitante. |
| DEF-13 | Los controles de Prioridad, Estado y Técnico del Administrador aparecían como selectores consecutivos sin etiquetas visibles, obligando al usuario a inferir la función de cada control. | Baja | Cerrado | Se agregaron etiquetas visibles para Prioridad, Estado y Técnico. El botón `Guardar` se cambió a `Guardar cambios` y permanece deshabilitado mientras no existan modificaciones. También se mejoró el etiquetado del cierre administrativo. |
| DEF-14 | El Técnico podía finalizar una solicitud con un solo clic, sin confirmación previa, provocando riesgo de finalizar accidentalmente un trabajo todavía activo. | Media | Cerrado | Se agregó un paso de confirmación antes de finalizar. El usuario puede cancelar y continuar trabajando o confirmar explícitamente la finalización. |

---

# Detalle de DEF-10

## Origen

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

## Riesgo identificado

El comportamiento permitía almacenar solicitudes en estados incoherentes con el proceso real de mantenimiento.

Ejemplo observado:

```text
Estado: Finalizada
Técnico: Sin asignar
```

## Ajuste de la regla de negocio

Se definió el siguiente comportamiento:

```text
Pendiente → En Proceso       Requiere técnico
Pendiente → Finalizada       No permitido
Pendiente → Cerrada          Cierre administrativo justificado

En Proceso → Finalizada      Requiere técnico

Finalizada → En Proceso      Reapertura
Finalizada → Cerrada         Cierre normal

Cerrada → Otro estado        No permitido
```

## Cierre administrativo

Una solicitud Pendiente puede cerrarse sin técnico únicamente mediante una excepción administrativa.

Los motivos disponibles incluyen:

- Solicitud duplicada.
- Reporte inválido.
- Ya resuelto.
- Otro.

Para una solicitud duplicada, el backend valida que:

1. Se haya indicado una solicitud relacionada.
2. La solicitud relacionada exista.
3. La solicitud no se relacione consigo misma.

## Regresión ejecutada

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

## Estado final

**CERRADO**

---

# Detalle de DEF-11

## Origen

El defecto fue detectado visualmente durante la revisión del historial de una solicitud creada con una ubicación cercana al límite máximo permitido de 120 caracteres.

## Comportamiento observado

El texto de ubicación excedía visualmente el ancho disponible dentro del encabezado del modal de historial.

Esto provocaba:

- Desbordamiento horizontal.
- Dificultad de lectura.
- Pérdida de consistencia visual.

## Corrección

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

## Regresión

Se volvió a abrir el historial de una solicitud con una ubicación extensa.

Resultado:

**PASS**

El contenido ahora se divide en varias líneas dentro del modal sin provocar desplazamiento horizontal.

## Estado final

**CERRADO**

---

# Detalle de DEF-12

## Origen

El defecto fue identificado mediante pruebas directas sobre la API después de comprobar que las rutas protegidas del frontend impedían navegar entre paneles correspondientes a distintos roles.

Se buscó verificar si esa protección también existía realmente en el backend.

---

## Hallazgo 1 — API accesible sin autenticación

Se realizó una petición directa al endpoint:

```text
GET /api/solicitudes
```

sin iniciar sesión y sin enviar ningún token.

### Resultado esperado

```text
401 Unauthorized
```

### Resultado obtenido inicialmente

**FAIL**

La API respondió con la lista de solicitudes almacenadas.

Esto confirmó que las restricciones existentes en React protegían la interfaz, pero no los endpoints del servidor.

---

## Hallazgo 2 — Falta de autorización por rol

Después de incorporar autenticación mediante JWT se inició sesión como:

```text
Rol: Solicitante
```

y se intentó modificar directamente la prioridad mediante:

```text
PUT /api/solicitudes/1
```

### Resultado esperado

La operación debía ser rechazada porque modificar prioridades corresponde al Administrador.

### Resultado obtenido inicialmente

**FAIL**

La API respondió:

```text
Solicitud actualizada correctamente
```

Esto confirmó que existía autenticación, pero todavía no autorización efectiva por rol.

---

## Riesgo identificado

El defecto permitía omitir las restricciones de la interfaz mediante peticiones directas al backend.

Entre los riesgos estaban:

- Consultar solicitudes sin autenticación.
- Consultar recursos que no correspondieran al usuario.
- Modificar prioridades desde un rol no autorizado.
- Modificar solicitudes no asignadas a un técnico.
- Consultar historiales ajenos.
- Suplantar identificadores enviados desde el cliente.
- Ejecutar operaciones administrativas directamente sobre la API.

Se clasificó como:

**Alta**

---

# Corrección de DEF-12

## Autenticación mediante JWT

Se incorporó autenticación mediante JSON Web Tokens.

El endpoint:

```text
POST /api/login
```

genera un token que contiene:

```text
id
email
rol
```

con una duración configurada de:

```text
8 horas
```

El secreto utilizado se almacena mediante:

```text
JWT_SECRET
```

dentro del archivo:

```text
.env
```

El archivo `.env` permanece excluido del repositorio.

---

## Protección de endpoints

Los endpoints protegidos requieren:

```text
Authorization: Bearer <token>
```

Los endpoints públicos son:

```text
GET /api/health
POST /api/login
```

El resto de las operaciones bajo `/api` requieren autenticación.

---

## Autorización por rol

El backend utiliza la identidad y rol contenidos en el JWT.

Ya no confía en valores proporcionados por el cliente como:

```text
usuario_id
solicitante_id
```

para determinar la identidad real.

### Solicitante

Puede:

- Crear solicitudes.
- Consultar sus solicitudes.
- Consultar su historial.

No puede:

- Cambiar prioridades.
- Asignar técnicos.
- Modificar estados administrativos.
- Ejecutar operaciones de otros roles.

### Técnico

Puede:

- Consultar solicitudes asignadas.
- Consultar sus historiales.
- Iniciar solicitudes.
- Finalizar solicitudes.
- Registrar comentarios.

No puede:

- Modificar solicitudes no asignadas.
- Consultar historiales ajenos.
- Cambiar prioridades.
- Asignar técnicos.
- Ejecutar cierres administrativos.

### Administrador

Puede:

- Consultar todas las solicitudes.
- Consultar técnicos.
- Modificar prioridades.
- Asignar o reasignar técnicos.
- Gestionar estados.
- Cerrar y reabrir solicitudes.
- Ejecutar cierres administrativos.
- Consultar historiales.

---

# Regresión de DEF-12

| ID | Prueba | Resultado esperado | Resultado |
|---|---|---|---|
| AUTH-01 | Consultar solicitudes sin token | Rechazado con 401 | PASS |
| AUTH-02 | Solicitante intenta modificar prioridad | Rechazado con 403 | PASS |
| AUTH-03 | Técnico intenta modificar una solicitud no asignada | Rechazado con 403 | PASS |
| AUTH-04 | Técnico intenta consultar historial no asignado | Rechazado con 403 | PASS |
| AUTH-05 | Técnico consulta historial de solicitud asignada | Permitido | PASS |
| AUTH-06 | Técnico agrega comentario a solicitud asignada | Permitido | PASS |
| AUTH-07 | Solicitante crea una solicitud autenticado | Permitido | PASS |
| AUTH-08 | Solicitante envía otro `solicitante_id` como filtro | Se utiliza identidad del JWT | PASS |

## Evidencia destacada

Sin token:

```text
Autenticación requerida
```

Solicitante intentando modificar prioridad:

```text
El solicitante no puede modificar solicitudes
```

Técnico intentando modificar solicitud no asignada:

```text
No tiene permiso para modificar esta solicitud
```

Técnico intentando consultar historial ajeno:

```text
No tiene permiso para consultar esta solicitud
```

También se validaron correctamente los flujos autorizados.

El Técnico registró:

```text
Prueba de autorización JWT
```

y el Solicitante creó:

```text
Prueba autorización solicitante
```

## Estado final

**CERRADO**

---

# Detalle de DEF-13

## Origen

El defecto fue identificado durante la evaluación heurística de usabilidad.

Se revisó la interfaz utilizada por el Administrador para gestionar solicitudes.

## Comportamiento observado

En la columna:

```text
Acciones
```

aparecían tres selectores consecutivos, por ejemplo:

```text
Media
Pendiente
Sin asignar
```

sin etiquetas visibles.

Aunque el orden podía inferirse observando las columnas de la tabla, un usuario nuevo debía recordar o deducir que los controles correspondían a:

```text
Prioridad
Estado
Técnico
```

## Riesgo identificado

El diseño aumentaba innecesariamente la carga cognitiva y podía provocar que el Administrador modificara un campo diferente al esperado.

## Severidad

**Baja**

## Corrección

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

El botón permanece deshabilitado cuando los valores coinciden con los datos actualmente almacenados.

Cuando se modifica prioridad, estado o técnico, el botón se activa.

Además, dentro del cierre administrativo se incorporaron etiquetas para:

```text
Motivo de cierre
Detalle del motivo
Solicitud relacionada
```

## Regresión

Se verificó que:

| Prueba | Resultado |
|---|---|
| Las etiquetas Prioridad, Estado y Técnico son visibles | PASS |
| Los controles mantienen sus valores originales | PASS |
| `Guardar cambios` permanece deshabilitado sin modificaciones | PASS |
| Al modificar un campo el botón se habilita | PASS |
| El cierre administrativo mantiene su funcionamiento | PASS |

## Estado final

**CERRADO**

---

# Detalle de DEF-14

## Origen

El defecto fue identificado durante la evaluación heurística del panel Técnico.

Se utilizó una solicitud en estado:

```text
En Proceso
```

## Comportamiento observado

Al pulsar:

```text
Finalizar
```

la solicitud cambiaba inmediatamente a:

```text
Finalizada
```

sin solicitar confirmación.

## Riesgo identificado

Un clic accidental podía marcar como finalizado un trabajo todavía activo.

Después de finalizar:

- El Técnico ya no podía agregar comentarios.
- La solicitud quedaba registrada como completada.
- Era necesaria la intervención del Administrador para reabrirla.

## Severidad

**Media**

## Corrección

Se incorporó un paso de confirmación.

Al pulsar:

```text
Finalizar
```

se muestra:

```text
¿Finalizar esta solicitud?

Después de finalizarla no podrá agregar más comentarios,
salvo que un administrador la reabra.

Cancelar
Finalizar solicitud
```

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

La solicitud permaneció activa y el Técnico pudo continuar agregando comentarios.

## Regresión — Confirmar

Se volvió a pulsar:

```text
Finalizar
```

y después:

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

y dejó de presentar controles para agregar comentarios.

## Estado final

**CERRADO**

---

# Evaluación de usabilidad

Los defectos DEF-13 y DEF-14 fueron identificados durante una evaluación heurística de las interfaces correspondientes a:

- Login.
- Solicitante.
- Historial.
- Administrador.
- Cierre administrativo.
- Técnico.

La evaluación no utilizó participantes externos y no se presenta como un estudio formal con usuarios.

La evidencia detallada se encuentra en:

```text
docs/USABILITY_TESTING.md
```

Resultado:

```text
Defectos encontrados: 2
Defectos corregidos:  2
Defectos abiertos:     0
```

---

# Regresión técnica posterior a las correcciones

Después de corregir DEF-13 y DEF-14 se ejecutó nuevamente la regresión automatizada.

## Análisis estático

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

---

## Pruebas unitarias

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

---

## Build de producción

Herramienta:

```text
Vite
```

Resultado:

```text
45 modules transformed.
✓ built
```

**PASS**

---

## Pruebas End-to-End

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

# Resultado de la regresión final

```text
Oxlint      0 warnings / 0 errors
Vitest      14/14 pruebas
Vite build  PASS
Playwright  2/2 pruebas
```

Las correcciones de usabilidad no introdujeron regresiones detectables en las funcionalidades cubiertas por las pruebas automatizadas existentes.

---

# Resumen de defectos

| Métrica | Resultado |
|---|---:|
| Total de defectos registrados | 14 |
| Defectos cerrados | 14 |
| Defectos abiertos | 0 |
| Severidad alta | 3 |
| Severidad media | 5 |
| Severidad baja | 6 |
| Críticos o bloqueantes pendientes | 0 |

## Distribución por severidad

```text
Alta      3
Media     5
Baja      6
──────────
Total    14
```

## Estado general

**Todos los defectos registrados se encuentran corregidos y cerrados.**

La última regresión técnica finalizó satisfactoriamente con:

- **0 errores y 0 warnings en Oxlint.**
- **14 de 14 pruebas unitarias aprobadas.**
- **Build de producción exitoso.**
- **2 de 2 pruebas End-to-End aprobadas.**
- **Pruebas manuales de autenticación y autorización aprobadas.**
- **Evaluación heurística de usabilidad ejecutada.**
- **DEF-13 y DEF-14 corregidos y validados.**