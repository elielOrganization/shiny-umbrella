const SERVER_IP  = "10.102.6.212";
const SERVER_URL = `http://${SERVER_IP}:8069/nfc/registrar_fichaje_alumno`;

const input       = document.getElementById('nfc-input');
const nfcCard     = document.getElementById('nfc-card');
const estadoEl    = document.getElementById('estado');
const resultCard  = document.getElementById('result-card');
const resultTexto = document.getElementById('result-texto');
const resultHora  = document.getElementById('result-hora');
const overlay     = document.getElementById('overlay');
const overlayBox  = document.getElementById('overlay-box');
const btnEntrada  = document.getElementById('btn-entrada');
const btnSalida   = document.getElementById('btn-salida');

let modoActual   = null;
let buffer       = '';
let bufferTimer  = null;
let procesando   = false;
let overlayTimer = null;

btnEntrada.addEventListener('click', () => seleccionarModo('entrada'));
btnSalida.addEventListener('click',  () => seleccionarModo('salida'));

function seleccionarModo(modo) {
  modoActual = modo;
  btnEntrada.classList.toggle('activo',   modo === 'entrada');
  btnEntrada.classList.toggle('inactivo', modo === 'salida');
  btnSalida.classList.toggle('activo',    modo === 'salida');
  btnSalida.classList.toggle('inactivo',  modo === 'entrada');
  nfcCard.classList.add('visible');
  nfcCard.classList.toggle('modo-entrada', modo === 'entrada');
  nfcCard.classList.toggle('modo-salida',  modo === 'salida');
  setEstado('Esperando tarjeta...', '');
  input.focus();
}

function cancelarModo() {
  modoActual = null;
  btnEntrada.classList.remove('activo', 'inactivo');
  btnSalida.classList.remove('activo', 'inactivo');
  nfcCard.classList.remove('visible', 'modo-entrada', 'modo-salida');
  buffer = '';
  input.value = '';
}

document.getElementById('btn-cancelar').addEventListener('click', cancelarModo);

document.addEventListener('click', () => { if (modoActual) input.focus(); });
window.addEventListener('focus',   () => { if (modoActual) input.focus(); });

input.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const uid = buffer.trim();
  buffer = '';
  input.value = '';
  clearTimeout(bufferTimer);
  if (uid && modoActual && !procesando) procesarUID(uid);
});

input.addEventListener('input', () => {
  if (!modoActual) { input.value = ''; buffer = ''; return; }
  buffer = input.value;
  clearTimeout(bufferTimer);
  bufferTimer = setTimeout(() => {
    const uid = buffer.trim();
    buffer = '';
    input.value = '';
    if (uid && uid.length >= 4 && modoActual && !procesando) procesarUID(uid);
  }, 150);
});

function normalizarUID(raw) {
  const limpio = raw.trim().replace(/[\s\-:]/g, '');
  if (/[A-Fa-f]/.test(limpio)) {
    const bytes = (limpio.match(/.{2}/g) || []).reverse();
    let decimal = 0;
    for (const byte of bytes) decimal = decimal * 256 + parseInt(byte, 16);
    return String(decimal).padStart(10, '0');
  }
  return limpio.padStart(10, '0');
}

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
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { uid, tipo: modoActual } }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const json  = await resp.json();
    const datos = json.result ?? json;

    if (datos.status === 'ok') {
      mostrarResultado(datos.persona, datos.movimiento);
    } else if (datos.status === 'denegado') {
      mostrarError(datos.message || 'Sin autorización para esta operación');
    } else {
      mostrarError(datos.message || 'Tarjeta no reconocida');
    }
  } catch (e) {
    clearTimeout(timeoutId);
    mostrarError(e.name === 'AbortError' ? 'Sin respuesta del servidor' : 'Error de conexión con el servidor');
  } finally {
    setEstado('Esperando tarjeta...', '');
    input.value = '';
    buffer = '';
    procesando = false;
    if (modoActual) input.focus();
  }
}

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
  mostrarOverlay('error', '✗', 'OPERACIÓN DENEGADA', mensaje, false);
}

function abrirOverlay() {
  overlay.classList.add('visible');
  clearTimeout(overlayTimer);
  overlayTimer = setTimeout(cerrarOverlay, 4000);
}

function cerrarOverlay() {
  overlay.classList.remove('visible');
  clearTimeout(overlayTimer);
  cancelarModo();
}

function setEstado(texto, clase) {
  estadoEl.textContent = texto;
  estadoEl.className   = 'estado ' + clase;
}
