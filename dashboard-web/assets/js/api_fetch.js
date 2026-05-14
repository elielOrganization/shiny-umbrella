/**
 * api_fetch.js — Wrapper global sobre fetch().
 *
 * • Añade credentials: 'same-origin' para que la cookie de sesión PHP
 *   se envíe automáticamente en cada petición.
 * • Si el servidor devuelve HTTP 401 (sesión expirada o no iniciada)
 *   redirige al login sin mostrar ningún mensaje de error técnico.
 *
 * Uso:  apiFetch(url, opciones)  — idéntico a fetch() pero devuelve
 *       una Promise<Response> con la gestión 401 integrada.
 */
window.apiFetch = async function (url, options = {}) {
    const opts = {
        credentials: 'same-origin',   // envía la cookie sessionid de PHP
        ...options,
    };

    const response = await fetch(url, opts);

    if (response.status === 401) {
        // Sesión expirada → redirigir al login
        const loginUrl = _resolveLoginUrl();
        window.location.href = loginUrl;
        // Devolver una promesa que nunca resuelve para cortar la cadena
        return new Promise(() => {});
    }

    return response;
};

/** Calcula la ruta relativa a index.php según la profundidad actual */
function _resolveLoginUrl() {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    // dashboard-web/views/*.php  → depth ≥ 2 → ../index.php
    // dashboard-web/*.php        → depth = 1  → index.php
    return depth >= 2 ? '../index.php' : 'index.php';
}
