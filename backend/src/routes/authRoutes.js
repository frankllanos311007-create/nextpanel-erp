// ============================================================
// authRoutes.js — Rutas de autenticación
// ============================================================

const express = require('express');
const router  = express.Router();
const auth    = require('../controllers/authController');

// Login del administrador (email + contraseña)
router.post('/admin-login',    auth.adminLogin);

// Validar código de vendedor
router.post('/validar-codigo', auth.validarCodigo);

// Generar nuevo código temporal (solo admin)
router.post('/generar-codigo', auth.generarCodigo);

// Listar todas las sesiones/códigos
router.get('/sesiones',        auth.listarSesiones);

// Activar / desactivar un código
router.patch('/sesiones/:id/toggle', auth.toggleSesion);

module.exports = router;
