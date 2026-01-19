# Sistema de Gestión Documental - Database

## Estructura de Base de Datos

Este directorio contiene todos los scripts relacionados con la base de datos PostgreSQL.

### Archivos

- **init.sql**: Script de inicialización completo de la base de datos
  - Crea todas las tablas
  - Define índices
  - Configura triggers
  - Inserta datos iniciales (roles, permisos, departamentos piloto)
  - Crea usuario administrador por defecto

### Tablas Principales

1. **departments**: Departamentos de la empresa
2. **roles**: Roles del sistema (Admin, Manager, User)
3. **users**: Usuarios del sistema
4. **folders**: Estructura jerárquica de carpetas
5. **documents**: Metadata de documentos
6. **permissions**: Matriz de permisos por rol
7. **audit_logs**: Registro de auditoría

### Usuario Administrador Inicial

**Email**: admin@empresa.com  
**Password**: Admin123!

> ⚠️ **IMPORTANTE**: Cambiar esta contraseña inmediatamente en producción

### Ejecutar Inicialización

#### Opción 1: Con Docker
```bash
docker-compose up -d postgres
```
El script `init.sql` se ejecutará automáticamente.

#### Opción 2: Manual
```bash
psql -U documental_user -d documental_db -f init.sql
```

### Migraciones

Las migraciones de Sequelize se almacenarán en:
```
database/migrations/
```

Para ejecutar migraciones:
```bash
cd backend
npm run migrate
```

### Seeds

Los datos de prueba se almacenarán en:
```
database/seeders/
```

Para ejecutar seeds:
```bash
cd backend
npm run seed
```

## Diagrama ER

```
departments
    ├── users (department_id)
    └── folders (department_id)
        └── documents (folder_id)

roles
    ├── users (role_id)
    └── permissions (role_id)

users
    ├── folders (created_by)
    ├── documents (uploaded_by)
    └── audit_logs (user_id)
```

## Índices

Se han creado índices en:
- Claves foráneas
- Campos de búsqueda frecuente (email, name)
- Campos de filtrado (created_at, department_id)

## Seguridad

- Contraseñas hasheadas con bcrypt (12 rounds)
- Constraint para Admin sin departamento
- Unique constraints para evitar duplicados
- Cascading deletes configurados apropiadamente
