# NovaTech — Integración Continua (CI/CD)

## Objetivo

Implementar un proceso automatizado de integración continua para NovaTech que permita verificar la calidad del frontend cada vez que se integran cambios en la rama principal del repositorio.

El objetivo del pipeline es detectar problemas de calidad, fallos en pruebas automatizadas y errores de compilación antes de considerar estable una nueva versión del código.

---

## 1. Herramienta utilizada

Se utilizó:

- **GitHub Actions**
- Repositorio alojado en GitHub
- Node.js
- npm
- Oxlint
- Vitest
- Vite

El workflow se encuentra definido en:

```text
.github/workflows/qa.yml
```

---

## 2. Activación del pipeline

El workflow está configurado para ejecutarse automáticamente cuando ocurre:

- Un `push` sobre la rama `main`.
- Un `pull_request` dirigido hacia la rama `main`.

Esto permite que las verificaciones de calidad se ejecuten automáticamente durante la integración de cambios.

---

## 3. Etapas del pipeline

El job principal se denomina:

```text
Frontend Quality Checks
```

El pipeline ejecuta las siguientes etapas:

### 3.1 Checkout del repositorio

GitHub Actions descarga el código correspondiente al commit que se desea verificar.

### 3.2 Configuración de Node.js

Se prepara el ambiente de ejecución utilizando Node.js.

### 3.3 Instalación de dependencias

Se ejecuta:

```bash
npm ci
```

Esto instala las dependencias utilizando el archivo `package-lock.json` y permite una instalación reproducible en el entorno de CI.

### 3.4 Análisis estático

Se ejecuta:

```bash
npm run lint
```

Oxlint analiza automáticamente el código fuente antes de continuar con las demás etapas.

### 3.5 Pruebas unitarias automatizadas

Se ejecuta:

```bash
npx vitest run
```

Esta etapa valida la suite de pruebas unitarias desarrollada con Vitest.

### 3.6 Compilación del frontend

Finalmente se ejecuta:

```bash
npm run build
```

La aplicación debe compilar correctamente para que el pipeline pueda finalizar de forma exitosa.

---

## 4. Primera ejecución del pipeline

La primera ejecución del workflow no finalizó correctamente.

Las etapas anteriores a las pruebas unitarias se ejecutaron correctamente, incluyendo:

- Checkout del repositorio.
- Configuración de Node.js.
- Instalación de dependencias.
- Análisis estático.

Sin embargo, la etapa de pruebas unitarias terminó con error.

---

## 5. Incidente CI-01 — Interferencia entre Vitest y Playwright

**Tipo:** Configuración de automatización

**Estado:** Corregido

### Descripción

Durante la primera ejecución de GitHub Actions, Vitest ejecutó correctamente las 14 pruebas unitarias existentes.

Sin embargo, también intentó interpretar el archivo:

```text
tests/e2e/login.spec.js
```

como parte de su propia suite.

Ese archivo pertenece a Playwright y contiene pruebas End-to-End.

El pipeline produjo el siguiente mensaje:

```text
Playwright Test did not expect test() to be called here.
```

### Análisis

El problema no correspondía a un defecto funcional de NovaTech.

Las pruebas unitarias mostraban:

```text
14 passed
```

El fallo se originó porque las suites de Vitest y Playwright no estaban separadas explícitamente.

Se identificaron dos tipos diferentes de automatización:

- **Vitest:** pruebas unitarias.
- **Playwright:** pruebas End-to-End.

---

## 6. Corrección aplicada

Se creó el archivo:

```text
client/vitest.config.js
```

para indicar explícitamente que Vitest debía excluir las pruebas E2E.

La configuración agregó la exclusión:

```text
tests/e2e/**
```

Después de aplicar la corrección se ejecutó nuevamente Vitest de forma local.

### Resultado local

- Archivos de pruebas: 2
- Pruebas ejecutadas: 14
- PASS: 14
- FAIL: 0

Esto confirmó que Vitest ejecutaba únicamente las pruebas que le correspondían.

---

## 7. Segunda ejecución del pipeline

Después de corregir la configuración se realizó un nuevo `push` a GitHub.

GitHub Actions inició automáticamente una nueva ejecución del workflow:

```text
NovaTech QA
```

### Resultado

Todas las etapas finalizaron correctamente:

| Etapa | Resultado |
|---|---|
| Checkout repository | PASS |
| Setup Node.js | PASS |
| Install dependencies | PASS |
| Static analysis | PASS |
| Unit tests | PASS |
| Build application | PASS |

El job:

```text
Frontend Quality Checks
```

finalizó satisfactoriamente.

---

## 8. Resultado final de CI

**Estado del pipeline: APROBADO**

La segunda ejecución confirmó que el repositorio puede:

1. Descargar el código en un ambiente limpio.
2. Instalar sus dependencias correctamente.
3. Superar el análisis estático.
4. Ejecutar satisfactoriamente las pruebas unitarias.
5. Compilar correctamente la aplicación React.

---

## 9. Pruebas E2E y CI

Las pruebas End-to-End desarrolladas con Playwright se mantienen actualmente como una suite automatizada independiente.

Se automatizaron dos escenarios:

1. Rechazo del inicio de sesión con credenciales incorrectas.
2. Inicio de sesión válido como solicitante y redirección al panel correspondiente.

Resultado local:

```text
2 passed
```

Las pruebas E2E no se incorporaron al pipeline principal debido a que requieren levantar el frontend, el backend y la base de datos del sistema.

Para el alcance actual del proyecto se decidió mantener:

- **CI:** Oxlint + Vitest + Build.
- **E2E:** Playwright ejecutado de forma independiente.

Esta separación permite mantener un pipeline de integración continua simple y estable, sin eliminar la cobertura End-to-End del producto.

---

## 10. Evidencias disponibles

Se conservaron evidencias de:

- Primera ejecución fallida de GitHub Actions.
- Mensaje de error generado por la interferencia Vitest/Playwright.
- Ejecución local de 14 pruebas Vitest después de la corrección.
- Segunda ejecución exitosa de GitHub Actions.
- Workflow `NovaTech QA` en estado exitoso.
- Job `Frontend Quality Checks` completamente aprobado.
- Ejecución local de 2 pruebas E2E mediante Playwright.

---

## 11. Clasificación del incidente

El incidente CI-01 se documenta como un **incidente de configuración de CI/CD** y no como un defecto funcional del producto.

La aplicación no presentó un comportamiento incorrecto para los usuarios.

El problema estaba relacionado exclusivamente con la separación de herramientas dentro del proceso automatizado de pruebas.

Por esta razón, CI-01 no se incorpora al archivo:

```text
DEFECT_LOG.md
```

y se mantiene documentado dentro de este informe de integración continua.

---

## 12. Conclusión

La implementación de GitHub Actions permitió incorporar controles de calidad automáticos al proceso de integración de NovaTech.

Además, la primera ejecución permitió detectar una incompatibilidad en la organización de las suites automatizadas, la cual fue analizada, corregida y verificada mediante una segunda ejecución exitosa.

El proceso seguido fue:

**Integración → Ejecución automática → Fallo → Análisis → Corrección → Nueva ejecución → Pipeline aprobado**

### Estado final

- Pipeline CI configurado: Sí
- Análisis estático automatizado: Sí
- Pruebas unitarias automatizadas en CI: Sí
- Build automatizado: Sí
- Pruebas E2E disponibles: Sí
- Segunda ejecución CI exitosa: Sí

**Resultado final: APROBADO**