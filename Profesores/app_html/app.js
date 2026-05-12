const SERVER_URL = "http://10.102.6.245:8069/nfc/registrar_fichaje_profesor";

const input      = document.getElementById('nfc-input');
const estadoEl   = document.getElementById('estado');
const resultCard = document.getElementById('result-card');
const resultTexto = document.getElementById('result-texto');
const resultHora  = document.getElementById('result-hora');
const overlay    = document.getElementById('overlay');
const overlayBox = document.getElementById('overlay-box');

let buffer      = '';
let bufferTimer = null;
let procesando  = false;
let overlayTimer = null;

// Mantener el input siempre enfocado para capturar el lector NFC
document.addEventListener('click', () => input.focus());
document.addEventListener('keydown', () => input.focus());
window.addEventListener('focus', () => input.focus());
input.focus();

// Capturar lo que escribe el lector NFC (modo teclado/HID)
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const uid = buffer.trim();
    buffer = '';
    input.value = '';
    clearTimeout(bufferTimer);
    if (uid && !procesando) procesarUID(uid);
  }
});

input.addEventListener('input', () => {
  buffer = input.value;
  clearTimeout(bufferTimer);
  // Fallback: procesar si el lector no envía Enter tras 150ms sin nuevas teclas
  bufferTimer = setTimeout(() => {
    const uid = buffer.trim();
    buffer = '';
    input.value = '';
    if (uid && uid.length >= 4 && !procesando) procesarUID(uid);
  }, 150);
});

async function procesarUID(uid) {
  procesando = true;
  setEstado('Leyendo...', 'leyendo');

  try {
    const resp = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { uid } })
    });

    const json  = await resp.json();
    const datos = json.result ?? json;

    if (datos.status === 'ok') {
      mostrarResultado(datos.persona, datos.movimiento);
    } else {
      mostrarError(datos.message || 'Tarjeta no reconocida');
    }
  } catch (e) {
    mostrarError('Error de conexión con el servidor');
  } finally {
    setEstado('Esperando tarjeta...', '');
    input.value = '';
    buffer = '';
    procesando = false;
    input.focus();
  }
}

function mostrarResultado(persona, movimiento) {
  const esEntrada = movimiento.toLowerCase() === 'entrada';
  const simbolo   = esEntrada ? '✓' : '↑';
  const titulo    = esEntrada ? 'ENTRADA REGISTRADA' : 'SALIDA REGISTRADA';
  const tipo      = esEntrada ? 'entrada' : 'salida';
  const ahora     = new Date();

  overlayBox.className = `overlay-box overlay-${tipo}`;
  document.getElementById('overlay-simbolo').textContent = simbolo;
  document.getElementById('overlay-titulo').textContent  = titulo;
  document.getElementById('overlay-nombre').textContent  = persona;
  document.getElementById('overlay-hora').textContent    = ahora.toLocaleTimeString('es-ES');
  document.getElementById('overlay-fecha').textContent   = ahora.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' });
  document.getElementById('overlay-label').style.display = '';
  abrirOverlay();

  resultTexto.textContent = `${simbolo} ${movimiento.toUpperCase()}  —  ${persona}`;
  resultTexto.className   = `result-texto ${tipo}`;
  resultHora.textContent  = ahora.toLocaleString('es-ES');
  resultCard.classList.add('visible');
}

function mostrarError(mensaje) {
  const ahora = new Date();
  overlayBox.className = 'overlay-box overlay-error';
  document.getElementById('overlay-simbolo').textContent = '✗';
  document.getElementById('overlay-titulo').textContent  = 'ACCESO DENEGADO';
  document.getElementById('overlay-nombre').textContent  = mensaje;
  document.getElementById('overlay-hora').textContent    = ahora.toLocaleTimeString('es-ES');
  document.getElementById('overlay-fecha').textContent   = ahora.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' });
  document.getElementById('overlay-label').style.display = 'none';
  abrirOverlay();
}

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
