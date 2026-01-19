# Guía de Instalación de PostgreSQL para el Proyecto

## Opción 1: Instalar PostgreSQL en Windows (Recomendado)

### 1. Descargar PostgreSQL
- Ir a: https://www.postgresql.org/download/windows/
- Descargar el instalador de PostgreSQL 15 o superior
- Ejecutar el instalador

### 2. Durante la Instalación
- **Puerto:** 5432 (dejar por defecto)
- **Superusuario:** postgres
- **Contraseña:** (dejar en blanco o usar "postgres")
- **Locale:** Spanish, Colombia

### 3. Después de Instalar

Abrir **pgAdmin 4** (se instala con PostgreSQL):

1. Conectar al servidor local
2. Click derecho en "Databases" → "Create" → "Database"
3. Nombre: `documental_db`
4. Owner: postgres
5. Click "Save"

### 4. Ejecutar Script de Inicialización

En pgAdmin:
1. Click derecho en `documental_db` → "Query Tool"
2. Abrir el archivo: `c:\laragon\www\Documental\database\init.sql`
3. Click en el botón "Execute" (▶️)

### 5. Verificar

Deberías ver 7 tablas creadas:
- departments
- roles
- users
- folders
- documents
- permissions
- audit_logs

---

## Opción 2: Usar Laragon con PostgreSQL

### 1. Agregar PostgreSQL a Laragon

1. Descargar PostgreSQL portable
2. Extraer en: `C:\laragon\bin\postgresql\`
3. Reiniciar Laragon
4. Iniciar PostgreSQL desde Laragon

### 2. Crear Base de Datos

Usar pgAdmin o línea de comandos:
```bash
createdb -U postgres documental_db
psql -U postgres -d documental_db -f c:\laragon\www\Documental\database\init.sql
```

---

## Opción 3: Docker Desktop (Más Fácil)

### 1. Instalar Docker Desktop
- Descargar: https://www.docker.com/products/docker-desktop/
- Instalar y reiniciar Windows
- Abrir Docker Desktop y esperar a que inicie

### 2. Iniciar PostgreSQL
```bash
cd c:\laragon\www\Documental\docker
docker-compose up -d postgres
```

Esto creará automáticamente la base de datos con todos los datos iniciales.

---

## Verificar Conexión

Una vez PostgreSQL esté corriendo, el backend debería conectarse automáticamente.

Verás en la consola del backend:
```
✓ Database connection established successfully
🚀 Servidor corriendo en puerto 5000
```

---

## Credenciales por Defecto

**Base de Datos:**
- Host: localhost
- Puerto: 5432
- Database: documental_db
- Usuario: postgres
- Contraseña: (vacía o "postgres")

**Usuario Admin del Sistema:**
- Email: admin@empresa.com
- Password: Admin123!

---

## Problemas Comunes

### "Connection refused"
- PostgreSQL no está corriendo
- Verificar en Servicios de Windows o Docker

### "Database does not exist"
- Crear la base de datos `documental_db`
- Ejecutar el script `init.sql`

### "Password authentication failed"
- Verificar contraseña en `backend/.env`
- Actualizar `DB_PASSWORD` si es necesario
