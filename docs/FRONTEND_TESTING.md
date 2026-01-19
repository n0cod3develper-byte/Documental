# Frontend Testing Guide

## 🚀 Cómo Iniciar el Frontend

### 1. Asegurarse que el Backend esté corriendo

```bash
# Terminal 1 - Backend
cd c:\laragon\www\Documental\backend
npm run dev
```

### 2. Iniciar el Frontend

```bash
# Terminal 2 - Frontend
cd c:\laragon\www\Documental\frontend
npm start
```

El frontend se abrirá automáticamente en: http://localhost:3000

---

## 🧪 Flujo de Prueba

### 1. Login

1. Abrir http://localhost:3000
2. Deberías ver la página de login
3. Usar credenciales de prueba:
   - **Email**: admin@empresa.com
   - **Password**: Admin123!
4. Click en "Iniciar Sesión"

**Resultado esperado:**
- Redirección al Dashboard
- Toast de bienvenida
- Sidebar visible con navegación

### 2. Dashboard

Una vez logueado, deberías ver:

- **Header** con título "Dashboard"
- **Sidebar** con:
  - Logo "Documental"
  - Navegación (Inicio, Carpetas, Documentos, Búsqueda)
  - Navegación Admin (Departamentos, Usuarios) - solo si eres Admin
  - Info del usuario
  - Botón de logout
- **Contenido principal**:
  - Mensaje de bienvenida
  - Cards de estadísticas (Carpetas, Documentos, Usuarios)
  - Lista de documentos recientes
  - Acciones rápidas
  - Información del sistema

### 3. Navegación

Probar los links del sidebar:

- **Inicio** (/) - Dashboard
- **Carpetas** (/folders) - Placeholder "Próximamente"
- **Documentos** (/documents) - Placeholder "Próximamente"
- **Búsqueda** (/search) - Placeholder "Próximamente"
- **Departamentos** (/departments) - Solo Admin
- **Usuarios** (/users) - Solo Admin

### 4. Logout

1. Click en "Cerrar Sesión" en el sidebar
2. Deberías ver:
   - Toast "Sesión cerrada"
   - Redirección a /login
   - Token eliminado de localStorage

---

## 🔒 Pruebas de Seguridad

### 1. Protección de Rutas

**Sin estar logueado:**
```
1. Intentar acceder a http://localhost:3000/
2. Deberías ser redirigido a /login
```

**Con usuario normal (no Admin):**
```
1. Login con usuario no-admin
2. Intentar acceder a http://localhost:3000/users
3. Deberías ver mensaje "Acceso Denegado"
```

### 2. Token Refresh

El sistema automáticamente renueva el token cuando expira:
- El access token expira en 1 hora
- Si haces una petición después de expirar, se renueva automáticamente
- Si el refresh token también expiró, te redirige a login

---

## 📊 Verificar Integración con Backend

### Dashboard Stats

El dashboard hace las siguientes llamadas al backend:

1. `GET /api/folders` - Obtiene carpetas
2. `GET /api/documents?limit=5` - Obtiene documentos recientes
3. `GET /api/users` - Obtiene usuarios (solo Admin)

**Verificar en DevTools:**
1. Abrir DevTools (F12)
2. Ir a Network tab
3. Recargar dashboard
4. Deberías ver las peticiones con status 200
5. Cada petición debe incluir header `Authorization: Bearer <token>`

---

## 🎨 Verificar Estilos

### Tailwind CSS

Deberías ver:
- Colores primary (azul) en botones y elementos activos
- Sidebar oscuro (bg-gray-900)
- Cards con sombras
- Hover effects en botones y links
- Animaciones (spinner de loading, fade-in)
- Responsive design (prueba redimensionando ventana)

### Iconos Lucide React

Deberías ver iconos en:
- Sidebar (Home, FolderOpen, Search, etc.)
- Login (LogIn)
- Dashboard (FolderOpen, FileText, Users)
- Header (Bell)

---

## 🐛 Problemas Comunes

### Frontend no conecta con Backend

**Error**: "Network Error" o "Failed to fetch"

**Solución**:
1. Verificar que backend esté corriendo en puerto 5000
2. Verificar `REACT_APP_API_URL` en `frontend/.env`
3. Debe ser: `http://localhost:5000/api`

### CORS Error

**Error**: "Access to XMLHttpRequest has been blocked by CORS policy"

**Solución**:
1. Verificar que backend tenga CORS configurado
2. `CLIENT_URL` en backend `.env` debe ser `http://localhost:3000`

### Token no se guarda

**Error**: Después de login, sigue pidiendo login

**Solución**:
1. Abrir DevTools > Application > Local Storage
2. Verificar que existan:
   - `accessToken`
   - `refreshToken`
   - `user`
3. Si no existen, revisar respuesta del backend en Network tab

### Estilos no se aplican

**Error**: La app se ve sin estilos

**Solución**:
1. Verificar que Tailwind esté configurado
2. Ejecutar `npm install` en frontend
3. Verificar que `index.css` tenga las directivas de Tailwind

---

## ✅ Checklist de Verificación

### Funcionalidad
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Dashboard carga datos
- [ ] Navegación funciona
- [ ] Rutas protegidas funcionan
- [ ] Control de acceso por rol funciona
- [ ] Token refresh automático funciona

### UI/UX
- [ ] Sidebar se ve correctamente
- [ ] Header se muestra
- [ ] Cards de stats se ven bien
- [ ] Iconos se muestran
- [ ] Colores Tailwind aplicados
- [ ] Hover effects funcionan
- [ ] Animaciones funcionan

### Integración
- [ ] Peticiones al backend exitosas
- [ ] Headers de autorización incluidos
- [ ] Respuestas parseadas correctamente
- [ ] Errores manejados con toasts
- [ ] Loading states funcionan

---

## 📝 Próximos Pasos

Las siguientes páginas están marcadas como "Próximamente" y necesitan implementación:

1. **Folders Page** - Explorador de carpetas jerárquico
2. **Documents Page** - Lista y subida de documentos
3. **Search Page** - Búsqueda global
4. **Users Page** - Gestión de usuarios (Admin)
5. **Departments Page** - Gestión de departamentos (Admin)

---

## 🔧 Comandos Útiles

```bash
# Iniciar frontend
npm start

# Build para producción
npm run build

# Limpiar cache
rm -rf node_modules package-lock.json
npm install

# Ver errores de compilación
npm start --verbose
```

---

## 📚 Estructura de Archivos Frontend

```
frontend/src/
├── components/
│   ├── Header.js
│   ├── Sidebar.js
│   ├── Layout.js
│   └── ProtectedRoute.js
├── context/
│   └── AuthContext.js
├── pages/
│   ├── LoginPage.js
│   └── DashboardPage.js
├── services/
│   ├── api.js
│   └── authService.js
├── App.js
├── index.js
└── index.css
```
