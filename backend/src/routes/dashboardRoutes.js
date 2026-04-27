// ============================================================
// dashboardRoutes.js — Rutas del dashboard
// ============================================================

const express    = require('express');
const router     = express.Router();
const dashboard  = require('../controllers/dashboardController');

// Estadísticas del día
router.get('/', dashboard.obtenerEstadisticas);

module.exports = router;
