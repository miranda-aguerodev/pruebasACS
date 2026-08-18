# NovaTech — Pruebas de Caja Negra

## Objetivo

Validar el comportamiento externo de NovaTech sin considerar la implementación interna del código, utilizando técnicas de diseño de pruebas de caja negra.

Para el producto se seleccionaron dos técnicas relevantes:

- Clases de equivalencia.
- Análisis de valores límite.

Estas técnicas se aplicaron principalmente sobre autenticación, registro de solicitudes de mantenimiento y registro de comentarios técnicos.

---

# 1. Clases de equivalencia

Las clases de equivalencia permiten dividir los datos de entrada en grupos que deberían producir un comportamiento similar.

En lugar de probar todas las combinaciones posibles, se selecciona al menos un representante de cada clase relevante.

---

## CE-01 — Credenciales válidas

**Funcionalidad:** Inicio de sesión

**Clase:** Válida

### Datos de prueba

- Correo: `usuario@novatech.com`
- Contraseña: `Usuario123!`

### Resultado esperado

- El sistema autentica al usuario.
- Se redirige al panel del solicitante.
- El usuario puede acceder a las funcionalidades correspondientes a su rol.

### Resultado obtenido

**PASS**

El inicio de sesión fue exitoso y el usuario fue dirigido correctamente al panel del solicitante.

---

## CE-02 — Contraseña incorrecta

**Funcionalidad:** Inicio de sesión

**Clase:** Inválida

### Datos de prueba

- Correo: `usuario@novatech.com`
- Contraseña: `Incorrecta123!`

### Resultado esperado

- El acceso debe ser rechazado.
- El usuario debe permanecer en la pantalla de login.
- Debe mostrarse un mensaje de error.

### Resultado obtenido

**PASS**

El sistema mostró:

```text
Correo o contraseña incorrectos
```

y no permitió el acceso al sistema.

---

## CE-03 — Solicitud con todos los datos válidos

**Funcionalidad:** Registro de solicitud

**Clase:** Válida

### Datos de prueba

- Descripción: `Proyector del aula no enciende`
- Ubicación: `Aula 305`
- Categoría: `Tecnología`

### Resultado esperado

- La solicitud debe registrarse.
- Debe asignarse un identificador.
- El estado inicial debe ser Pendiente.
- La prioridad inicial debe ser Media.
- Debe generarse el evento `Solicitud creada`.

### Resultado obtenido

**PASS**

La solicitud fue registrada correctamente y apareció en el sistema como solicitud #3.

También se verificó la creación automática del primer evento dentro del historial de la solicitud.

---

## CE-04 — Solicitud con campo obligatorio vacío

**Funcionalidad:** Registro de solicitud

**Clase:** Inválida

### Variante A

- Descripción válida.
- Ubicación vacía.
- Categoría válida.

### Variante B

- Descripción válida.
- Ubicación válida.
- Categoría sin seleccionar.

### Resultado esperado

La aplicación no debe permitir registrar una solicitud cuando falta información obligatoria.

### Resultado obtenido

**PASS**

El navegador bloqueó el envío del formulario y solicitó completar los campos obligatorios.

La solicitud no fue registrada.

---

## CE-05 — Comentario técnico válido

**Funcionalidad:** Seguimiento de solicitud

**Clase:** Válida

### Datos de prueba

```text
Se revisó el proyector y se detectó un cable HDMI defectuoso.
```

### Resultado esperado

- El comentario debe almacenarse.
- Debe aparecer en el historial.
- Debe mostrar usuario, rol, fecha y hora.

### Resultado obtenido

**PASS**

El comentario fue registrado correctamente y posteriormente recuperado desde el historial de la solicitud.

El historial mostró:

- Usuario responsable.
- Rol.
- Fecha y hora.
- Contenido del comentario.

---

## CE-06 — Comentario vacío

**Funcionalidad:** Seguimiento de solicitud

**Clase:** Inválida

### Entrada

Campo de comentario vacío.

### Resultado esperado

- No debe registrarse ningún comentario.
- La acción debe estar deshabilitada para el usuario.

### Resultado obtenido

**PASS**

El sistema impidió registrar comentarios vacíos.

Durante la ejecución inicial se detectó que el estado deshabilitado del botón `Comentar` no era visualmente suficientemente evidente.

Este comportamiento fue registrado como `DEF-06`.

Posteriormente se mejoró la representación visual del botón deshabilitado y se agregó información contextual mediante tooltip.

**DEF-06: Cerrado.**

---

# 2. Análisis de valores límite

La base de datos de NovaTech define límites para varios campos de texto importantes.

| Campo | Longitud máxima |
|---|---:|
| Descripción de solicitud | 255 caracteres |
| Ubicación | 120 caracteres |
| Categoría | 100 caracteres |

Para las pruebas de valores límite se seleccionaron los campos **Descripción** y **Ubicación**, debido a que son introducidos directamente por el usuario durante el registro de una solicitud.

Se utilizaron valores dentro del límite, exactamente en el límite y superiores al límite establecido.

---

## VL-01 — Descripción mínima válida

**Campo:** Descripción

**Valor probado:** 1 carácter (`A`)

### Resultado esperado

El sistema debe aceptar la entrada siempre que los demás campos obligatorios sean válidos.

### Resultado obtenido

**PASS**

La solicitud fue registrada correctamente utilizando una descripción de un solo carácter.

No se presentaron errores y la solicitud apareció correctamente en la lista con:

- Estado: Pendiente.
- Prioridad: Media.

---

## VL-02 — Descripción en límite máximo

**Campo:** Descripción

**Valor probado:** 255 caracteres

### Resultado esperado

El sistema debe aceptar y almacenar correctamente una descripción de 255 caracteres.

### Resultado obtenido

**PASS con observación**

La solicitud fue registrada correctamente utilizando una descripción de exactamente 255 caracteres.

No se presentaron errores en el backend y la información fue almacenada correctamente.

### Observación

Aunque el límite funcional fue aceptado, se detectó que una descripción extensa desbordaba visualmente la celda correspondiente de la tabla y afectaba la visualización de otras columnas.

Este comportamiento fue registrado como:

`DEF-09`

Posteriormente se corrigió la visualización de textos extensos en la tabla y se realizó una prueba de regresión visual.

**DEF-09: Cerrado.**

---

## VL-03 — Descripción sobre el límite máximo

**Campo:** Descripción

**Valor probado inicialmente:** 256 caracteres

### Resultado esperado

El sistema debe rechazar una descripción superior al límite permitido y evitar que la solicitud sea almacenada.

### Resultado obtenido inicial

**PASS con observación**

Durante la primera ejecución, la aplicación permitió introducir y enviar una descripción de 256 caracteres.

La base de datos rechazó posteriormente la operación al superar el límite de 255 caracteres.

El backend registró:

```text
ER_DATA_TOO_LONG
Data too long for column 'descripcion'
```

La interfaz mostró:

```text
Error al registrar la solicitud
```

La solicitud no fue almacenada ni agregada a la lista.

### Observación

Aunque la integridad de los datos estaba protegida porque MySQL rechazaba el valor inválido, la validación ocurría demasiado tarde.

La interfaz tampoco indicaba de forma específica que la descripción tenía un máximo permitido de 255 caracteres.

Este comportamiento fue asociado con:

`DEF-08`

Posteriormente se agregaron validaciones específicas tanto en frontend como en backend.

**DEF-08: Cerrado.**

---

## VL-04 — Ubicación en límite máximo

**Campo:** Ubicación

**Valor probado:** 120 caracteres

### Resultado esperado

El sistema debe aceptar y almacenar correctamente una ubicación de 120 caracteres.

### Resultado obtenido

**PASS con observación**

La solicitud fue registrada correctamente utilizando una ubicación de exactamente 120 caracteres.

No se presentaron errores durante el registro y la información fue almacenada correctamente.

### Observación

Aunque el valor límite fue aceptado correctamente, una ubicación extensa también desbordaba visualmente su columna dentro de la tabla y afectaba la legibilidad.

Este resultado amplió el alcance de:

`DEF-09`

El defecto no se limitaba únicamente a Descripción, sino también a Ubicación.

Después de aplicar la corrección visual, ambos campos permanecen contenidos dentro de sus respectivas columnas.

**DEF-09: Cerrado.**

---

## VL-05 — Ubicación sobre el límite máximo

**Campo:** Ubicación

**Valor probado inicialmente:** 121 caracteres

### Resultado esperado

El sistema debe impedir el registro de una ubicación superior al límite permitido y evitar que la solicitud sea almacenada.

### Resultado obtenido inicial

**PASS con observación**

Durante la primera ejecución, la aplicación permitió introducir y enviar una ubicación de 121 caracteres.

La base de datos rechazó la operación porque el campo `ubicacion` admite un máximo de 120 caracteres.

El backend registró:

```text
ER_DATA_TOO_LONG
Data too long for column 'ubicacion'
```

El frontend mostró:

```text
Error al registrar la solicitud
```

La solicitud no fue almacenada ni agregada a la lista.

### Observación

Al igual que en VL-03, la integridad de los datos estaba protegida, pero la validación ocurría únicamente al llegar a MySQL.

Este comportamiento se relacionó con:

`DEF-08`

Posteriormente se agregó validación preventiva en frontend y backend.

**DEF-08: Cerrado.**

---

# 3. Defectos identificados mediante valores límite

Las pruebas de valores límite permitieron identificar dos defectos relevantes.

---

## DEF-08 — Validación tardía de longitudes

### Descripción

Los campos Descripción y Ubicación no validaban sus longitudes máximas antes del envío.

Al superar:

- 255 caracteres en Descripción.
- 120 caracteres en Ubicación.

la petición llegaba hasta la base de datos y MySQL rechazaba la operación mediante `ER_DATA_TOO_LONG`.

### Severidad

Baja.

### Corrección aplicada

En el frontend se agregó:

- `maxLength={255}` para Descripción.
- `maxLength={120}` para Ubicación.
- Contadores visuales de caracteres.

Además, en el backend se agregaron validaciones explícitas antes de ejecutar el `INSERT`.

Cuando la descripción supera el límite, la API responde:

```text
La descripción no puede superar los 255 caracteres
```

Cuando la ubicación supera el límite, la API responde:

```text
La ubicación no puede superar los 120 caracteres
```

### Estado

**Cerrado**

---

## DEF-09 — Desbordamiento visual de textos extensos

### Descripción

Los valores válidos pero extensos de los campos Descripción y Ubicación desbordaban visualmente sus respectivas celdas dentro de la tabla.

Esto afectaba la legibilidad e interfería visualmente con columnas como:

- Categoría.
- Prioridad.
- Estado.
- Solicitante.
- Técnico.
- Acciones.

### Severidad

Baja.

### Corrección aplicada

Se modificó la visualización de las columnas Descripción y Ubicación para:

- Limitar el contenido visible a un máximo de dos líneas.
- Evitar que textos extensos invadan otras columnas.
- Permitir el ajuste de palabras largas dentro de la celda.
- Mantener disponible el contenido completo mediante tooltip.

### Estado

**Cerrado**

### Prueba de regresión

Se volvieron a visualizar las solicitudes creadas con:

- Descripción de 255 caracteres.
- Ubicación de 120 caracteres.

Ambos valores permanecieron contenidos dentro de sus respectivas columnas y no afectaron la visualización de Categoría, Prioridad, Estado, Solicitante, Técnico ni Acciones.

### Resultado de regresión

**PASS**

---

# 4. Prueba de regresión de DEF-08

Después de corregir la validación de longitudes se repitieron los escenarios que anteriormente dependían del rechazo de MySQL.

---

## Regresión — Descripción de 256 caracteres

### Frontend

Se intentó ingresar una descripción superior al máximo permitido.

El campo se detuvo automáticamente en:

```text
255/255
```

El frontend no permitió introducir el carácter número 256.

### Backend

También se realizó una petición directa a:

```text
POST /api/solicitudes
```

utilizando una descripción de 256 caracteres para comprobar que la protección no dependiera únicamente del frontend.

La API respondió:

```text
La descripción no puede superar los 255 caracteres
```

La solicitud no fue almacenada.

### Resultado

**PASS**

---

## Regresión — Ubicación de 121 caracteres

### Frontend

Se intentó ingresar una ubicación superior al máximo permitido.

El campo se detuvo automáticamente en:

```text
120/120
```

El frontend no permitió introducir el carácter número 121.

### Backend

Se realizó una petición directa a:

```text
POST /api/solicitudes
```

utilizando una ubicación de 121 caracteres.

La API respondió:

```text
La ubicación no puede superar los 120 caracteres
```

La solicitud no fue almacenada.

### Resultado

**PASS**

---

## Resultado de regresión de DEF-08

**APROBADO**

La corrección fue verificada en dos niveles:

1. Interfaz de usuario.
2. API del backend.

Esto garantiza que la validación no dependa exclusivamente de los controles implementados en el navegador.

**DEF-08: Cerrado.**

---

# 5. Prueba de regresión de DEF-09

Después de corregir el manejo visual de textos extensos se revisaron nuevamente las solicitudes creadas durante las pruebas de valores límite.

---

## Regresión — Descripción de 255 caracteres

### Condición probada

Solicitud con una descripción de exactamente 255 caracteres.

### Resultado esperado

La descripción debe permanecer contenida dentro de su columna sin afectar la visualización de otras columnas.

### Resultado obtenido

**PASS**

La descripción se mostró en un máximo de dos líneas y dejó de superponerse con las columnas siguientes.

---

## Regresión — Ubicación de 120 caracteres

### Condición probada

Solicitud con una ubicación de exactamente 120 caracteres.

### Resultado esperado

La ubicación debe permanecer contenida dentro de su columna sin afectar la estructura de la tabla.

### Resultado obtenido

**PASS**

La ubicación quedó contenida dentro de su celda y dejó de interferir con Categoría, Prioridad, Estado, Solicitante, Técnico y Acciones.

---

## Resultado de regresión de DEF-09

**APROBADO**

La corrección eliminó el desbordamiento visual manteniendo disponible el contenido completo mediante tooltip.

**DEF-09: Cerrado.**

---

# 6. Resumen de ejecución

## Clases de equivalencia

| Caso | Resultado |
|---|---|
| CE-01 — Credenciales válidas | PASS |
| CE-02 — Contraseña incorrecta | PASS |
| CE-03 — Solicitud válida | PASS |
| CE-04 — Campo obligatorio vacío | PASS |
| CE-05 — Comentario válido | PASS |
| CE-06 — Comentario vacío | PASS |

**Resultado: 6 de 6 clases de equivalencia ejecutadas y aprobadas.**

---

## Valores límite

| Caso | Resultado |
|---|---|
| VL-01 — Descripción mínima válida, 1 carácter | PASS |
| VL-02 — Descripción en límite máximo, 255 caracteres | PASS con observación |
| VL-03 — Descripción sobre límite, 256 caracteres | PASS con observación |
| VL-04 — Ubicación en límite máximo, 120 caracteres | PASS con observación |
| VL-05 — Ubicación sobre límite, 121 caracteres | PASS con observación |

**Resultado: 5 de 5 casos de valores límite ejecutados.**

Los casos con observación permitieron identificar defectos que posteriormente fueron analizados, corregidos y sometidos a pruebas de regresión.

---

# 7. Defectos derivados de las pruebas

| Defecto | Descripción resumida | Estado |
|---|---|---|
| DEF-06 | Estado deshabilitado del botón Comentar poco evidente | Cerrado |
| DEF-08 | Validación tardía de longitudes máximas | Cerrado |
| DEF-09 | Desbordamiento visual de textos extensos en la tabla | Cerrado |

---

# 8. Criterios de evaluación

Las pruebas de caja negra se consideran satisfactorias cuando:

- Los valores pertenecientes a clases válidas son aceptados.
- Los valores pertenecientes a clases inválidas son rechazados.
- Los valores dentro de los límites permitidos son aceptados.
- Los valores fuera de los límites son rechazados de manera controlada.
- No se almacenan datos que incumplan las restricciones definidas.
- La aplicación proporciona retroalimentación adecuada al usuario.
- Las correcciones realizadas son verificadas posteriormente mediante regresión.

---

# 9. Resultado general

### Clases de equivalencia

**6 de 6 ejecutadas y aprobadas.**

### Valores límite

**5 de 5 ejecutados.**

### Regresión de DEF-08

**APROBADA.**

### Regresión de DEF-09

**APROBADA.**

### Defectos identificados

- DEF-06 — Cerrado.
- DEF-08 — Cerrado.
- DEF-09 — Cerrado.

### Estado general

**PRUEBAS DE CAJA NEGRA COMPLETADAS**

Las técnicas de clases de equivalencia y análisis de valores límite permitieron comprobar el comportamiento funcional de NovaTech frente a entradas válidas e inválidas y, adicionalmente, permitieron detectar defectos reales relacionados con validación y presentación de datos.

Los defectos identificados durante estas pruebas fueron posteriormente corregidos y sometidos a pruebas de regresión.

El proceso seguido fue:

**Diseño de casos → Ejecución → Identificación de hallazgos → Registro de defectos → Corrección → Regresión**