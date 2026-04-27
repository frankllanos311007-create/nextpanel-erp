// ============================================================
// dashboardController.js - Estadisticas del dia con Firestore
// ============================================================

const { db } = require('../services/firebaseAdmin');

// GET /api/dashboard
async function obtenerEstadisticas(req, res) {
    try {
        const hoy      = new Date();
        const inicio   = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
        const fin      = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

        // 1. Ventas del dia
        const ventasSnap = await db.collection('ventas').get();
        
        const todasVentas = ventasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Filtrar por fecha en memoria
        const ventas = todasVentas.filter(v => {
            const f = v.created_at.toDate();
            return f >= inicio && f <= fin;
        }).sort((a, b) => b.created_at.toDate() - a.created_at.toDate());

        const cantidadVentas = ventas.length;
        const totalDia       = ventas.reduce((acc, v) => acc + Number(v.total), 0);

        // 2. Top productos del dia
        const ventaIds = ventas.map(v => v.id);
        let topProductos = [];

        if (ventaIds.length > 0) {
            // Firestore solo permite 'in' con max 30 valores, dividimos si es necesario
            const chunks = [];
            for (let i = 0; i < ventaIds.length; i += 30) {
                chunks.push(ventaIds.slice(i, i + 30));
            }

            const detalles = [];
            for (const chunk of chunks) {
                const detSnap = await db.collection('detalle_ventas')
                    .where('venta_id', 'in', chunk)
                    .get();
                detSnap.docs.forEach(d => detalles.push(d.data()));
            }

            // Agrupar por producto
            const agrupado = {};
            detalles.forEach(d => {
                if (!agrupado[d.producto_id]) {
                    agrupado[d.producto_id] = { nombre: d.nombre || 'Desconocido', total_vendido: 0 };
                }
                agrupado[d.producto_id].total_vendido += d.cantidad;
            });

            topProductos = Object.entries(agrupado)
                .map(([id, v]) => ({ producto_id: id, ...v }))
                .sort((a, b) => b.total_vendido - a.total_vendido)
                .slice(0, 5);
        }

        // 3. Alertas de stock bajo
        const prodSnap    = await db.collection('productos').where('activo', '==', true).get();
        const alertasStock = prodSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p => p.stock <= p.stock_minimo);

        return res.json({
            ok: true,
            resumen: {
                cantidad_ventas: cantidadVentas,
                total_dia:       totalDia.toFixed(2),
                top_productos:   topProductos,
                alertas_stock:   alertasStock,
                ultima_actualizacion: new Date().toISOString()
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = { obtenerEstadisticas };
