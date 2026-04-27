// ============================================================
// ventasController.js - Ventas con Firestore
// Descuenta stock automaticamente usando transacciones
// ============================================================

const { db } = require('../services/firebaseAdmin');

// POST /api/ventas
async function registrarVenta(req, res) {
    const { sesion_id, nota = '', items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Se requiere al menos un producto.' });
    }

    try {
        // Obtener productos en paralelo
        const snapshots = await Promise.all(
            items.map(i => db.collection('productos').doc(i.producto_id).get())
        );

        // Validar stock
        const mapaProductos = {};
        for (let i = 0; i < items.length; i++) {
            const snap = snapshots[i];
            if (!snap.exists) {
                return res.status(400).json({ error: `Producto ${items[i].producto_id} no encontrado.` });
            }
            const p = snap.data();
            if (!p.activo) return res.status(400).json({ error: `Producto "${p.nombre}" no disponible.` });
            if (p.stock < items[i].cantidad) {
                return res.status(400).json({ error: `Stock insuficiente para "${p.nombre}". Disponible: ${p.stock}.` });
            }
            mapaProductos[items[i].producto_id] = { ...p, id: snap.id };
        }

        // Calcular total
        let total = 0;
        const detalles = items.map(item => {
            const p   = mapaProductos[item.producto_id];
            const sub = p.precio * item.cantidad;
            total += sub;
            return { producto_id: item.producto_id, nombre: p.nombre, cantidad: item.cantidad, precio_unitario: p.precio, subtotal: sub };
        });

        // Usar transaccion de Firestore para atomicidad
        const ventaId = await db.runTransaction(async (t) => {
            // 1. Crear venta
            const ventaRef = db.collection('ventas').doc();
            t.set(ventaRef, {
                total,
                sesion_id: sesion_id || null,
                nota,
                created_at: new Date()
            });

            // 2. Crear detalle_ventas
            for (const d of detalles) {
                const detRef = db.collection('detalle_ventas').doc();
                t.set(detRef, { ...d, venta_id: ventaRef.id, created_at: new Date() });
            }

            // 3. Descontar stock
            for (const item of items) {
                const p   = mapaProductos[item.producto_id];
                const ref = db.collection('productos').doc(item.producto_id);
                t.update(ref, { stock: p.stock - item.cantidad });
            }

            return ventaRef.id;
        });

        return res.status(201).json({ ok: true, venta_id: ventaId, total, fecha: new Date().toISOString() });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// GET /api/ventas
async function listarVentas(req, res) {
    try {
        const limite = Math.min(100, parseInt(req.query.limite) || 20);
        const snap   = await db.collection('ventas')
            .orderBy('created_at', 'desc')
            .limit(limite)
            .get();

        const ventas = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            created_at: d.data().created_at?.toDate?.()?.toISOString?.() || null
        }));

        return res.json({ ok: true, ventas });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// GET /api/ventas/:id
async function obtenerVenta(req, res) {
    try {
        const ventaSnap = await db.collection('ventas').doc(req.params.id).get();
        if (!ventaSnap.exists) return res.status(404).json({ error: 'Venta no encontrada.' });

        const venta = { id: ventaSnap.id, ...ventaSnap.data(), created_at: ventaSnap.data().created_at?.toDate?.()?.toISOString?.() };

        // Obtener detalle
        const detSnap = await db.collection('detalle_ventas')
            .where('venta_id', '==', req.params.id)
            .get();

        const items = detSnap.docs.map(d => ({ detalle_id: d.id, ...d.data() }));

        return res.json({ ok: true, venta: { ...venta, items } });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = { registrarVenta, listarVentas, obtenerVenta };
