# Guía de Inicio Rápido

## 🚀 Opción 1: Desarrollo Local (Recomendado para desarrollo)

### 1. Instalar Dependencias Backend

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

```bash
# En el directorio backend
cp .env.example .env
```

Editar `.env` y configurar:
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` (PostgreSQL)
- `JWT_SECRET` (generar uno seguro)

### 3. Iniciar PostgreSQL

Si tienes PostgreSQL instalado localmente:

```bash
# Crear base de datos
createdb documental_db

# Ejecutar script de inicialización
psql -d documental_db -f ../database/init.sql
```

O usar Docker solo para PostgreSQL:

```bash
cd docker
docker-compose up -d postgres
```

### 4. Iniciar Backend

```bash
cd backend
npm run dev
```

El backend estará en: http://localhost:5000

### 5. Iniciar Frontend

```bash
cd frontend
npm install
npm start
```

El frontend estará en: http://localhost:3000

---

## 🐳 Opción 2: Docker Completo (Recomendado para producción)

### 1. Configurar Variables de Entorno

```bash
cd docker
cp .env.example .env
```

Editar `.env` con credenciales seguras.

### 2. Construir e Iniciar Todos los Servicios

```bash
docker-compose up -d --build
```

### 3. Verificar Estado

```bash
docker-compose ps
```

Deberías ver 4 servicios corriendo:
- `documental_postgres`
- `documental_backend`
- `documental_frontend`
- `documental_nginx`

### 4. Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio
docker-compose logs -f backend
```

---

## 👤 Primer Login

1. Abrir http://localhost (Docker) o http://localhost:3000 (local)
2. Usar credenciales:
   - **Email**: admin@empresa.com
   - **Password**: Admin123!

> ⚠️ **IMPORTANTE**: Cambiar esta contraseña inmediatamente

---

## 🛠️ Comandos Útiles

### Backend

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Ejecutar migraciones
npm run migrate

# Ejecutar seeds
npm run seed
```

### Frontend

```bash
# Desarrollo
npm start

# Build para producción
npm run build

# Tests
npm test
```

### Docker

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f [service-name]

# Reiniciar un servicio
docker-compose restart backend

# Reconstruir imágenes
docker-compose up -d --build

# Limpiar todo (⚠️ elimina volúmenes)
docker-compose down -v
```

---

## 📊 Verificar Instalación

### 1. Health Check Backend

```bash
curl http://localhost:5000/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2026-01-16T...",
  "environment": "development"
}
```

### 2. Verificar Base de Datos

```bash
# Si usas Docker
docker exec -it documental_db psql -U documental_user -d documental_db

# Listar tablas
\dt

# Verificar roles
SELECT * FROM roles;

# Verificar usuario admin
SELECT email, first_name, last_name FROM users;
```

---

## 🐛 Solución de Problemas

### Puerto ya en uso

```bash
# Ver qué proceso usa el puerto 5000
netstat -ano | findstr :5000

# Cambiar puerto en .env
PORT=5001
```

### Error de conexión a PostgreSQL

1. Verificar que PostgreSQL esté corriendo:
```bash
docker-compose ps postgres
```

2. Verificar credenciales en `.env`

3. Ver logs:
```bash
docker-compose logs postgres
```

### Frontend no conecta con Backend

1. Verificar `REACT_APP_API_URL` en `frontend/.env`
2. Debe ser: `http://localhost:5000/api` (desarrollo local)
3. O: `http://localhost/api` (Docker con nginx)

### Errores de CORS

- Verificar que `CLIENT_URL` en backend `.env` coincida con la URL del frontend
- Desarrollo local: `http://localhost:3000`
- Docker: `http://localhost`

---

## 📝 Próximos Pasos

Una vez que el sistema esté corriendo:

1. ✅ Cambiar contraseña del admin
2. ✅ Crear departamentos adicionales
3. ✅ Crear usuarios de prueba
4. ✅ Probar subida de archivos
5. ✅ Verificar permisos por rol

---

## 📚 Documentación Adicional

- [README Principal](../README.md)
- [Plan de Implementación](../docs/implementation_plan.md)
- [Documentación de Base de Datos](../database/README.md)
