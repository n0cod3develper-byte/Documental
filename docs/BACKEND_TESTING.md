# Backend Testing Guide

## 🧪 Testing the Backend API

### Prerequisites

1. **PostgreSQL Running**: Make sure PostgreSQL is running with the database initialized
2. **Dependencies Installed**: Run `npm install` in the backend directory
3. **Environment Variables**: Copy `.env.example` to `.env` and configure

### Starting the Server

```bash
cd backend
npm run dev
```

Expected output:
```
✓ Database connection established successfully
🚀 Servidor corriendo en puerto 5000
📝 Ambiente: development
🔗 Health check: http://localhost:5000/health
```

---

## 📝 API Endpoints

### Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-01-16T...",
  "environment": "development"
}
```

---

### Authentication

#### 1. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "Admin123!"
  }'
```

Expected response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@empresa.com",
    "first_name": "Administrador",
    "last_name": "Sistema",
    "role_id": 1,
    "department_id": null,
    "is_active": true,
    "role": {
      "id": 1,
      "name": "Admin",
      "description": "Administrador del sistema con acceso total"
    },
    "department": null
  }
}
```

**Save the `accessToken` for subsequent requests!**

#### 2. Get Current User

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3. Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

#### 4. Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### User Management (Admin Only)

#### 1. Get All Users

```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

With pagination and search:
```bash
curl "http://localhost:5000/api/users?page=1&limit=10&search=admin" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 2. Get User by ID

```bash
curl http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3. Create User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@empresa.com",
    "password": "Manager123!",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role_id": 2,
    "department_id": 1
  }'
```

#### 4. Update User

```bash
curl -X PUT http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan Carlos",
    "is_active": true
  }'
```

#### 5. Delete User (Soft Delete)

```bash
curl -X DELETE http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔒 Testing Security Features

### 1. Test Authentication Required

Try accessing protected endpoint without token:
```bash
curl http://localhost:5000/api/users
```

Expected: `401 Unauthorized`

### 2. Test Invalid Token

```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer invalid_token"
```

Expected: `403 Forbidden - Token inválido`

### 3. Test Role-Based Access

Login as a non-admin user and try to access admin endpoint:
```bash
# First create a regular user, then login with that user
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer USER_TOKEN"
```

Expected: `403 Forbidden - Permisos insuficientes`

### 4. Test Rate Limiting

Make more than 100 requests in 15 minutes:
```bash
for i in {1..101}; do
  curl http://localhost:5000/health
done
```

Expected: After 100 requests, you should get rate limit error

---

## 📊 Testing Audit Logs

After performing actions, check the database:

```sql
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

You should see logs for:
- LOGIN
- LOGOUT
- CREATE_USER
- UPDATE_USER
- DELETE_USER

---

## 🐛 Common Issues

### Database Connection Error

```
✗ Unable to connect to database: connection refused
```

**Solution**: Make sure PostgreSQL is running
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Or start it
docker-compose up -d postgres
```

### JWT Secret Not Set

```
Error: JWT_SECRET is not defined
```

**Solution**: Make sure `.env` file exists and has `JWT_SECRET` set

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**: Change port in `.env` or kill the process using port 5000

---

## 📝 Validation Testing

### Test Email Validation

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "test"
  }'
```

Expected: `400 Bad Request - Validación fallida`

### Test Password Length

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@empresa.com",
    "password": "123",
    "first_name": "Test",
    "last_name": "User",
    "role_id": 3,
    "department_id": 1
  }'
```

Expected: `400 Bad Request - password must be at least 8 characters`

---

## ✅ Success Checklist

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Health check endpoint works
- [ ] Login with admin credentials works
- [ ] JWT token is generated
- [ ] Protected endpoints require authentication
- [ ] Role-based access control works
- [ ] User CRUD operations work
- [ ] Validation errors are returned correctly
- [ ] Audit logs are created
- [ ] Rate limiting works

---

## 🔧 Using Postman/Insomnia

For easier testing, import this collection:

1. Create a new request collection
2. Add environment variable for `baseUrl`: `http://localhost:5000`
3. Add environment variable for `token`: (will be set after login)
4. Create requests for each endpoint above

**Pro tip**: Use Postman's "Tests" tab to automatically save the token after login:
```javascript
pm.environment.set("token", pm.response.json().accessToken);
```
