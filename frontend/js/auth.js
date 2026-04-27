// ============================================================
// auth.js — Manejo de sesión local
// Guarda y valida la sesión del usuario en sessionStorage
// ============================================================

const SESSION_KEY = 'np_session';

/** Guarda la sesión luego de un login exitoso */
function guardarSesion(datos) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(datos));
    if (datos.access_token) {
        sessionStorage.setItem('np_token', datos.access_token);
    }
}

/** Lee la sesión actual */
function obtenerSesion() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
}

/** Elimina la sesión (cierre de sesión) */
function cerrarSesion() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('np_token');
    window.location.href = '../pages/auth.html';
}

/**
 * Verifica si hay sesión activa.
 * Si no la hay, redirige al login.
 * @param {string[]} roles - roles permitidos en esta página (ej: ['admin'])
 */
function requerirSesion(roles = []) {
    const sesion = obtenerSesion();
    if (!sesion) {
        window.location.href = '../pages/auth.html';
        return null;
    }
    if (roles.length > 0 && !roles.includes(sesion.rol)) {
        alert('No tienes permiso para acceder a esta sección.');
        window.location.href = '../pages/dashboard.html';
        return null;
    }
    return sesion;
}

/** Formatea fecha en español */
function formatearFecha(isoString) {
    if (!isoString) return '-';
    return new Intl.DateTimeFormat('es', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(new Date(isoString));
}

/** Formatea número como moneda */
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(Number(valor));
}

/**
 * Muestra un toast de notificación
 * @param {string} mensaje
 * @param {'success'|'error'|'warning'} tipo
 */
function mostrarToast(mensaje, tipo = 'success') {
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const iconos = { success: '✅', error: '❌', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<span>${iconos[tipo] || 'ℹ️'}</span><span>${mensaje}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Exponer globalmente
window.Auth = {
    guardarSesion,
    obtenerSesion,
    cerrarSesion,
    requerirSesion,
    formatearFecha,
    formatearMoneda,
    mostrarToast
};
