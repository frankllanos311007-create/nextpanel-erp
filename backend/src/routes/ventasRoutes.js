// ============================================================
// ventasRoutes.js — Rutas de ventas
// ============================================================

const express = require('express');
const router  = express.Router();
const ventas  = require('../controllers/ventasController');

// Historial de ventas
router.get('/',     ventas.listarVentas);

// Detalle de una venta
router.get('/:id',  ventas.obtenerVenta);

// Registrar venta nueva (descuenta stock automáticamente)
router.post('/',    ventas.registrarVenta);

module.exports = router;
