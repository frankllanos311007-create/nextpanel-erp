// ============================================================
// authController.js - Autenticacion con Firebase
// ============================================================

const { auth, db } = require('../services/firebaseAdmin');
require('dotenv').config();

// ------------------------------------------------------------------
// POST /api/auth/admin-login
// Verifica email + contrasena del admin contra el .env
// (Firebase Auth no expone verificacion de password en Admin SDK,
//  usamos la comparacion directa del .env para el admin)
// ------------------------------------------------------------------
async function adminLogin(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contrasena son requeridos.' });
    }
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Credenciales invalidas.' });
    }
    return res.json({
        ok: true,
        rol: 'admin',
        user: { email }
    });
}

// ------------------------------------------------------------------
// POST /api/auth/validar-codigo
// Valida el codigo temporal del vendedor en Firestore
// ------------------------------------------------------------------
async function validarCodigo(req, res) {
    const { codigo } = req.body;
    if (!codigo) return res.status(400).json({ error: 'El codigo es requerido.' });

    const snap = await db.collection('sesiones')
        .where('codigo', '==', codigo.toUpperCase())
        .limit(1)
        .get();

    if (snap.empty) return res.status(404).json({ error: 'Codigo no encontrado.' });

    const sesion    = snap.docs[0].data();
    const sesionId  = snap.docs[0].id;

    if (!sesion.activo) return res.status(403).json({ error: 'El codigo ha sido desactivado.' });

    const ahora  = new Date();
    const expira = sesion.expira_en.toDate();
    if (ahora > expira) return res.status(403).json({ error: 'El codigo ha expirado.' });

    return res.json({ ok: true, rol: sesion.rol, sesion_id: sesionId, expira_en: expira.toISOString() });
}

// ------------------------------------------------------------------
// POST /api/auth/generar-codigo
// Genera un nuevo codigo temporal para vendedor
// ------------------------------------------------------------------
async function generarCodigo(req, res) {
    const { horas_duracion = 8 } = req.body;
    const codigo  = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expira  = new Date();
    expira.setHours(expira.getHours() + Number(horas_duracion));

    const ref = await db.collection('sesiones').add({
        codigo,
        rol: 'caja',
        expira_en: expira,
        activo: true,
        creado_por: process.env.ADMIN_EMAIL,
        created_at: new Date()
    });

    return res.json({ ok: true, codigo, expira_en: expira.toISOString(), rol: 'caja', id: ref.id });
}

// ------------------------------------------------------------------
// GET /api/auth/sesiones
// Lista todas las sesiones/codigos
// ------------------------------------------------------------------
async function listarSesiones(req, res) {
    const snap = await db.collection('sesiones').get();

    const sesiones = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        expira_en:  d.data().expira_en?.toDate?.()?.toISOString(),
        created_at: d.data().created_at?.toDate?.()?.toISOString()
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({ ok: true, sesiones });
}

// ------------------------------------------------------------------
// PATCH /api/auth/sesiones/:id/toggle
// Activa o desactiva un codigo
// ------------------------------------------------------------------
async function toggleSesion(req, res) {
    const { id } = req.params;
    const ref     = db.collection('sesiones').doc(id);
    const snap    = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Sesion no encontrada.' });

    const nuevo = !snap.data().activo;
    await ref.update({ activo: nuevo });

    return res.json({ ok: true, activo: nuevo });
}

module.exports = { adminLogin, validarCodigo, generarCodigo, listarSesiones, toggleSesion };
