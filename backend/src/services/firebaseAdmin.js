// ============================================================
// firebaseAdmin.js - Inicializacion de Firebase Admin SDK
// ============================================================

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let serviceAccount;

// 1. Intentar cargar desde variable de entorno (para Vercel/Producción)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (err) {
        console.error('Error al parsear FIREBASE_SERVICE_ACCOUNT:', err.message);
    }
}

// 2. Si no hay variable, intentar cargar desde el archivo local
if (!serviceAccount) {
    const credPath = process.env.FIREBASE_CREDENTIALS || './firebase-credentials.json';
    try {
        serviceAccount = require(path.resolve(__dirname, '../../', credPath));
    } catch (err) {
        console.error('No se pudo encontrar el archivo de credenciales de Firebase en:', credPath);
    }
}

if (!serviceAccount) {
    console.error('CRITICO: No hay credenciales de Firebase configuradas.');
    process.exit(1);
}

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('[Firebase] Conectado al proyecto:', serviceAccount.project_id);
    } catch (err) {
        console.error('[Firebase] ERROR al cargar credenciales:', err.message);
        process.exit(1);
    }
}

const db   = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
