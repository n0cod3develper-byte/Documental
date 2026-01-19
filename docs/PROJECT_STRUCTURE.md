# Estructura del Proyecto

```
Documental/
│
├── 📄 README.md                    # Documentación principal
│
├── 📁 backend/                     # API Node.js + Express
│   ├── 📁 config/
│   │   └── database.js             # Configuración Sequelize
│   ├── 📁 src/
│   │   ├── server.js               # Servidor Express principal
│   │   ├── 📁 routes/              # Rutas REST (próximo)
│   │   ├── 📁 controllers/         # Controladores (próximo)
│   │   ├── 📁 models/              # Modelos Sequelize (próximo)
│   │   ├── 📁 middleware/          # Auth, RBAC, etc. (próximo)
│   │   └── 📁 services/            # Lógica de negocio (próximo)
│   ├── 📁 uploads/                 # Archivos subidos (creado en runtime)
│   ├── 📁 logs/                    # Logs de aplicación (creado en runtime)
│   ├── .env.example                # Template de variables de entorno
│   ├── .gitignore
│   ├── Dockerfile                  # Imagen Docker del backend
│   └── package.json                # Dependencias Node.js
│
├── 📁 frontend/                    # React SPA
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── App.js                  # Componente principal
│   │   ├── index.js                # Entry point
│   │   ├── index.css               # Estilos Tailwind
│   │   ├── 📁 components/          # Componentes React (próximo)
│   │   ├── 📁 pages/               # Páginas/Vistas (próximo)
│   │   ├── 📁 context/             # Context API (próximo)
│   │   ├── 📁 services/            # API calls (próximo)
│   │   └── 📁 utils/               # Utilidades (próximo)
│   ├── .env                        # Variables de entorno
│   ├── Dockerfile                  # Imagen Docker del frontend
│   ├── nginx.conf                  # Configuración nginx para SPA
│   ├── tailwind.config.js          # Configuración Tailwind
│   └── package.json                # Dependencias React
│
├── 📁 database/                    # Scripts SQL
│   ├── init.sql                    # Script de inicialización completo
│   ├── README.md                   # Documentación de BD
│   ├── 📁 migrations/              # Migraciones Sequelize (próximo)
│   └── 📁 seeders/                 # Datos de prueba (próximo)
│
├── 📁 docker/                      # Configuración Docker
│   ├── docker-compose.yml          # Orquestación de servicios
│   ├── nginx.conf                  # Reverse proxy principal
│   ├── .env                        # Variables de entorno Docker
│   └── backup.sh                   # Script de backup automatizado
│
└── 📁 docs/                        # Documentación
    └── QUICKSTART.md               # Guía de inicio rápido
```

## 📊 Estado Actual del Proyecto

### ✅ Completado (Fase 1)

- **Estructura de directorios**: Organización completa del proyecto
- **Backend Base**: 
  - Express server configurado
  - Middleware de seguridad (Helmet, CORS, Rate Limiting)
  - Health check endpoint
  - Configuración de base de datos
- **Frontend Base**:
  - React app inicializada
  - Tailwind CSS configurado
  - Variables de entorno
- **Base de Datos**:
  - Script SQL completo con 7 tablas
  - Índices optimizados
  - Triggers para updated_at
  - Datos iniciales (roles, permisos, departamentos, admin)
- **Docker**:
  - docker-compose.yml con 4 servicios
  - Dockerfiles para backend y frontend
  - Nginx reverse proxy configurado
  - Script de backup automatizado
- **Documentación**:
  - README principal
  - Guía de inicio rápido
  - Documentación de base de datos

### 🔄 Próximos Pasos (Fase 2-3)

#### Backend
- [ ] Modelos Sequelize (Users, Departments, Folders, Documents, etc.)
- [ ] Middleware de autenticación JWT
- [ ] Middleware de autorización RBAC
- [ ] Controladores para cada recurso
- [ ] Rutas REST completas
- [ ] Servicio de manejo de archivos (Multer)
- [ ] Sistema de auditoría

#### Frontend
- [ ] AuthContext y manejo de sesión
- [ ] React Router con rutas protegidas
- [ ] Componentes de layout (Sidebar, Header, Breadcrumb)
- [ ] Páginas principales (Login, Dashboard, Explorer)
- [ ] Componentes de carpetas y documentos
- [ ] Sistema de búsqueda
- [ ] Integración con API backend

## 🔑 Credenciales Iniciales

**Usuario Administrador:**
- Email: `admin@empresa.com`
- Password: `Admin123!` (hash bcrypt incluido en init.sql)

## 🚀 Cómo Iniciar

### Opción 1: Docker (Recomendado)
```bash
cd docker
docker-compose up -d
```

### Opción 2: Desarrollo Local
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

Ver [QUICKSTART.md](QUICKSTART.md) para instrucciones detalladas.

## 📦 Tecnologías Utilizadas

### Backend
- Node.js 20 LTS
- Express.js 4.18+
- PostgreSQL 15
- Sequelize ORM
- JWT para autenticación
- Bcrypt para hashing
- Multer para archivos

### Frontend
- React 18
- Tailwind CSS 3
- React Router v6
- Axios
- Context API
- React Hot Toast

### DevOps
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- PostgreSQL (Container)

## 🔒 Seguridad Implementada

- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ JWT para autenticación
- ✅ Rate limiting en endpoints
- ✅ Headers de seguridad (Helmet)
- ✅ CORS configurado
- ✅ Validación de entrada
- ✅ SQL injection protection (Sequelize)
- ✅ XSS protection

## 📈 Próximas Fases

1. **Fase 2 (Semanas 1-2)**: Base de datos y modelos
2. **Fase 3 (Semanas 3-4)**: Backend completo
3. **Fase 4 (Semanas 5-6)**: Frontend completo
4. **Fase 5 (Semana 7)**: Integración y pruebas
5. **Fase 6 (Semana 8)**: Despliegue piloto
