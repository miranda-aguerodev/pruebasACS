# NovaTech — Registro de Defectos

## Objetivo

Documentar los defectos identificados durante el desarrollo y las pruebas del Sistema de Gestión de Solicitudes de Mantenimiento NovaTech.

| ID | Defecto | Severidad | Estado | Solución aplicada |
|---|---|---|---|---|
| DEF-01 | El archivo `TechnicianDashboard.jsx` contenía dos `export default`, provocando que Vite no compilara la aplicación. | Alta | Cerrado | Se eliminó la definición duplicada y se dejó un único componente exportado. |
| DEF-02 | Código correspondiente a `TechnicianRequestActions` fue colocado accidentalmente en `StatusBadge.jsx`, provocando pantalla en blanco al ingresar como técnico. | Alta | Cerrado | Se restauró `StatusBadge.jsx` y se ubicó la lógica en el componente correcto. |
| DEF-03 | Los comentarios del técnico se almacenaban correctamente en MySQL, pero no podían visualizarse posteriormente desde la interfaz. | Media | Cerrado | Se creó `RequestHistory.jsx` y se agregó la consulta del historial desde la interfaz. |
| DEF-04 | Una solicitud finalizada continuaba mostrando controles generales de edición al administrador. | Media | Cerrado | Se implementó el flujo Finalizada → Cerrar/Reabrir y Cerrada → Solo lectura. |
| DEF-05 | La tarjeta “Finalizadas” contabilizaba también las solicitudes cerradas. | Baja | Cerrado | Se separaron los conteos de solicitudes Finalizadas y Cerradas. |
| DEF-06 | El botón “Comentar” no comunica visualmente con suficiente claridad que está deshabilitado cuando el campo está vacío, y no se muestra retroalimentación al usuario. | Baja | Cerrado | Se mejoró el estado visual del botón “Comentar” cuando el campo está vacío, aplicando una apariencia claramente deshabilitada y un tooltip explicativo.cd |
| DEF-07 | Los headers personalizados enviados mediante `apiRequest` sobrescribían el header predeterminado `Content-Type: application/json`. | Media | Cerrado | Una prueba unitaria automatizada con Vitest detectó el defecto. Se corrigió el orden de construcción de las opciones de `fetch` para conservar el `Content-Type` junto con headers adicionales. |


## Resumen

- Total de defectos registrados: 7
- Cerrados: 7
- Abiertos: 0
- Defectos críticos/bloqueantes pendientes: 0

