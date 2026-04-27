// ============================================================
// productosRoutes.js — Rutas del inventario de productos
// ============================================================

const express    = require('express');
const router     = express.Router();
const productos  = require('../controllers/productosController');

// Listar todos (GET /api/productos?alerta=1 para stock bajo)
router.get('/',        productos.listarProductos);

// Obtener uno
router.get('/:id',     productos.obtenerProducto);

// Crear nuevo
router.post('/',       productos.crearProducto);

// Editar
router.put('/:id',     productos.editarProducto);

// Eliminar (lógico)
router.delete('/:id',  productos.eliminarProducto);

module.exports = router;
