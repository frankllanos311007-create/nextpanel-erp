// ============================================================
// api.js — Cliente HTTP centralizado para NextPanel
// Todas las peticiones al backend pasan por aquí
// ============================================================

// URL base del backend (relativa para Vercel/Producción)
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api'
    : '/api';

// -------- Helpers --------

/**
 * Petición genérica al backend
 * @param {string} endpoint - ej: '/productos'
 * @param {object} options  - fetch options (method, body, etc.)
 */
async function request(endpoint, options = {}) {
    const token = sessionStorage.getItem('np_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || `Error ${res.status}`);
        }

        return data;
    } catch (err) {
        // Re-throw con mensaje limpio
        throw new Error(err.message || 'Error de conexión con el servidor.');
    }
}

// -------- Auth --------

/** Login del administrador */
async function adminLogin(email, password) {
    return request('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

/** Validar código de vendedor */
async function validarCodigo(codigo) {
    return request('/auth/validar-codigo', {
        method: 'POST',
        body: JSON.stringify({ codigo })
    });
}

/** Generar código temporal */
async function generarCodigo(horas_duracion = 8) {
    return request('/auth/generar-codigo', {
        method: 'POST',
        body: JSON.stringify({ horas_duracion })
    });
}

/** Listar sesiones */
async function listarSesiones() {
    return request('/auth/sesiones');
}

/** Toggle activo/inactivo de una sesión */
async function toggleSesion(id) {
    return request(`/auth/sesiones/${id}/toggle`, { method: 'PATCH' });
}

// -------- Productos --------

/** Listar productos con cache inteligente */
async function listarProductos(soloAlertas = false, forzarRecarga = false) {
    const cacheKey = 'np_cache_productos';
    
    // Si no es alerta y tenemos cache, lo usamos
    if (!soloAlertas && !forzarRecarga) {
        const cache = sessionStorage.getItem(cacheKey);
        if (cache) {
            console.log('[API] Usando cache de productos');
            return JSON.parse(cache);
        }
    }

    const q = soloAlertas ? '?alerta=1' : '';
    const data = await request(`/productos${q}`);

    // Guardar en cache si es la lista completa
    if (!soloAlertas) {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }

    return data;
}

/** Limpiar cache de productos */
function limpiarCacheProductos() {
    sessionStorage.removeItem('np_cache_productos');
}

/** Crear producto */
async function crearProducto(datos) {
    const res = await request('/productos', {
        method: 'POST',
        body: JSON.stringify(datos)
    });
    limpiarCacheProductos();
    return res;
}

/** Editar producto */
async function editarProducto(id, datos) {
    const res = await request(`/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(datos)
    });
    limpiarCacheProductos();
    return res;
}

/** Eliminar producto (lógico) */
async function eliminarProducto(id) {
    const res = await request(`/productos/${id}`, { method: 'DELETE' });
    limpiarCacheProductos();
    return res;
}

// -------- Ventas --------

/** Registrar una venta */
async function registrarVenta(sesion_id, items, nota = '') {
    const res = await request('/ventas', {
        method: 'POST',
        body: JSON.stringify({ sesion_id, items, nota })
    });
    limpiarCacheProductos(); // El stock ha cambiado
    return res;
}

/** Listar historial de ventas */
async function listarVentas(pagina = 1, limite = 20) {
    return request(`/ventas?pagina=${pagina}&limite=${limite}`);
}

/** Detalle de una venta */
async function obtenerVenta(id) {
    return request(`/ventas/${id}`);
}

// -------- Dashboard --------

/** Estadísticas del día */
async function obtenerDashboard() {
    return request('/dashboard');
}

// -------- Exportar --------
window.API = {
    adminLogin,
    validarCodigo,
    generarCodigo,
    listarSesiones,
    toggleSesion,
    listarProductos,
    limpiarCacheProductos,
    crearProducto,
    editarProducto,
    eliminarProducto,
    registrarVenta,
    listarVentas,
    obtenerVenta,
    obtenerDashboard
};
