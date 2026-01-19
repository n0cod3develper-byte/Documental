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

## 🤝 Contribución

1. Haz un Fork del proyecto.
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`).
3. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Push a la rama (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.
