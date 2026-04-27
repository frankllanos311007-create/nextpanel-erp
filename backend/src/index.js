// ============================================================
// index.js — Punto de entrada del servidor Express
// NextPanel Backend API
// ============================================================

require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const compression = require('compression');

// ---- Importar rutas ----
const authRoutes      = require('./routes/authRoutes');
const productosRoutes = require('./routes/productosRoutes');
const ventasRoutes    = require('./routes/ventasRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app  = express();
const PORT = process.env.PORT || 3001;

// ---- Middlewares globales ----
app.use(compression());
app.use(cors({
    // En producción cambia esto al dominio real de tu frontend
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ---- Rutas de la API ----
app.use('/api/auth',       authRoutes);
app.use('/api/productos',  productosRoutes);
app.use('/api/ventas',     ventasRoutes);
app.use('/api/dashboard',  dashboardRoutes);

// ---- Ruta raíz de salud (health check) ----
app.get('/', (req, res) => {
    res.json({
        sistema: 'NextPanel API',
        version: '1.0.0',
        estado: 'online',
        timestamp: new Date().toISOString()
    });
});

// ---- Manejo global de errores ----
app.use((err, req, res, next) => {
    console.error('[Error Global]', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
});

// ---- Iniciar servidor ----
app.listen(PORT, () => {
    console.log(`✅ NextPanel API corriendo en http://localhost:${PORT}`);
    console.log(`   Rutas disponibles:`);
    console.log(`   - GET  / (health check)`);
    console.log(`   - POST /api/auth/admin-login`);
    console.log(`   - POST /api/auth/validar-codigo`);
    console.log(`   - POST /api/auth/generar-codigo`);
    console.log(`   - GET  /api/productos`);
    console.log(`   - POST /api/productos`);
    console.log(`   - GET  /api/ventas`);
    console.log(`   - POST /api/ventas`);
    console.log(`   - GET  /api/dashboard`);
});
