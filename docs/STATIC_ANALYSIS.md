# NovaTech — Análisis Estático

## Objetivo

Evaluar la calidad del código fuente de NovaTech mediante análisis estático, con el propósito de identificar posibles problemas de mantenibilidad, estructura de componentes y uso de React Hooks sin necesidad de ejecutar funcionalmente la aplicación.

## Herramienta utilizada

- **Herramienta:** Oxlint
- **Área evaluada:** Frontend
- **Tecnología:** React + Vite
- **Tipo de actividad:** Verificación mediante análisis estático

---

## 1. Primera ejecución

Se ejecutó el siguiente comando desde el proyecto frontend:

```bash
npm run lint
```

### Resultado

- Archivos analizados: 28
- Reglas aplicadas: 92
- Warnings encontrados: 3
- Errores encontrados: 0

La herramienta identificó tres hallazgos técnicos relacionados con la estructura de React y el manejo de dependencias en Hooks.

---

## 2. Hallazgos encontrados

### AE-01 — Contexto de React y Fast Refresh

**Archivo:** `src/context/AuthContext.jsx`

**Tipo:** Estructura de componentes / mantenibilidad

### Descripción

Oxlint detectó que el archivo `AuthContext.jsx` exportaba tanto el contexto de React como el componente `AuthProvider`.

El mensaje obtenido fue:

```text
Fast refresh only works when a file only exports components.
Move your React context(s) to a separate file.
```

### Riesgo

Aunque el sistema continuaba funcionando, esta estructura podía afectar el comportamiento esperado de Fast Refresh durante el desarrollo y mezclaba responsabilidades dentro de un mismo archivo.

### Corrección aplicada

Se separó la creación del contexto en un nuevo archivo:

```text
src/context/authContext.js
```

El componente proveedor se mantuvo en:

```text
src/context/AuthContext.jsx
```

También se actualizaron las importaciones correspondientes en `useAuth.js`.

### Estado

**Corregido**

---

### AE-02 — Expresión compleja en dependencias de useCallback

**Archivo:** `src/hooks/useRequests.js`

**Tipo:** React Hooks / mantenibilidad

### Descripción

El hook utilizaba directamente la siguiente expresión dentro del arreglo de dependencias de `useCallback`:

```javascript
[JSON.stringify(filters)]
```

Oxlint indicó que esta expresión era demasiado compleja para ser analizada estáticamente.

### Riesgo

El uso de expresiones complejas dentro del arreglo de dependencias puede dificultar el mantenimiento del código y el análisis correcto de los cambios que deben provocar una nueva ejecución del callback.

### Corrección aplicada

Se extrajo el valor a una variable independiente:

```javascript
const filtersKey = JSON.stringify(filters);
```

Posteriormente se utilizó esa variable como dependencia:

```javascript
[filtersKey]
```

### Estado

**Corregido**

---

### AE-03 — Dependencia no representada correctamente en useCallback

**Archivo:** `src/hooks/useRequests.js`

**Tipo:** React Hooks

### Descripción

Oxlint detectó que la variable `filters` era utilizada dentro del callback, pero no estaba representada de una forma que pudiera comprobarse correctamente dentro del arreglo de dependencias.

El análisis generó una advertencia relacionada con una dependencia faltante.

### Riesgo

Una dependencia incorrecta en un React Hook puede provocar el uso de valores desactualizados o ejecuciones inesperadas durante el ciclo de vida del componente.

### Corrección aplicada

La refactorización mediante la variable `filtersKey` permitió utilizar una dependencia estable y verificable dentro de `useCallback`.

### Estado

**Corregido**

---

## 3. Segunda ejecución

Después de corregir el hallazgo AE-01 se ejecutó nuevamente:

```bash
npm run lint
```

### Resultado

- Warnings encontrados: 2
- Errores encontrados: 0

Los dos warnings restantes correspondían al archivo:

```text
src/hooks/useRequests.js
```

Esto confirmó que la primera corrección había eliminado correctamente uno de los tres hallazgos iniciales.

---

## 4. Ejecución final

Después de corregir AE-02 y AE-03 se volvió a ejecutar:

```bash
npm run lint
```

### Resultado final

```text
Found 0 warnings and 0 errors.
Finished in 17ms on 29 files with 92 rules using 16 threads.
```

### Métricas finales

- Archivos analizados: 29
- Reglas aplicadas: 92
- Warnings: 0
- Errores: 0
- Tiempo de ejecución: 17 ms

**Resultado del análisis estático: APROBADO**

---

## 5. Prueba de regresión posterior

Después de modificar `AuthContext.jsx`, `authContext.js`, `useAuth.js` y `useRequests.js`, se ejecutó nuevamente la suite automatizada de pruebas unitarias para comprobar que las correcciones no introdujeran regresiones.

Comando utilizado:

```bash
npx vitest run
```

### Resultado

- Archivos de prueba ejecutados: 2
- Pruebas ejecutadas: 14
- PASS: 14
- FAIL: 0

La totalidad de las pruebas automatizadas continuó funcionando después de las modificaciones realizadas a partir de los hallazgos de Oxlint.

---

## 6. Clasificación de los hallazgos

Los hallazgos AE-01, AE-02 y AE-03 se clasificaron como **hallazgos de análisis estático** y no como defectos funcionales del sistema.

La razón es que ninguno produjo directamente un fallo observable para el usuario durante las pruebas funcionales.

Por esta razón se mantienen separados del registro `DEFECT_LOG.md`, que contiene los defectos funcionales y de usabilidad encontrados durante la ejecución y prueba del producto.

---

## 7. Resultado

El análisis estático permitió identificar tres problemas relacionados con calidad y mantenibilidad del código antes de que se manifestaran como fallos funcionales.

El proceso aplicado fue:

**Detección → Análisis → Corrección → Nueva ejecución → Prueba de regresión**

### Resultado final

- Hallazgos iniciales: 3
- Hallazgos corregidos: 3
- Hallazgos pendientes: 0
- Warnings finales: 0
- Errores finales: 0
- Regresión automatizada: 14 de 14 pruebas aprobadas

**Estado final: APROBADO**