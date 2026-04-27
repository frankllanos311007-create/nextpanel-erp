// ============================================================
// crear_admin.js - Crea el usuario admin en Firebase Auth
// Ejecutar UNA SOLA VEZ despues de configurar el .env
// ============================================================

require('dotenv').config();
const { auth } = require('./src/services/firebaseAdmin');

const email    = process.env.ADMIN_EMAIL    || 'admin@nextpanel.com';
const password = process.env.ADMIN_PASSWORD || 'Admin1234!';

async function crearAdmin() {
    console.log('\n Creando usuario administrador en Firebase...');
    console.log(' Email   :', email);
    console.log(' Password:', password);
    console.log('');

    try {
        const user = await auth.createUser({
            email,
            password,
            emailVerified: true,
            displayName:   'Administrador NextPanel'
        });

        console.log(' EXITO! Usuario admin creado:');
        console.log('   UID  :', user.uid);
        console.log('   Email:', user.email);
        console.log('');
        console.log(' Puedes iniciar sesion en NextPanel con:');
        console.log('   Email   :', email);
        console.log('   Password:', password);
        console.log('');

    } catch (err) {
        if (err.code === 'auth/email-already-exists') {
            console.log(' AVISO: El usuario ya existe en Firebase. No se hizo ningun cambio.');
            console.log(' Puedes iniciar sesion con:');
            console.log('   Email   :', email);
            console.log('   Password:', password);
        } else {
            console.error('\n ERROR:', err.message, '\n');
            process.exit(1);
        }
    }
}

crearAdmin();
