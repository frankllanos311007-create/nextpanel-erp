// ============================================================
// firebaseAdmin.js - Inicializacion de Firebase Admin SDK
// ============================================================

const admin = require('firebase-admin');
require('dotenv').config();

const credPath = process.env.FIREBASE_CREDENTIALS || './firebase-credentials.json';

if (!admin.apps.length) {
    try {
        const serviceAccount = require(require('path').resolve(__dirname, '../../', credPath));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('[Firebase] Conectado al proyecto:', serviceAccount.project_id);
    } catch (err) {
        console.error('[Firebase] ERROR al cargar credenciales:', err.message);
        console.error('           Asegurate de tener firebase-credentials.json en la carpeta backend/');
        process.exit(1);
    }
}

const db   = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
