# NovaTech - Sistema de Gestión de Solicitudes de Mantenimiento

Proyecto desarrollado para el curso **Pruebas y Aseguramiento de la Calidad del Software**.

## Descripción

NovaTech es un sistema web para registrar, asignar, priorizar y dar seguimiento a solicitudes de mantenimiento dentro de una institución educativa.

El sistema implementa tres roles:

- Administrador.
- Técnico.
- Solicitante.

Cada rol posee permisos específicos sobre las solicitudes y sus estados.

## Tecnologías

### Backend

- Node.js
- Express
- MySQL
- JSON Web Tokens (JWT)

### Frontend

- React
- Vite
- React Router

### Calidad y pruebas

- Oxlint
- Vitest
- Playwright
- GitHub Actions

---

## Requisitos

Antes de ejecutar el proyecto se debe tener instalado:

- Node.js
- npm
- MySQL Server
- Git

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/miranda-aguerodev/pruebasACS.git
cd pruebasACS
```

### 2. Instalar dependencias del backend

```bash
npm install
```

En Windows PowerShell también se puede utilizar:

```powershell
npm.cmd install
```

### 3. Instalar dependencias del frontend

```bash
cd client
npm install
cd ..
```

En Windows PowerShell:

```powershell
cd client
npm.cmd install
cd ..
```

---

# Configuración de la base de datos

El proyecto utiliza MySQL.

Los scripts necesarios se encuentran en:

```text
database/schema.sql
database/seed.sql
```

## 1. Crear la estructura

Ejecutar:

```text
database/schema.sql
```

desde MySQL Workbench o un cliente compatible.

## 2. Cargar los datos de prueba

Después ejecutar:

```text
database/seed.sql
```

La base de datos utilizada por defecto es:

```text
novatech_db
```

---

# Configuración de variables de entorno

En la raíz del proyecto existe el archivo:

```text
.env.example
```

Crear una copia llamada:

```text
.env
```

Ejemplo:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_PASSWORD_MYSQL
DB_NAME=novatech_db
JWT_SECRET=TU_SECRETO_JWT
```

## Generar JWT_SECRET

Se recomienda generar un valor aleatorio para `JWT_SECRET`.

Puede utilizarse Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiar el resultado y colocarlo en:

```env
JWT_SECRET=valor_generado
```


---

# Ejecución del proyecto

Se necesitan dos terminales.

## Terminal 1 - Backend

Desde la raíz del proyecto:

```bash
node index.js
```

El servidor se ejecutará en:

```text
http://localhost:3000
```

Para comprobar el backend:

```text
GET http://localhost:3000/api/health
```

---

## Terminal 2 - Frontend

```bash
cd client
npm run dev
```

En Windows PowerShell:

```powershell
npm.cmd run dev
```

Vite mostrará en la terminal la dirección local del frontend.

---

# Usuarios de prueba

El archivo `database/seed.sql` incluye los siguientes usuarios para pruebas:

## Administrador

```text
Email: admin@novatech.com
Password: Admin123!
```

## Técnico

```text
Email: tecnico@novatech.com
Password: Tecnico123!
```

## Solicitante

```text
Email: usuario@novatech.com
Password: Usuario123!
```

> Estas credenciales corresponden únicamente al entorno académico y de pruebas.

---

# Autenticación y autorización

NovaTech utiliza autenticación mediante JWT.

Después del inicio de sesión, el backend genera un token que identifica:

```text
id
email
rol
```

Los endpoints protegidos requieren:

```text
Authorization: Bearer <token>
```

Los únicos endpoints públicos son:

```text
GET /api/health
POST /api/login
```

La autorización también se valida en el backend.

## Solicitante

Puede:

- Crear solicitudes.
- Consultar sus propias solicitudes.
- Consultar el historial de sus solicitudes.

## Técnico

Puede:

- Consultar solicitudes asignadas.
- Iniciar solicitudes asignadas.
- Finalizar solicitudes asignadas.
- Agregar comentarios.
- Consultar su historial.

## Administrador

Puede:

- Consultar todas las solicitudes.
- Asignar técnicos.
- Cambiar prioridades.
- Gestionar estados.
- Reabrir solicitudes.
- Cerrar solicitudes.
- Ejecutar cierres administrativos.

---

# Ejecución de pruebas

Las pruebas del frontend se ejecutan desde:

```bash
cd client
```

## Análisis estático

```bash
npm run lint
```

Resultado de la última regresión:

```text
0 warnings
0 errors
29 files
92 rules
```

## Pruebas unitarias

```bash
npx vitest run
```

Resultado de la última regresión:

```text
14/14 PASS
```

## Build de producción

```bash
npm run build
```

Resultado:

```text
PASS
```

## Pruebas End-to-End

Con backend y frontend ejecutándose:

```bash
npx playwright test
```

Resultado de la última regresión:

```text
2/2 PASS
```

En Windows PowerShell pueden utilizarse:

```powershell
npm.cmd run lint
npx.cmd vitest run
npm.cmd run build
npx.cmd playwright test
```

---

# CI/CD

El repositorio utiliza **GitHub Actions** para ejecutar automáticamente verificaciones de calidad.

El pipeline incluye:

```text
Análisis estático
Pruebas unitarias
Build de producción
```

Los workflows se ejecutan automáticamente con los cambios enviados al repositorio.

---

# Documentación de pruebas

La documentación de aseguramiento de calidad se encuentra en:

```text
docs/
```

Entre los documentos disponibles se incluyen:

```text
SMOKE_TEST.md
TEST_CASES.md
STATIC_ANALYSIS.md
BLACK_BOX_TESTING.md
EXPLORATORY_TESTING.md
DEFECT_LOG.md
CI_CD.md
```

El registro de defectos documenta los hallazgos identificados durante las diferentes etapas de pruebas, sus correcciones y las regresiones realizadas.

---

# Estado actual de calidad

Última regresión registrada:

```text
Oxlint       0 warnings / 0 errors
Vitest       14/14 pruebas
Vite build   PASS
Playwright   2/2 pruebas
```

Defectos registrados:

```text
Total:      12
Cerrados:   12
Abiertos:    0
```

---

## Proyecto académico

NovaTech fue desarrollado como proyecto académico para aplicar técnicas de:

- Verificación y validación.
- Pruebas funcionales.
- Pruebas de caja negra.
- Pruebas exploratorias.
- Pruebas unitarias.
- Pruebas End-to-End.
- Análisis estático.
- Regresión.
- Gestión de defectos.
- CI/CD.
- Autenticación y autorización.