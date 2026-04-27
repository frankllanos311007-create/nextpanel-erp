// ============================================================
// supabaseClient.js — Servicio de conexión a Supabase
// Usa la service_role key para operaciones privilegiadas del backend
// ============================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validar que las variables de entorno estén definidas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('[Supabase] ERROR: Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en el archivo .env');
    process.exit(1);
}

// Crear cliente con service_role (bypasa RLS — solo para backend)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

module.exports = supabase;
