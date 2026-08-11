# NovaTech — Casos de Prueba Funcionales

## Objetivo

Validar las principales funcionalidades del Sistema de Gestión de Solicitudes de Mantenimiento NovaTech mediante casos de prueba reproducibles y trazables.

---

## TC-01 — Inicio de sesión válido como solicitante

**Historia relacionada:** HU-01  
**Tipo de prueba:** Funcional / Sistema  
**Prioridad:** Alta

**Precondiciones**
- El usuario solicitante existe en la base de datos.
- Frontend, backend y MySQL están activos.

**Datos de prueba**
- Correo: usuario@novatech.com
- Contraseña: Usuario123!

**Pasos**
1. Abrir NovaTech.
2. Ingresar el correo del solicitante.
3. Ingresar la contraseña correcta.
4. Presionar el botón de iniciar sesión.

**Resultado esperado**
- El sistema autentica al usuario.
- Se muestra el Panel del Solicitante.
- El usuario no puede acceder a paneles de otros roles.

**Estado:** PASS

---

## TC-02 — Inicio de sesión con contraseña incorrecta

**Historia relacionada:** HU-01  
**Tipo de prueba:** Negativa / Sistema  
**Prioridad:** Alta

**Precondiciones**
- El usuario existe en la base de datos.

**Pasos**
1. Abrir el login.
2. Ingresar un correo válido.
3. Ingresar una contraseña incorrecta.
4. Intentar iniciar sesión.

**Resultado esperado**
- El acceso es rechazado.
- Se muestra un mensaje indicando que el correo o contraseña son incorrectos.
- No se redirige a ningún panel.

**Estado:** PASS

---

## TC-03 — Registrar una solicitud de mantenimiento

**Historia relacionada:** HU-03  
**Tipo de prueba:** Funcional / Integración  
**Prioridad:** Alta

**Precondiciones**
- Sesión iniciada como solicitante.

**Pasos**
1. Ir al formulario Nueva solicitud.
2. Ingresar una descripción.
3. Indicar una ubicación.
4. Seleccionar una categoría.
5. Presionar Registrar solicitud.

**Resultado esperado**
- La solicitud se almacena en MySQL.
- Se genera un ID.
- El estado inicial es Pendiente.
- La prioridad inicial es Media.
- Se registra el evento “Solicitud creada” en el historial.

**Estado:** PASS

---

## TC-04 — Registrar solicitud con campos obligatorios vacíos

**Historia relacionada:** HU-03  
**Tipo de prueba:** Negativa / Validación  
**Prioridad:** Media

**Precondiciones**
- Sesión iniciada como solicitante.

**Pasos**
1. Abrir Nueva solicitud.
2. Dejar uno o varios campos obligatorios vacíos.
3. Intentar registrar la solicitud.

**Resultado esperado**
- La solicitud no se registra.
- El sistema solicita completar los campos obligatorios.

**Estado:** PASS

---

## TC-05 — Asignar prioridad y técnico

**Historias relacionadas:** HU-05, HU-06  
**Tipo de prueba:** Funcional / Integración  
**Prioridad:** Alta

**Precondiciones**
- Existe una solicitud Pendiente.
- Sesión iniciada como administrador.
- Existe al menos un técnico registrado.

**Pasos**
1. Localizar la solicitud.
2. Cambiar la prioridad.
3. Seleccionar un técnico.
4. Presionar Guardar.

**Resultado esperado**
- Se actualizan la prioridad y el técnico.
- Los cambios permanecen después de recargar.
- El historial registra el cambio de prioridad.
- El historial registra la asignación del técnico.
- Los eventos indican al administrador como responsable.

**Estado:** PASS

---

## TC-06 — Técnico inicia una solicitud asignada

**Historia relacionada:** HU-07  
**Tipo de prueba:** Funcional / Integración  
**Prioridad:** Alta

**Precondiciones**
- La solicitud está asignada al técnico.
- Estado actual: Pendiente.

**Pasos**
1. Iniciar sesión como técnico.
2. Localizar la solicitud.
3. Presionar Iniciar.

**Resultado esperado**
- El estado cambia a En proceso.
- El cambio se refleja en la interfaz.
- Se registra el cambio en el historial.
- El evento indica al técnico como responsable.

**Estado:** PASS

---

## TC-07 — Registrar comentario técnico

**Historia relacionada:** HU-09  
**Tipo de prueba:** Funcional / Integración  
**Prioridad:** Alta

**Precondiciones**
- La solicitud se encuentra En proceso.
- Sesión iniciada como técnico.

**Pasos**
1. Escribir una observación en el campo de comentarios.
2. Presionar Comentar.
3. Abrir Ver historial.

**Resultado esperado**
- El comentario se almacena en la base de datos.
- El sistema confirma su registro.
- El comentario aparece en el historial.
- Se muestra nombre, rol, fecha y hora.

**Estado:** PASS

---

## TC-08 — Evitar comentario vacío

**Historia relacionada:** HU-09  
**Tipo de prueba:** Negativa / Validación  
**Prioridad:** Media

**Precondiciones**
- Existe una solicitud En proceso.

**Pasos**
1. Dejar vacío el campo de comentario.
2. Intentar registrar el comentario.

**Resultado esperado**
- No se registra ningún comentario vacío.
- El botón permanece deshabilitado o el sistema rechaza la operación.

**Estado:** PASS

**Observación:** El sistema impide registrar comentarios vacíos; sin embargo, el estado deshabilitado del botón no es suficientemente evidente para el usuario y no se muestra un mensaje explicativo.
---

## TC-09 — Finalizar solicitud como técnico

**Historia relacionada:** HU-10  
**Tipo de prueba:** Funcional / Sistema  
**Prioridad:** Alta

**Precondiciones**
- Estado actual: En proceso.
- Sesión iniciada como técnico.

**Pasos**
1. Localizar la solicitud.
2. Presionar Finalizar.

**Resultado esperado**
- El estado cambia a Finalizada.
- Se ocultan los controles para continuar trabajando.
- Se muestra “Trabajo completado”.
- El historial registra el cambio de estado.

**Estado:** PASS

---

## TC-10 — Reabrir una solicitud finalizada

**Historia relacionada:** HU-10  
**Tipo de prueba:** Funcional / Regresión  
**Prioridad:** Alta

**Precondiciones**
- Estado actual: Finalizada.
- Sesión iniciada como administrador.

**Pasos**
1. Localizar la solicitud.
2. Presionar Reabrir.

**Resultado esperado**
- El estado cambia a En proceso.
- El técnico puede volver a trabajar sobre la solicitud.
- Se registra “Solicitud reabierta” en el historial.

**Estado:** PASS

---

## TC-11 — Cerrar definitivamente una solicitud

**Historia relacionada:** HU-10  
**Tipo de prueba:** Funcional / Sistema  
**Prioridad:** Alta

**Precondiciones**
- Estado actual: Finalizada.
- Sesión iniciada como administrador.

**Pasos**
1. Localizar la solicitud.
2. Presionar Cerrar solicitud.

**Resultado esperado**
- El estado cambia a Cerrada.
- La solicitud queda en modo de solo lectura.
- Ya no aparecen controles de edición.
- El historial registra “Solicitud cerrada”.

**Estado:** PASS

---

## TC-12 — Consultar trazabilidad completa

**Historia relacionada:** HU-08  
**Tipo de prueba:** Sistema / Trazabilidad  
**Prioridad:** Alta

**Precondiciones**
- La solicitud ha recorrido varias etapas de su ciclo de vida.

**Pasos**
1. Presionar Ver historial.
2. Revisar los movimientos registrados.

**Resultado esperado**
- Los eventos aparecen en orden cronológico.
- Se muestran creación, cambios de prioridad, asignaciones, cambios de estado y comentarios.
- Cada movimiento muestra usuario, fecha y hora.
- Los comentarios y eventos aparecen integrados en una misma línea temporal.

**Estado:** PASS

---

# Resumen de ejecución actual

| Resultado | Cantidad |
|---|---:|
| PASS | 12 |
| FAIL | 0 |
| Pendiente | 0 |
| Total | 12 |

## Resultado general

Se ejecutaron los 12 casos de prueba definidos.

- Casos aprobados: 12
- Casos fallidos: 0
- Tasa de aprobación: 100 %

Durante la ejecución se identificó una observación de usabilidad relacionada con la retroalimentación visual del botón “Comentar” cuando el campo se encuentra vacío, registrada como DEF-06.

