// ============================================================
// productosController.js - CRUD de productos con Firestore
// ============================================================

const { db } = require('../services/firebaseAdmin');
const COL = 'productos';

// Helper: convierte doc de Firestore a objeto plano
function docToObj(doc) {
    const d = doc.data();
    return {
        id: doc.id,
        ...d,
        created_at: d.created_at?.toDate?.()?.toISOString?.() || null,
        stock_bajo: d.stock <= d.stock_minimo
    };
}

// GET /api/productos
async function listarProductos(req, res) {
    try {
        const snap = await db.collection(COL).get();
        let productos = snap.docs.map(docToObj);

        // Filtrar y ordenar en memoria para evitar errores de indice
        productos = productos
            .filter(p => p.activo === true)
            .sort((a, b) => a.nombre.localeCompare(b.nombre));

        // Filtro de alerta
        const resultado = req.query.alerta === '1'
            ? productos.filter(p => p.stock <= p.stock_minimo)
            : productos;

        return res.json({ ok: true, productos: resultado });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// GET /api/productos/:id
async function obtenerProducto(req, res) {
    try {
        const snap = await db.collection(COL).doc(req.params.id).get();
        if (!snap.exists) return res.status(404).json({ error: 'Producto no encontrado.' });
        return res.json({ ok: true, producto: docToObj(snap) });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// POST /api/productos
async function crearProducto(req, res) {
    try {
        const { nombre, precio, stock, stock_minimo = 5 } = req.body;
        if (!nombre || precio === undefined || stock === undefined) {
            return res.status(400).json({ error: 'nombre, precio y stock son requeridos.' });
        }
        const ref = await db.collection(COL).add({
            nombre,
            precio:       Number(precio),
            stock:        Number(stock),
            stock_minimo: Number(stock_minimo),
            activo:       true,
            created_at:   new Date()
        });
        const snap = await ref.get();
        return res.status(201).json({ ok: true, producto: docToObj(snap) });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// PUT /api/productos/:id
async function editarProducto(req, res) {
    try {
        const { nombre, precio, stock, stock_minimo } = req.body;
        const update = {};
        if (nombre       !== undefined) update.nombre       = nombre;
        if (precio       !== undefined) update.precio       = Number(precio);
        if (stock        !== undefined) update.stock        = Number(stock);
        if (stock_minimo !== undefined) update.stock_minimo = Number(stock_minimo);

        await db.collection(COL).doc(req.params.id).update(update);
        const snap = await db.collection(COL).doc(req.params.id).get();
        return res.json({ ok: true, producto: docToObj(snap) });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// DELETE /api/productos/:id  (borrado logico)
async function eliminarProducto(req, res) {
    try {
        await db.collection(COL).doc(req.params.id).update({ activo: false });
        return res.json({ ok: true, mensaje: 'Producto eliminado.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = { listarProductos, obtenerProducto, crearProducto, editarProducto, eliminarProducto };
