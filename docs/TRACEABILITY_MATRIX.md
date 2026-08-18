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
| HU-02 | Administrador gestiona usuarios | Media | Existen usuarios y roles en base de datos, pero todavía no existe una interfaz administrativa para crear, editar o desactivar cuentas. | Funcionalidad pendiente de implementación. | **Pendiente** |
| HU-03 | Solicitante registra solicitud | Alta | Formulario con descripción, ubicación y categoría; fecha generada automáticamente. | `TEST_CASES.md`, `BLACK_BOX_TESTING.md`, AUTH-07 | **Cumple** |
| HU-04 | Solicitante adjunta evidencia | Media | El formulario actual no permite cargar imágenes o archivos relacionados con la solicitud. | Funcionalidad pendiente de implementación. | **Pendiente** |
| HU-05 | Administrador asigna prioridad | Alta | Prioridades Baja, Media, Alta y Crítica disponibles en el Panel de Administración. | Casos funcionales, pruebas exploratorias, DEF-10 y DEF-13 | **Cumple** |
| HU-06 | Administrador asigna técnico | Alta | El Administrador puede seleccionar un Técnico para una solicitud y el backend valida la asignación. | Casos funcionales, pruebas exploratorias y pruebas de autorización | **Cumple** |
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
| Cumple | 10 |
| Parcial | 0 |
| Pendiente | 2 |
| Total | 12 |

Cobertura completamente implementada:

```text
10 / 12 = 83.3 %
```

Las dos historias restantes corresponden a funcionalidades adicionales que no afectan el flujo principal de gestión de solicitudes.

---

# Historias completamente implementadas

```text
HU-01
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

# Historias pendientes

## HU-02 — Gestión de usuarios

La base de datos contiene usuarios con roles:

```text
Administrador
Técnico
Solicitante
```

pero todavía no existe un módulo dentro de NovaTech que permita al Administrador:

- Crear usuarios.
- Editar usuarios.
- Desactivar usuarios.
- Cambiar roles mediante la interfaz.

Estado:

**PENDIENTE**

---

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
- Evaluación heurística de usabilidad.
- Pruebas básicas reproducibles de rendimiento.
- CI/CD mediante GitHub Actions.

---

# Regresión posterior a HU-10 y HU-11

Después de implementar ambas historias se ejecutó nuevamente la regresión técnica.

## Oxlint

```text
Found 0 warnings and 0 errors.
29 files
92 rules
```

**PASS**

## Vitest

```text
Test Files  2 passed (2)
Tests       14 passed (14)
```

**PASS**

## Build de producción

```text
45 modules transformed.
✓ built
```

**PASS**

## Playwright

```text
2 passed
```

**PASS**

---

# Estado actual del Backlog

```text
Cumple      10
Parcial      0
Pendiente    2
──────────────
Total       12
```

Cobertura actual:

```text
83.3 %
```

---

# Prioridad recomendada para continuar

Las historias restantes son:

```text
HU-02 — Gestión de usuarios
HU-04 — Evidencia adjunta
```

El orden recomendado es:

```text
1. HU-02 — Gestión de usuarios
2. HU-04 — Evidencia adjunta
```

## HU-02

Es una funcionalidad administrativa relativamente delimitada y utiliza la tabla de usuarios que ya existe.

## HU-04

Requiere manejo de archivos, almacenamiento, tipos permitidos, tamaño, seguridad y visualización de evidencias, por lo que representa un cambio técnico de mayor riesgo.

---

# Conclusión

La trazabilidad demuestra que el núcleo funcional del sistema y todas las historias de prioridad Alta se encuentran completamente implementadas.

Actualmente NovaTech cumple:

```text
10 de 12 historias de usuario
```

Las dos historias restantes corresponden a funcionalidades adicionales del Backlog.

La matriz deberá actualizarse nuevamente si HU-02 o HU-04 se implementan antes de la entrega final.