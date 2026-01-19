# Sistema de Gestión Documental Empresarial (MVP)

![Status](https://img.shields.io/badge/Estado-Completado-green)
![Version](https://img.shields.io/badge/Versión-1.0.0-blue)

Un sistema robusto para la gestión segura de documentos empresariales, diseñado para mejorar la eficiencia y el control de acceso a la información sensible.

## 🚀 Características Principales

- **Gestión de Documentos:** Subida, descarga y organización jerárquica de archivos.
- **Seguridad Avanzada:** Autenticación JWT, encriptación de contraseñas y control de acceso basado en roles (RBAC).
- **Organización por Departamentos:** Aislamiento de información entre RRHH, Contabilidad, Legal, etc.
- **Auditoría Completa:** Registro detallado de todas las acciones del sistema.
- **Interfaz Moderna:** Dashboard intuitivo y responsive desarrollado en React.

## 🛠️ Tecnologías

### Backend
- **Node.js** & **Express**
- **Sequelize ORM** (PostgreSQL)
- **JWT** para autenticación segura
- **Multer** para gestión de archivos

### Frontend
- **React 18**
- **Tailwind CSS v3**
- **Axios** para comunicación API
- **Context API** para gestión de estado

### Infraestructura
- **Docker** & **Docker Compose**
- **Nginx** (Reverse Proxy)
- **PostgreSQL 15**

## 🏁 Guía de Inicio Rápido

### Requisitos Previos
- Docker Desktop instalado y corriendo.
- Node.js 18+ (para desarrollo local sin Docker).

### Instalación y Ejecución (Recomendado)

1. **Clonar el repositorio:**
   ```bash
   git clone <repo-url>
   cd Documental
   ```

2. **Iniciar con Docker Compose:**
   ```bash
   cd docker
   docker-compose up -d --build
   ```

3. **Acceder a la aplicación:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

### Credenciales de Acceso (Demo)

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Admin** | `admin@empresa.com` | `Admin123!` |

## 📚 Documentación Adicional

- [Estructura del Proyecto](docs/PROJECT_STRUCTURE.md)
- [Guía de Configuración de Base de Datos](docs/POSTGRESQL_SETUP.md)
- [Testing Backend](docs/BACKEND_TESTING.md)
- [Testing Frontend](docs/FRONTEND_TESTING.md)
- [Walkthrough Completo](C:/Users/user/.gemini/antigravity/brain/aa675a71-5a10-4b76-b904-96a6094382bf/walkthrough.md)

## 🤝 Flujo de Trabajo y Normas de Git

### 1. Estrategia de Ramas
Nuestro flujo de trabajo se basa en **Feature Branching**.
- **`main`**: Rama estable y protegida. **PROHIBIDO COMMIT DIRECTO.**
- **`feature/nombre-corto`**: Para nuevas funcionalidades (ej: `feature/login`, `feature/tabla-usuarios`).
- **`fix/nombre-corto`**: Para corrección de errores (ej: `fix/error-auth`).

### 2. Rutina Diaria
1. **Antes de empezar:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Crear rama de trabajo:**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Guardar cambios (Commit):**
   ```bash
   git add .
   git commit -m "feat: descripción breve del cambio"
   ```
4. **Subir cambios:**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. **Crear Pull Request:** Desde GitHub, crear PR hacia `main`.

### 3. Convención de Commits
Usamos **Conventional Commits** simplificado:
- `feat: ...` -> Nueva funcionalidad.
- `fix: ...` -> Corrección de errores.
- `docs: ...` -> Cambios en documentación.
- `style: ...` -> Cambios de formato (espacios, puntos y comas).
- `refactor: ...` -> Cambios de código que no arreglan bugs ni añaden funcionalidades.

**Ejemplos:**
- ✅ `feat: agregar validación en formulario de contacto`
- ✅ `fix: corregir error de carga en safari`
- ❌ `cambios en el login` (muy vago)

### 4. Pull Requests (PR)
- **Título claro:** Describiendo qué hace el PR.
- **Revisión obligatoria:** El otro desarrollador debe aprobar el PR.
- **Checks:** El proyecto debe compilar (`npm run build`) antes del merge.
- **Merge:** "Squash and merge" (recomendado) o "Merge commit".

### 5. Configuración de Entorno
- **Nunca** subir archivos `.env` al repositorio.
- Usar `.env.example` como plantilla para las variables requeridas.


## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.
