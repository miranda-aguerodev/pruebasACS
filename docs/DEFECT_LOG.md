# NovaTech — Registro de Defectos

## Objetivo

Documentar los defectos identificados durante el desarrollo, las pruebas funcionales, automatizadas, exploratorias, de seguridad y de regresión del Sistema de Gestión de Solicitudes de Mantenimiento NovaTech.

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

Durante el análisis del defecto se identificó una excepción válida: varias personas pueden reportar el mismo problema.

Por este motivo se definió el siguiente comportamiento:

```text
Pendiente → En Proceso        Requiere técnico
Pendiente → Finalizada        No permitido
Pendiente → Cerrada           Cierre administrativo justificado

En Proceso → Finalizada       Requiere técnico

Finalizada → En Proceso       Reapertura
Finalizada → Cerrada          Cierre normal

Cerrada → Otro estado         No permitido
```

## Cierre administrativo

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

sin iniciar sesión y sin enviar ningún token de autenticación.

### Resultado esperado

El backend debía rechazar la petición con una respuesta de autenticación:

```text
401 Unauthorized
```

### Resultado obtenido inicialmente

**FAIL**

La API respondió con la lista de solicitudes almacenadas.

Esto permitió comprobar que las restricciones existentes en React protegían la navegación de la interfaz, pero no impedían acceder directamente a los endpoints del servidor.

---

## Hallazgo 2 — Falta de autorización por rol

Después de incorporar autenticación mediante JWT se realizó una segunda prueba.

Se inició sesión con:

```text
Rol: Solicitante
```

y se utilizó el token obtenido para intentar modificar directamente la prioridad de una solicitud mediante:

```text
PUT /api/solicitudes/1
```

### Resultado esperado

La modificación debía ser rechazada, debido a que cambiar la prioridad corresponde al rol Administrador.

### Resultado obtenido inicialmente

**FAIL**

La API respondió:

```text
Solicitud actualizada correctamente
```

La prueba confirmó que la primera implementación verificaba que existiera un usuario autenticado, pero todavía no comprobaba si su rol estaba autorizado para ejecutar la operación.

La prioridad modificada durante la prueba fue posteriormente restaurada por un usuario Administrador.

---

## Riesgo identificado

El defecto permitía omitir las restricciones de la interfaz mediante peticiones directas al backend.

Entre los riesgos identificados estaban:

- Consultar solicitudes sin autenticación.
- Consultar recursos que no correspondieran al usuario.
- Modificar prioridades desde un rol no autorizado.
- Intentar modificar solicitudes no asignadas a un técnico.
- Consultar historiales de solicitudes ajenas.
- Utilizar identificadores enviados por el cliente para intentar ejecutar operaciones sobre otro usuario.
- Ejecutar acciones administrativas mediante peticiones directas.

Debido al impacto potencial sobre la confidencialidad e integridad de la información, el defecto fue clasificado con severidad:

**Alta**

---

# Corrección de DEF-12

## Autenticación mediante JWT

Se incorporó autenticación mediante JSON Web Tokens.

El endpoint:

```text
POST /api/login
```

valida las credenciales y genera un token firmado que identifica al usuario.

El token contiene:

```text
id
email
rol
```

y tiene una duración configurada de:

```text
8 horas
```

El secreto utilizado para firmar los tokens se almacena mediante:

```text
JWT_SECRET
```

dentro del archivo:

```text
.env
```

El archivo `.env` permanece excluido del repositorio para evitar publicar información sensible.

---

## Protección de endpoints

Los endpoints protegidos requieren el encabezado:

```text
Authorization: Bearer <token>
```

Antes de procesar cada petición, el backend valida que el token sea válido.

Los endpoints que permanecen públicos son:

```text
GET /api/health
POST /api/login
```

El resto de las operaciones bajo `/api` requieren autenticación.

---

## Integración con frontend

Se modificó:

```text
client/src/services/api.js
```

para recuperar automáticamente el token almacenado después del inicio de sesión.

Las peticiones autenticadas incluyen:

```text
Authorization: Bearer <token>
```

Esto permite que la interfaz continúe funcionando normalmente mientras el backend valida la identidad del usuario en cada operación.

---

# Autorización por rol

Además de verificar la autenticación, el servidor utiliza el rol y el identificador contenidos dentro del JWT para determinar qué acciones puede realizar cada usuario.

El backend deja de confiar en valores enviados por el cliente como:

```text
usuario_id
solicitante_id
```

para establecer la identidad real del usuario.

---

## Solicitante

### Puede

- Crear solicitudes.
- Consultar sus propias solicitudes.
- Consultar el historial de solicitudes propias.

### No puede

- Cambiar prioridades.
- Asignar técnicos.
- Modificar estados administrativos.
- Modificar solicitudes directamente mediante la API.
- Ejecutar acciones correspondientes a Administradores o Técnicos.

---

## Técnico

### Puede

- Consultar solicitudes que tiene asignadas.
- Consultar el historial de solicitudes asignadas.
- Cambiar una solicitud asignada de Pendiente a En Proceso.
- Cambiar una solicitud asignada de En Proceso a Finalizada.
- Registrar comentarios en solicitudes asignadas y activas.

### No puede

- Modificar solicitudes que no tiene asignadas.
- Consultar historiales de solicitudes ajenas.
- Cambiar prioridades.
- Asignar técnicos.
- Ejecutar cierres administrativos.

---

## Administrador

Puede:

- Consultar todas las solicitudes.
- Consultar la lista de técnicos.
- Modificar prioridades.
- Asignar o reasignar técnicos.
- Ejecutar las transiciones administrativas permitidas.
- Cerrar solicitudes.
- Reabrir solicitudes.
- Ejecutar cierres administrativos justificados.
- Consultar los historiales del sistema.

---

# Regresión de DEF-12

Después de implementar autenticación y autorización se repitieron los escenarios principales relacionados con el defecto.

| ID | Prueba | Resultado esperado | Resultado |
|---|---|---|---|
| AUTH-01 | Consultar solicitudes sin token | Rechazado con 401 | PASS |
| AUTH-02 | Solicitante intenta modificar prioridad | Rechazado con 403 | PASS |
| AUTH-03 | Técnico intenta modificar una solicitud no asignada | Rechazado con 403 | PASS |
| AUTH-04 | Técnico intenta consultar historial de una solicitud no asignada | Rechazado con 403 | PASS |
| AUTH-05 | Técnico consulta historial de una solicitud asignada | Permitido | PASS |
| AUTH-06 | Técnico agrega comentario a una solicitud asignada | Permitido | PASS |
| AUTH-07 | Solicitante crea una nueva solicitud autenticado | Permitido | PASS |
| AUTH-08 | Solicitante intenta utilizar otro `solicitante_id` como filtro | Backend conserva la identidad determinada por el JWT | PASS |

---

## AUTH-01 — Acceso sin autenticación

Se intentó consultar:

```text
GET /api/solicitudes
```

sin enviar token.

Respuesta:

```text
Autenticación requerida
```

Resultado:

**PASS**

---

## AUTH-02 — Modificación no autorizada por Solicitante

El Solicitante autenticado intentó cambiar directamente la prioridad de una solicitud.

Respuesta:

```text
El solicitante no puede modificar solicitudes
```

El servidor devolvió un error de autorización y no permitió la operación.

Resultado:

**PASS**

---

## AUTH-03 — Técnico intenta modificar solicitud no asignada

El Técnico autenticado intentó modificar una solicitud que no estaba asignada a su usuario.

Respuesta:

```text
No tiene permiso para modificar esta solicitud
```

Resultado:

**PASS**

---

## AUTH-04 — Técnico intenta consultar historial ajeno

El Técnico intentó consultar el historial de una solicitud que no estaba asignada a su usuario.

Respuesta:

```text
No tiene permiso para consultar esta solicitud
```

Resultado:

**PASS**

---

## AUTH-05 — Consulta autorizada de historial

Posteriormente se utilizó una solicitud que sí estaba asignada al Técnico.

El sistema devolvió correctamente el historial de la solicitud.

Resultado:

**PASS**

Esto confirmó que la corrección no bloqueó las operaciones legítimas del Técnico.

---

## AUTH-06 — Comentario autorizado

Desde la interfaz web, el Técnico registró el comentario:

```text
Prueba de autorización JWT
```

El comentario apareció correctamente en el historial identificado como:

```text
Tecnico NovaTech
```

Resultado:

**PASS**

---

## AUTH-07 — Creación de solicitud autenticada

El Solicitante inició sesión y creó la solicitud:

```text
Descripción: Prueba autorización solicitante
Ubicación: Aula 100
Categoría: Tecnología
```

La solicitud fue registrada correctamente como:

```text
ID: #9
Prioridad: Media
Estado: Pendiente
Solicitante: Solicitante NovaTech
Técnico: Sin asignar
```

Resultado:

**PASS**

---

## AUTH-08 — Identidad obtenida desde JWT

Se realizó una petición autenticada como el Solicitante con identificador:

```text
solicitante_id = 3
```

pero se envió intencionalmente el filtro:

```text
?solicitante_id=1
```

El backend ignoró el identificador enviado por el cliente y devolvió solicitudes asociadas a:

```text
solicitante_id = 3
```

Esto confirmó que el servidor utiliza la identidad contenida en el JWT en lugar de confiar en el identificador suministrado desde el frontend.

Resultado:

**PASS**

> Nota: debido a que los datos actuales de prueba pertenecen principalmente al mismo Solicitante, esta comprobación valida que el parámetro enviado por el cliente sea ignorado, aunque no representa una prueba completa de aislamiento entre dos cuentas Solicitante distintas.

---

# Estado final de DEF-12

## Resultado inicial

**FAIL**

La API podía utilizarse sin autenticación y posteriormente se comprobó que un usuario autenticado podía intentar ejecutar operaciones correspondientes a otro rol.

## Resultado posterior

**PASS**

El backend ahora aplica:

```text
Autenticación
+
Autorización por rol
+
Control de acceso por solicitud
+
Identidad obtenida desde JWT
```

antes de ejecutar operaciones protegidas.

## Estado

**CERRADO**

---

# Regresión técnica posterior a las correcciones

Después de las correcciones más recientes, incluida la implementación de autenticación y autorización, se ejecutó nuevamente la regresión técnica del frontend.

---

## Análisis estático

Herramienta:

```text
Oxlint
```

Resultado:

```text
Found 0 warnings and 0 errors.
Finished in 16ms on 29 files with 92 rules using 16 threads.
```

Resultado:

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

Resultado:

**PASS**

---

## Build de producción

Herramienta:

```text
Vite
```

Resultado:

```text
vite v8.2.1 building client environment for production...
45 modules transformed.
✓ built
```

Resultado:

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

Resultado:

**PASS**

---

# Resultado de la regresión final

```text
Oxlint       0 warnings / 0 errors
Vitest       14/14 pruebas
Vite build   PASS
Playwright   2/2 pruebas
```

Las correcciones de autenticación y autorización no introdujeron regresiones detectables en las funcionalidades cubiertas por las pruebas automatizadas existentes.

---

# Resumen de defectos

| Métrica | Resultado |
|---|---:|
| Total de defectos registrados | 12 |
| Defectos cerrados | 12 |
| Defectos abiertos | 0 |
| Severidad alta | 3 |
| Severidad media | 4 |
| Severidad baja | 5 |
| Críticos o bloqueantes pendientes | 0 |

## Distribución por severidad

```text
Alta     3
Media    4
Baja     5
──────────
Total   12
```

## Estado general

**Todos los defectos registrados se encuentran corregidos y cerrados.**

La última regresión técnica finalizó satisfactoriamente con:

- **0 errores y 0 warnings en Oxlint.**
- **14 de 14 pruebas unitarias aprobadas.**
- **Build de producción exitoso.**
- **2 de 2 pruebas End-to-End aprobadas.**
- **Pruebas manuales de autenticación y autorización aprobadas.**