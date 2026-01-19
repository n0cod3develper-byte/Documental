-- ============================================
-- Sistema de Gestión Documental Empresarial
-- Database Initialization Script
-- Version: 1.0
-- ============================================

-- ============================================
-- TABLA: departments
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: roles
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    department_id INTEGER REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_admin_no_dept CHECK (
        (role_id != 1) OR (department_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);

-- ============================================
-- TABLA: folders
-- ============================================
CREATE TABLE IF NOT EXISTS folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    department_id INTEGER NOT NULL REFERENCES departments(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_folder_name_per_parent 
        UNIQUE(name, parent_folder_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_dept ON folders(department_id);
CREATE INDEX IF NOT EXISTS idx_folders_created_by ON folders(created_by);

-- ============================================
-- TABLA: documents
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL UNIQUE,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    extension VARCHAR(10) NOT NULL,
    folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_name ON documents(name);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at);

-- ============================================
-- TABLA: permissions
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    resource_type VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_permission UNIQUE(role_id, resource_type, action)
);

CREATE INDEX IF NOT EXISTS idx_permissions_role ON permissions(role_id);

-- ============================================
-- TABLA: audit_logs
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER NOT NULL,
    resource_name VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);

-- ============================================
-- DATOS INICIALES - ROLES
-- ============================================
INSERT INTO roles (id, name, description) VALUES
    (1, 'Admin', 'Administrador del sistema con acceso total'),
    (2, 'Manager', 'Gerente de área con control sobre su departamento'),
    (3, 'User', 'Usuario estándar con acceso de lectura/escritura limitado')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- DATOS INICIALES - PERMISOS
-- ============================================
INSERT INTO permissions (role_id, resource_type, action) VALUES
    -- Admin: acceso total
    (1, 'folder', 'read'),
    (1, 'folder', 'write'),
    (1, 'folder', 'delete'),
    (1, 'document', 'read'),
    (1, 'document', 'write'),
    (1, 'document', 'delete'),
    (1, 'user', 'read'),
    (1, 'user', 'write'),
    (1, 'user', 'delete'),
    (1, 'department', 'read'),
    (1, 'department', 'write'),
    (1, 'audit', 'read'),
    
    -- Manager: control sobre su departamento
    (2, 'folder', 'read'),
    (2, 'folder', 'write'),
    (2, 'folder', 'delete'),
    (2, 'document', 'read'),
    (2, 'document', 'write'),
    (2, 'document', 'delete'),
    (2, 'department', 'read'),
    (2, 'audit', 'read'),
    
    -- User: solo lectura y escritura
    (3, 'folder', 'read'),
    (3, 'document', 'read'),
    (3, 'document', 'write'),
    (3, 'department', 'read')
ON CONFLICT (role_id, resource_type, action) DO NOTHING;

-- ============================================
-- DEPARTAMENTOS PILOTO
-- ============================================
INSERT INTO departments (name, description) VALUES
    ('Recursos Humanos', 'Gestión de personal y documentación laboral'),
    ('Ventas', 'Documentación comercial y propuestas'),
    ('Contabilidad', 'Documentos financieros y fiscales')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- USUARIO ADMINISTRADOR INICIAL
-- Password: Admin123! (debe cambiarse en producción)
-- Hash generado con bcrypt rounds=12
-- ============================================
INSERT INTO users (email, password_hash, first_name, last_name, role_id, department_id) VALUES
    ('admin@empresa.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', 'Administrador', 'Sistema', 1, NULL)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Database initialized successfully!' AS status;
SELECT 'Roles created: ' || COUNT(*) FROM roles;
SELECT 'Permissions created: ' || COUNT(*) FROM permissions;
SELECT 'Departments created: ' || COUNT(*) FROM departments;
SELECT 'Admin user created: ' || COUNT(*) FROM users WHERE role_id = 1;
