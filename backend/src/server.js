const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// DATABASE CONNECTION
// ============================================
const { testConnection } = require('./config/database');

// Test database connection on startup
// Test database connection and sync models
const initDB = async () => {
    try {
        await testConnection();
        // Sync models with database
        // In production, you might want to use migrations instead of sync
        await require('./config/database').sequelize.sync({ alter: true });
        console.log('✓ Database synced successfully');
    } catch (error) {
        console.error('✗ Database initialization failed:', error);
    }
};

initDB();

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:", process.env.CLIENT_URL || 'http://localhost:3000'],
            frameAncestors: ["'self'", process.env.CLIENT_URL || 'http://localhost:3000']
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.'
});
app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/folders', require('./routes/folder.routes'));
app.use('/api/documents', require('./routes/document.routes'));
app.use('/api/search', require('./routes/search.routes'));
// app.use('/api/search', require('./routes/search.routes'));
// app.use('/api/audit', require('./routes/audit.routes'));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📝 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
