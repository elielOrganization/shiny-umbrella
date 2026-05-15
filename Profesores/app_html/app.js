// Cambiar SERVER_IP aquí si el servidor cambia de dirección
const SERVER_IP  = "10.102.6.187";
const SERVER_URL = `http://${SERVER_IP}:8069/nfc/registrar_fichaje_profesor`;

// Referencias al DOM
const input       = document.getElementById('nfc-input');
const estadoEl    = document.getElementById('estado');
const resultCard  = document.getElementById('result-card');
const resultTexto = document.getElementById('result-texto');
const resultHora  = document.getElementById('result-hora');
const overlay     = document.getElementById('overlay');
const overlayBox  = document.getElementById('overlay-box');

let buffer       = '';     // acumula los caracteres del lector NFC
let bufferTimer  = null;   // fallback si el lector no envía Enter
let procesando   = false;  // evita procesar dos lecturas a la vez
let overlayTimer = null;   // cierra el overlay tras 4s

// El lector solo escribe en el elemento con foco — se mantiene siempre activo
document.addEventListener('click',   () => input.focus());
document.addEventListener('keydown', () => input.focus());
window.addEventListener('focus',     () => input.focus());
input.focus();

// ── Captura NFC ───────────────────────────────────────────────────────────────
// El lector HID escribe el UID carácter a carácter y pulsa Enter al final

input.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const uid = buffer.trim();
  buffer = '';
  input.value = '';
  clearTimeout(bufferTimer);
  if (uid && !procesando) procesarUID(uid);
});

// Fallback: procesa tras 150ms si el lector no envía Enter
input.addEventListener('input', () => {
  buffer = input.value;
  clearTimeout(bufferTimer);
  bufferTimer = setTimeout(() => {
    const uid = buffer.trim();
    buffer = '';
    input.value = '';
    if (uid && uid.length >= 4 && !procesando) procesarUID(uid);
  }, 150);
});

// ── Normalización del UID ─────────────────────────────────────────────────────
// Algunos lectores emiten el UID en hex, otros en decimal.
// Esta función convierte siempre al mismo formato (decimal, 10 dígitos) que espera Odoo.
function normalizarUID(raw) {
  const limpio = raw.trim().replace(/[\s\-:]/g, '');
  if (/[A-Fa-f]/.test(limpio)) {
    // Hex → invertir bytes (little-endian) y convertir a decimal
    const bytes = (limpio.match(/.{2}/g) || []).reverse();
    let decimal = 0;
    for (const byte of bytes) decimal = decimal * 256 + parseInt(byte, 16);
    return String(decimal).padStart(10, '0');
  }
  return limpio.padStart(10, '0');
}

// ── Petición al servidor ──────────────────────────────────────────────────────
// Envía el UID a Odoo. El servidor decide si es entrada o salida según el
// último fichaje del profesor en el día actual (auto-toggle diario).
// AbortController cancela la petición si tarda más de 3 segundos.
async function procesarUID(uid) {
  uid = normalizarUID(uid);
  procesando = true;
  setEstado('Leyendo...', 'leyendo');

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 3000);

  try {
    const resp = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { uid } }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const json  = await resp.json();
    const datos = json.result ?? json;

    if (datos.status === 'ok') {
      mostrarResultado(datos.persona, datos.movimiento);
    } else {
      mostrarError(datos.message || 'Tarjeta no reconocida');
    }
  } catch (e) {
    clearTimeout(timeoutId);
    mostrarError(e.name === 'AbortError' ? 'Sin respuesta del servidor (3 s)' : 'Error de conexión con el servidor');
  } finally {
    setEstado('Esperando tarjeta...', '');
    input.value = '';
    buffer = '';
    procesando = false;
    input.focus();
  }
}

// ── Overlay ───────────────────────────────────────────────────────────────────

// Rellena el overlay y lo muestra. Devuelve la hora para usarla en la tira inferior.
function mostrarOverlay(tipo, simbolo, titulo, nombre, mostrarLabel) {
  const ahora = new Date();
  overlayBox.className = `overlay-box overlay-${tipo}`;
  document.getElementById('overlay-simbolo').textContent = simbolo;
  document.getElementById('overlay-titulo').textContent  = titulo;
  document.getElementById('overlay-nombre').textContent  = nombre;
  document.getElementById('overlay-hora').textContent    = ahora.toLocaleTimeString('es-ES');
  document.getElementById('overlay-fecha').textContent   = ahora.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' });
  document.getElementById('overlay-label').style.display = mostrarLabel ? '' : 'none';
  abrirOverlay();
  return ahora;
}

function mostrarResultado(persona, movimiento) {
  const esEntrada = movimiento.toLowerCase() === 'entrada';
  const tipo      = esEntrada ? 'entrada' : 'salida';
  const simbolo   = esEntrada ? '✓' : '↑';
  const ahora     = mostrarOverlay(tipo, simbolo, esEntrada ? 'ENTRADA REGISTRADA' : 'SALIDA REGISTRADA', persona, true);
  resultTexto.textContent = `${simbolo} ${movimiento.toUpperCase()}  —  ${persona}`;
  resultTexto.className   = `result-texto ${tipo}`;
  resultHora.textContent  = ahora.toLocaleString('es-ES');
  resultCard.classList.add('visible');
}

function mostrarError(mensaje) {
  mostrarOverlay('error', '✗', 'ACCESO DENEGADO', mensaje, false);
}

// Se cierra solo tras 4s o al tocar la pantalla
function abrirOverlay() {
  overlay.classList.add('visible');
  clearTimeout(overlayTimer);
  overlayTimer = setTimeout(cerrarOverlay, 4000);
}

function cerrarOverlay() {
  overlay.classList.remove('visible');
  clearTimeout(overlayTimer);
  input.focus();
}

function setEstado(texto, clase) {
  estadoEl.textContent = texto;
  estadoEl.className   = 'estado ' + clase;
}
