# NovaTech — Matriz de Trazabilidad

## Objetivo

Relacionar las historias de usuario definidas en el Backlog inicial de NovaTech con su implementación actual, las pruebas ejecutadas y la evidencia disponible.

La matriz permite identificar qué requisitos se encuentran completamente implementados y cuáles permanecen fuera del alcance actual del MVP.

---

# Estados utilizados

| Estado | Significado |
|---|---|
| Cumple | El criterio de aceptación está implementado y existe evidencia de validación. |
| Parcial | Existe parte de la funcionalidad, pero el criterio de aceptación original no se cumple completamente. |
| Pendiente | La funcionalidad no se encuentra implementada en el MVP actual. |

---

# Matriz de trazabilidad

| ID | Requisito resumido | Prioridad | Implementación actual | Evidencia / pruebas | Estado |
|---|---|---|---|---|---|
| HU-01 | Inicio de sesión seguro según rol | Alta | Login con credenciales, JWT y autorización por rol en backend. | Playwright, AUTH-01 a AUTH-08, `DEFECT_LOG.md` | **Cumple** |
| HU-02 | Administrador gestiona usuarios | Media | Módulo administrativo para listar, crear, editar, cambiar rol, activar y desactivar cuentas. Las cuentas inactivas no pueden iniciar sesión ni continuar utilizando un JWT emitido previamente. | Pruebas directas de API, validación funcional desde interfaz, control de sesiones y regresión automatizada | **Cumple** |
| HU-03 | Solicitante registra solicitud | Alta | Formulario con descripción, ubicación y categoría; fecha generada automáticamente. | `TEST_CASES.md`, `BLACK_BOX_TESTING.md`, AUTH-07 | **Cumple** |
| HU-04 | Solicitante adjunta evidencia | Media | El formulario actual no permite cargar imágenes o archivos relacionados con la solicitud. | Funcionalidad pendiente de implementación. | **Pendiente** |
| HU-05 | Administrador asigna prioridad | Alta | Prioridades Baja, Media, Alta y Crítica disponibles en el Panel de Administración. | Casos funcionales, pruebas exploratorias, DEF-10 y DEF-13 | **Cumple** |
| HU-06 | Administrador asigna técnico | Alta | El Administrador puede seleccionar un Técnico activo para una solicitud y el backend valida la asignación. | Casos funcionales, pruebas exploratorias y pruebas de autorización | **Cumple** |
| HU-07 | Solicitante consulta estado | Alta | El Solicitante visualiza cada solicitud y su estado actualizado: Pendiente, En Proceso, Finalizada o Cerrada. | Casos funcionales, historial y pruebas exploratorias | **Cumple** |
| HU-08 | Administrador consulta historial | Alta | Existe historial cronológico con cambios de estado, responsables, comentarios, observación final y fechas. | `EXPLORATORY_TESTING.md`, DEF-03, DEF-11, AUTH-04 y AUTH-05 | **Cumple** |
| HU-09 | Técnico registra comentarios | Media | El Técnico puede agregar observaciones en solicitudes asignadas y activas. | Caja negra, pruebas exploratorias y AUTH-06 | **Cumple** |
| HU-10 | Técnico o Administrador cierra solicitud y agrega observación final | Alta | El Técnico finaliza el trabajo y el Administrador debe ingresar una observación final antes del cierre normal. La observación queda registrada en el historial. | Validación UI, validación directa de API, historial y regresión automatizada | **Cumple** |
| HU-11 | Administrador consulta reportes por estado, prioridad o responsable | Media | El Panel de Administración incluye filtros combinables por estado, prioridad y responsable, contador de resultados y opción para limpiar filtros. | Validación funcional de filtros individuales, combinados, sin resultados y limpieza | **Cumple** |
| HU-12 | Equipo realiza y documenta pruebas | Alta | Existe documentación de smoke, funcionales, caja negra, exploratorias, análisis estático, unitarias, E2E, seguridad, usabilidad, rendimiento y regresión. CI/CD ejecuta verificaciones automáticamente. | Carpeta `docs/`, Vitest, Playwright, Oxlint, script de rendimiento y GitHub Actions | **Cumple** |

---

# Resumen de cobertura del Backlog

| Estado | Cantidad |
|---|---:|
| Cumple | 11 |
| Parcial | 0 |
| Pendiente | 1 |
| Total | 12 |

Cobertura completamente implementada:

```text
11 / 12 = 91.7 %
```

La única historia pendiente corresponde a la carga de evidencias adjuntas.

---

# Historias completamente implementadas

```text
HU-01
HU-02
HU-03
HU-05
HU-06
HU-07
HU-08
HU-09
HU-10
HU-11
HU-12
```

---

# HU-02 — Gestión de usuarios

## Requisito

El Administrador debe poder gestionar las cuentas utilizadas para acceder a NovaTech.

Las operaciones contempladas son:

```text
Crear usuarios
Editar usuarios
Cambiar roles
Desactivar usuarios
Reactivar usuarios
```

---

## Implementación en base de datos

Se incorporó el campo:

```text
activo
```

en la tabla:

```text
usuarios
```

con la siguiente interpretación:

```text
activo = 1 → Cuenta habilitada
activo = 0 → Cuenta desactivada
```

Los usuarios existentes conservaron el estado activo después de la migración.

---

## Implementación en backend

Se incorporaron los endpoints administrativos:

```text
GET  /api/usuarios
POST /api/usuarios
PUT  /api/usuarios/:id
```

Estos endpoints únicamente pueden ser utilizados por usuarios con rol:

```text
administrador
```

El backend permite:

- Consultar usuarios.
- Crear cuentas.
- Modificar nombre.
- Modificar correo electrónico.
- Modificar rol.
- Cambiar contraseña.
- Activar cuentas.
- Desactivar cuentas.

También se implementaron controles adicionales:

- Correo electrónico único.
- Validación de formato de correo.
- Contraseña mínima de 8 caracteres.
- Validación de roles permitidos.
- Prevención de autodesactivación del Administrador.
- Prevención de cambio del propio rol administrativo.
- Exclusión de técnicos inactivos de las nuevas asignaciones.

---

## Seguridad de cuentas desactivadas

El sistema verifica el estado actual de la cuenta durante cada solicitud autenticada.

Esto significa que una cuenta desactivada:

```text
No puede iniciar una nueva sesión
```

y tampoco puede continuar utilizando:

```text
Un JWT obtenido antes de ser desactivada
```

La autorización utiliza además el rol actual almacenado en la base de datos.

Por lo tanto, los cambios de rol tienen efecto inmediato incluso cuando el usuario posee un token emitido anteriormente.

---

## Implementación en interfaz

Se incorporó al Panel de Administración la sección:

```text
Gestión de usuarios
```

La sección permite:

```text
Crear usuario
Editar usuario
Seleccionar rol
Cambiar contraseña
Desactivar usuario
Activar usuario
```

Cada cuenta muestra:

- Nombre.
- Correo electrónico.
- Rol.
- Estado Activo o Inactivo.

Las cuentas inactivas permanecen visibles y no se eliminan de la base de datos.

---

## Protección de la cuenta administrativa actual

La interfaz identifica la cuenta utilizada por el Administrador mediante:

```text
TU CUENTA
```

En esa cuenta:

- No se muestra la opción de desactivación.
- El selector de rol queda deshabilitado durante la edición.

Estas restricciones también son verificadas independientemente en el backend.

---

## Validaciones directas de API

### Listar usuarios

Se autenticó al Administrador y se ejecutó:

```text
GET /api/usuarios
```

El servidor devolvió las cuentas existentes con:

```text
id
nombre
email
rol
activo
```

Las contraseñas no son incluidas en la respuesta.

Resultado:

**PASS**

---

### Crear usuario

Se creó mediante API:

```text
Usuario QA
qa.usuario@novatech.com
Rol: solicitante
```

El servidor respondió:

```text
Usuario creado correctamente
```

Resultado:

**PASS**

---

### Login de usuario recién creado

La cuenta creada logró autenticarse correctamente y recibió un JWT válido.

Resultado:

**PASS**

---

### Editar usuario

La cuenta fue modificada de:

```text
Usuario QA
Solicitante
```

a:

```text
Tecnico QA
Técnico
```

El cambio quedó reflejado inmediatamente en el listado administrativo.

Resultado:

**PASS**

---

### Desactivar cuenta

La cuenta fue modificada a:

```text
activo = 0
```

El usuario permaneció almacenado en la base de datos.

Resultado:

**PASS**

---

### Bloquear nuevo inicio de sesión

Se intentó iniciar sesión utilizando la cuenta desactivada.

El backend respondió:

```text
La cuenta está desactivada
```

Resultado:

**PASS**

---

### Invalidar sesión existente

Antes de la desactivación se había obtenido un JWT válido para el usuario.

Después de desactivar la cuenta se intentó utilizar ese mismo token para consultar:

```text
GET /api/solicitudes
```

El backend respondió:

```text
La cuenta está desactivada
```

Resultado:

**PASS**

Esto confirma que la desactivación tiene efecto inmediato sobre sesiones existentes.

---

# Validación de HU-02 desde la interfaz

Se realizaron pruebas funcionales utilizando el Panel de Administración.

## Crear usuario

Se creó:

```text
Usuario UI QA
ui.qa@novatech.com
Rol: Solicitante
```

La interfaz:

- Mostró mensaje de creación exitosa.
- Incrementó el contador de usuarios.
- Incorporó la nueva cuenta a la lista.
- Mostró la cuenta como Activa.

Resultado:

**PASS**

---

## Editar usuario y cambiar rol

La cuenta fue modificada a:

```text
Técnico UI QA
Rol: Técnico
```

La contraseña se dejó vacía durante la edición para verificar que conservara su valor anterior.

La interfaz mostró:

```text
Usuario actualizado correctamente.
```

Resultado:

**PASS**

---

## Integración con asignación de técnicos

Después de cambiar el rol del usuario a Técnico, la cuenta apareció automáticamente en:

```text
Reportes y filtros
→ Responsable
```

y quedó disponible como Técnico activo.

Resultado:

**PASS**

---

## Desactivar desde interfaz

Se seleccionó:

```text
Desactivar
```

La interfaz solicitó confirmación antes de ejecutar la operación.

Después de confirmar:

- La cuenta cambió a Inactiva.
- El botón cambió a Activar.
- Se mostró mensaje de éxito.
- El Técnico dejó de aparecer entre los responsables disponibles.

Resultado:

**PASS**

---

## Reactivar desde interfaz

Se seleccionó:

```text
Activar
```

La cuenta volvió al estado:

```text
ACTIVO
```

y volvió a aparecer en la lista de responsables.

Resultado:

**PASS**

---

## Estado HU-02

**CUMPLE**

---

# HU-10 — Cierre con observación final

## Requisito

El cierre de una solicitud debía permitir registrar una observación final.

## Implementación

El flujo final es:

```text
Técnico:
En Proceso
→ Finalizada

Administrador:
Finalizada
→ Observación final obligatoria
→ Cerrada
```

Cuando la solicitud se encuentra Finalizada, el Administrador visualiza:

```text
OBSERVACIÓN FINAL *
[ Describa el resultado final del mantenimiento... ]
```

El botón:

```text
Cerrar solicitud
```

permanece deshabilitado mientras la observación esté vacía.

---

## Validación positiva

Se ingresó:

```text
Mantenimiento verificado y funcionamiento correcto.
```

La solicitud cambió:

```text
Finalizada
→ Cerrada
```

y el historial registró:

```text
Solicitud cerrada. Observación final:
Mantenimiento verificado y funcionamiento correcto.
```

Resultado:

**PASS**

---

## Validación negativa desde API

Se intentó cerrar directamente una solicitud Finalizada sin enviar:

```text
observacion_final
```

El backend respondió:

```text
Debe indicar una observación final antes de cerrar la solicitud
```

La solicitud permaneció Finalizada.

Resultado:

**PASS**

Esto confirma que la regla no depende únicamente de la interfaz React.

---

## Estado HU-10

**CUMPLE**

---

# HU-11 — Reportes y filtros básicos

## Requisito

El Administrador debe poder consultar solicitudes filtradas por:

```text
Estado
Prioridad
Responsable
```

---

## Implementación

Se incorporó una sección:

```text
Reportes y filtros
```

con:

```text
Estado
Prioridad
Responsable
Limpiar filtros
```

Los filtros pueden utilizarse individualmente o combinarse.

También se muestra:

```text
Resultados
X / Total
```

---

## Validaciones ejecutadas

### Filtro combinado

Se utilizaron:

```text
Estado:      En proceso
Prioridad:   Alta
Responsable: Tecnico NovaTech
```

Resultado:

```text
1 / 9
```

La única solicitud mostrada cumplía simultáneamente los tres criterios.

**PASS**

---

### Filtro por estado

Se seleccionó:

```text
Estado: Cerrada
```

El resultado coincidió con el total mostrado en el resumen administrativo.

**PASS**

---

### Responsable sin asignar

Se seleccionó:

```text
Responsable: Sin asignar
```

Solo se mostraron solicitudes sin técnico asignado.

**PASS**

---

### Combinación sin resultados

Se seleccionó una combinación sin coincidencias.

La interfaz mostró:

```text
No hay solicitudes que coincidan con los filtros seleccionados.
```

**PASS**

---

### Limpiar filtros

Se presionó:

```text
Limpiar filtros
```

La aplicación volvió a mostrar todas las solicitudes:

```text
9 / 9
```

**PASS**

---

## Estado HU-11

**CUMPLE**

---

# Historia pendiente

## HU-04 — Evidencia adjunta

El formulario de solicitud permite registrar:

- Descripción.
- Ubicación.
- Categoría.

Pero todavía no permite cargar:

- Imágenes.
- Fotografías.
- Documentos.
- Otros archivos relacionados.

Estado:

**PENDIENTE**

---

# Requisitos adicionales cubiertos durante QA

Durante el desarrollo y las pruebas se incorporaron controles adicionales que fortalecen la solución:

- Autenticación mediante JWT.
- Autorización efectiva en backend por rol.
- Control de acceso por propiedad o asignación.
- Validaciones de longitud en frontend y backend.
- Reglas válidas de transición entre estados.
- Cierre administrativo justificado.
- Validación de solicitudes duplicadas.
- Reapertura de solicitudes.
- Prevención de finalización accidental.
- Observación final obligatoria para cierre normal.
- Reportes y filtros administrativos.
- Gestión de usuarios.
- Activación y desactivación de cuentas.
- Invalidación efectiva de sesiones de cuentas desactivadas.
- Actualización inmediata de roles.
- Prevención de autodesactivación administrativa.
- Evaluación heurística de usabilidad.
- Pruebas básicas reproducibles de rendimiento.
- CI/CD mediante GitHub Actions.

---

# Regresión posterior a HU-02

Después de implementar HU-02 se ejecutó nuevamente la regresión técnica completa.

## Verificación de sintaxis del backend

```text
node --check index.js
```

No se reportaron errores.

**PASS**

---

## Oxlint

Ejecutado utilizando la dependencia local del proyecto:

```text
Found 0 warnings and 0 errors.
26 files
92 rules
```

**PASS**

---

## Vitest

```text
Test Files  2 passed (2)
Tests       14 passed (14)
```

**PASS**

---

## Build de producción

```text
vite v8.2.1
46 modules transformed.
✓ built
```

**PASS**

---

## Playwright

```text
Running 2 tests using 2 workers
2 passed
```

**PASS**

---

# Estado actual del Backlog

```text
Cumple      11
Parcial      0
Pendiente    1
──────────────
Total       12
```

Cobertura actual:

```text
91.7 %
```

---

# Funcionalidad pendiente

La única historia restante es:

```text
HU-04 — Evidencia adjunta
```

HU-04 requiere manejo de archivos, almacenamiento, validación de tipos permitidos, tamaño, seguridad de carga y visualización de evidencias.

Debido a que representa un cambio técnico de mayor alcance que las historias anteriores, debe implementarse únicamente si existe tiempo suficiente para desarrollar y ejecutar una regresión completa sin comprometer la estabilidad actual del sistema.

---

# Conclusión

La trazabilidad demuestra que el núcleo funcional del sistema y todas las historias de prioridad Alta se encuentran completamente implementadas.

Actualmente NovaTech cumple:

```text
11 de 12 historias de usuario
```

equivalente a:

```text
91.7 %
```

La única historia pendiente corresponde a la carga de evidencia adjunta.

El sistema mantiene resultados satisfactorios en análisis estático, pruebas unitarias, pruebas E2E, build de producción y validaciones funcionales después de la implementación de HU-02.