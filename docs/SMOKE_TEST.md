# NovaTech — Prueba de Humo Interna

## Objetivo

Verificar que las funciones críticas del Sistema de Gestión de Solicitudes de Mantenimiento se encuentren operativas antes de ejecutar pruebas más detalladas.

## Ambiente de prueba

- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: MySQL
- Navegador: Google Chrome
- Entorno: Local

## Flujo crítico

| ID | Prueba | Resultado esperado | Estado |
|---|---|---|---|
| ST-01 | Iniciar sesión como solicitante | El usuario accede al Panel del Solicitante | Pendiente |
| ST-02 | Registrar una nueva solicitud | La solicitud se almacena y aparece con estado Pendiente | Pendiente |
| ST-03 | Iniciar sesión como administrador y asignar prioridad y técnico | Los cambios se guardan correctamente | Pendiente |
| ST-04 | Iniciar sesión como técnico e iniciar la solicitud | El estado cambia de Pendiente a En proceso | Pendiente |
| ST-05 | Registrar un comentario como técnico | El comentario se guarda y aparece en el historial | Pendiente |
| ST-06 | Finalizar la solicitud como técnico | El estado cambia de En proceso a Finalizada | Pendiente |
| ST-07 | Cerrar la solicitud como administrador | El estado cambia de Finalizada a Cerrada y queda en solo lectura | Pendiente |
| ST-08 | Consultar el historial de la solicitud | Se muestran en orden los eventos, usuarios, comentarios, fechas y horas | Pendiente |

## Criterio de aprobación

La prueba de humo se considera aprobada si los 8 casos críticos se ejecutan correctamente y no existe ningún defecto bloqueante o crítico que impida completar el flujo principal.

## Evidencia requerida

Para cada caso se debe conservar al menos una evidencia cuando corresponda:

- Captura de pantalla.
- Resultado visible en la interfaz.
- Registro en base de datos.
- Mensaje del sistema.
- Historial de la solicitud.

## Resultado general

## Ejecución 1

**Fecha:** 11/08/2026  
**Solicitud utilizada:** #3 — Proyector del aula no enciende  
**Ambiente:** Local  
**Resultado:** APROBADO

| ID | Resultado | Evidencia observada |
|---|---|---|
| ST-01 | PASS | Inicio de sesión correcto como solicitante |
| ST-02 | PASS | Solicitud #3 creada con estado Pendiente y prioridad Media |
| ST-03 | PASS | Administrador cambió prioridad a Alta y asignó Técnico NovaTech |
| ST-04 | PASS | Técnico inició la solicitud y el estado cambió a En proceso |
| ST-05 | PASS | Comentario técnico registrado y visible en el historial |
| ST-06 | PASS | Técnico finalizó la solicitud correctamente |
| ST-07 | PASS | Administrador cerró la solicitud y quedó en solo lectura |
| ST-08 | PASS | Historial mostró creación, cambios, comentario, finalización y cierre en orden cronológico |

**8 de 8 pruebas aprobadas.**

No se identificaron defectos bloqueantes ni críticos durante esta ejecución.

La prueba de humo interna se considera **APROBADA**.
