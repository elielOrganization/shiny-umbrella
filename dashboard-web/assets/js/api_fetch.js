/**
 * api_fetch.js — Wrapper global sobre fetch().
 *
 * • Añade credentials: 'same-origin' para que la cookie de sesión PHP
 *   se envíe automáticamente en cada petición.
 * • Si el servidor devuelve HTTP 401 (sesión expirada o no iniciada)
 *   muestra un aviso con cuenta atrás y redirige al login.
 *
 * Uso:  apiFetch(url, opciones)  — idéntico a fetch() pero con gestión
 *       401 y notificación de sesión expirada integradas.
 */

// Evita que aparezcan múltiples avisos si varias peticiones fallan a la vez
let _sessionExpiredShown = false;

window.apiFetch = async function (url, options = {}) {
    const opts = {
        credentials: 'same-origin',   // envía la cookie sessionid de PHP
        ...options,
    };

    const response = await fetch(url, opts);

    if (response.status === 401) {
        _mostrarSesionExpirada();
        return new Promise(() => {});  // corta la cadena .then() del llamador
    }

    return response;
};

/* ─────────────────────────────────────────────────────────────────────────
   _mostrarSesionExpirada()
   Muestra un overlay con aviso y cuenta atrás de 5 s antes de redirigir.
   ───────────────────────────────────────────────────────────────────────── */
function _mostrarSesionExpirada() {
    if (_sessionExpiredShown) return;
    _sessionExpiredShown = true;

    const loginUrl = _resolveLoginUrl();

    // ── Overlay de fondo ──
    const overlay = document.createElement('div');
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99999',
        'background:rgba(15,23,42,0.65)', 'backdrop-filter:blur(4px)',
        'display:flex', 'align-items:center', 'justify-content:center',
        'animation:fadeInOverlay .25s ease',
    ].join(';');

    // ── Tarjeta central ──
    const card = document.createElement('div');
    card.style.cssText = [
        'background:#fff', 'border-radius:16px',
        'box-shadow:0 24px 60px rgba(0,0,0,.35)',
        'padding:36px 40px', 'max-width:380px', 'width:90%',
        'text-align:center', 'border-top:5px solid #ef4444',
        'animation:slideUpCard .3s ease',
    ].join(';');

    // ── Icono ──
    const icon = document.createElement('div');
    icon.style.cssText = 'font-size:2.8rem;margin-bottom:12px;';
    icon.textContent = '⏱️';

    // ── Título ──
    const title = document.createElement('h3');
    title.style.cssText = 'margin:0 0 8px;font-size:1.25rem;color:#0f172a;';
    title.textContent = 'Sesión expirada';

    // ── Texto ──
    const msg = document.createElement('p');
    msg.style.cssText = 'margin:0 0 24px;color:#64748b;font-size:.95rem;line-height:1.5;';
    msg.textContent = 'Tu sesión ha caducado. Serás redirigido al inicio de sesión en ';

    const countdown = document.createElement('strong');
    countdown.style.color = '#ef4444';
    countdown.textContent = '5';
    msg.appendChild(countdown);

    const msgSuffix = document.createTextNode(' segundos.');
    msg.appendChild(msgSuffix);

    // ── Botón ──
    const btn = document.createElement('button');
    btn.style.cssText = [
        'background:#ef4444', 'color:#fff', 'border:none',
        'border-radius:8px', 'padding:10px 28px',
        'font-size:.95rem', 'font-weight:600', 'cursor:pointer',
        'transition:background .2s',
    ].join(';');
    btn.textContent = 'Ir al login ahora';
    btn.onmouseenter = () => { btn.style.background = '#dc2626'; };
    btn.onmouseleave = () => { btn.style.background = '#ef4444'; };
    btn.onclick = () => { window.location.href = loginUrl; };

    // ── Animaciones CSS (inyectadas una sola vez) ──
    if (!document.getElementById('_session-expired-styles')) {
        const style = document.createElement('style');
        style.id = '_session-expired-styles';
        style.textContent = `
            @keyframes fadeInOverlay { from { opacity:0 } to { opacity:1 } }
            @keyframes slideUpCard   { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        `;
        document.head.appendChild(style);
    }

    // ── Montar ──
    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(msg);
    card.appendChild(btn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // ── Cuenta atrás ──
    let secs = 5;
    const timer = setInterval(() => {
        secs--;
        countdown.textContent = secs;
        if (secs <= 0) {
            clearInterval(timer);
            window.location.href = loginUrl;
        }
    }, 1000);
}

/** Calcula la ruta relativa a index.php según la profundidad actual */
function _resolveLoginUrl() {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    // dashboard-web/views/*.php  → depth ≥ 2 → ../index.php
    // dashboard-web/*.php        → depth = 1  → index.php
    return depth >= 2 ? '../index.php' : 'index.php';
}
