// modales_global.js — Controlador de modales reutilizables
// Expone window.Modales con tres componentes: Eliminar, Desvincular, VincularNfc

window.Modales = (function () {

    /* ─────────────────────────────────────────
       HELPERS
    ───────────────────────────────────────── */
    function el(id) { return document.getElementById(id); }

    function cerrarSi(modal, fn) {
        modal?.addEventListener('click', e => { if (e.target === modal) fn(); });
    }

    /* ─────────────────────────────────────────
       COMPONENTE: ELIMINAR
    ───────────────────────────────────────── */
    let _onConfirmDelete = null;

    function abrirEliminar({ titulo = '¿Estás seguro?', cuerpo, btnTexto = 'Eliminar', onConfirm }) {
        el('modalEliminar-titulo').textContent    = titulo;
        el('modalEliminar-cuerpo').innerHTML      = cuerpo;
        el('btnConfirmEliminar').textContent      = btnTexto;
        _onConfirmDelete = onConfirm;
        el('modalEliminar').classList.add('show');
    }

    function cerrarEliminar() {
        el('modalEliminar').classList.remove('show');
        _onConfirmDelete = null;
    }

    /* ─────────────────────────────────────────
       COMPONENTE: DESVINCULAR
    ───────────────────────────────────────── */
    let _onConfirmUnlink = null;

    function abrirDesvincular({ cuerpo, onConfirm }) {
        el('modalDesvincular-cuerpo').innerHTML = cuerpo;
        _onConfirmUnlink = onConfirm;
        el('modalDesvincular').classList.add('show');
    }

    function cerrarDesvincular() {
        el('modalDesvincular').classList.remove('show');
        _onConfirmUnlink = null;
    }

    /* ─────────────────────────────────────────
       COMPONENTE: VINCULAR NFC
    ───────────────────────────────────────── */
    let _onAssign  = null;
    let _onSuccess = null;

    function _resetVincularNfc() {
        const iconWait  = el('iconWaitingGlobal');
        const imgStatus = el('imgStatusNfcGlobal');
        const nfcMsg    = el('nfcStatusMsgGlobal');
        const modalBox  = document.querySelector('#modalVincularNfc .modal-box-custom');

        el('nfcInputGlobal').value = '';
        if (iconWait)  iconWait.style.display  = 'block';
        if (imgStatus) { imgStatus.style.display = 'none'; imgStatus.classList.remove('spinning-umbrella'); }
        if (nfcMsg)    { nfcMsg.className = ''; nfcMsg.innerHTML = '<small><i class="fa-solid fa-spinner fa-spin"></i> Esperando señal...</small>'; }
        if (modalBox)  modalBox.style.borderTopColor = '#3b82f6';
    }

    function abrirVincularNfc({ nombre, tipoLabel, onAssign, onSuccess }) {
        _onAssign  = onAssign;
        _onSuccess = onSuccess;

        el('modalVincularNfc-tipo-label').textContent = tipoLabel + ':';
        el('modalVincularNfc-nombre').textContent     = nombre;
        _resetVincularNfc();

        el('modalVincularNfc').classList.add('show');
        setTimeout(() => el('nfcInputGlobal').focus(), 400);
    }

    function cerrarVincularNfc() {
        el('modalVincularNfc').classList.remove('show');
        // Devolver el foco al body para que nfc_global.js pueda capturar el escáner
        el('nfcInputGlobal')?.blur();
        document.body.focus();
        _onAssign  = null;
        _onSuccess = null;
    }

    /* ─────────────────────────────────────────
       INIT — event listeners
    ───────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {

        // ── ELIMINAR ──
        el('btnCancelEliminar').onclick = cerrarEliminar;
        cerrarSi(el('modalEliminar'), cerrarEliminar);

        el('btnConfirmEliminar').onclick = async function () {
            if (!_onConfirmDelete) return;
            this.disabled = true;
            const orig = this.textContent;
            this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
            try   { await _onConfirmDelete(); }
            catch (err) { alert(err.message || 'Error al procesar'); }
            finally { this.disabled = false; this.textContent = orig; }
        };

        // ── DESVINCULAR ──
        el('btnCancelDesvincular').onclick = cerrarDesvincular;
        cerrarSi(el('modalDesvincular'), cerrarDesvincular);

        el('btnConfirmDesvincular').onclick = async function () {
            if (!_onConfirmUnlink) return;
            this.disabled = true;
            const orig = this.textContent;
            this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Desvinculando...';
            try   { await _onConfirmUnlink(); }
            catch (err) { alert(err.message || 'Error al desvincular'); }
            finally { this.disabled = false; this.textContent = orig; }
        };

        // ── VINCULAR NFC — cerrar ──
        el('btnCerrarVincularNfc').onclick = cerrarVincularNfc;
        cerrarSi(el('modalVincularNfc'), cerrarVincularNfc);

        // ── VINCULAR NFC — escáner ──
        const nfcInput = el('nfcInputGlobal');
        if (nfcInput) {
            nfcInput.addEventListener('keydown', async (e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();

                const uid      = nfcInput.value.trim();
                const iconWait = el('iconWaitingGlobal');
                const imgStatus = el('imgStatusNfcGlobal');
                const nfcMsg   = el('nfcStatusMsgGlobal');
                const modalBox = document.querySelector('#modalVincularNfc .modal-box-custom');
                const setColor = c => { if (modalBox) modalBox.style.borderTopColor = c; };

                const mostrarError = (icono, msg, color = '#ef4444') => {
                    imgStatus.classList.remove('spinning-umbrella');
                    imgStatus.src         = '../assets/img/logo_umbrella_error.png';
                    imgStatus.style.display = 'block';
                    iconWait.style.display  = 'none';
                    nfcMsg.className      = 'msg-error';
                    nfcMsg.innerHTML      = `<i class="fa-solid ${icono}"></i> ${msg}`;
                    setColor(color);
                };

                if (!uid) {
                    mostrarError('fa-wifi', 'No se detectó ninguna tarjeta. Acércala de nuevo.');
                    setTimeout(() => { _resetVincularNfc(); nfcInput.focus(); }, 3000);
                    return;
                }

                if (uid.length < 4) {
                    mostrarError('fa-wifi', `Lectura incompleta (${uid.length} car.). Acerca la tarjeta más despacio.`);
                    nfcInput.value = '';
                    setTimeout(() => { _resetVincularNfc(); nfcInput.focus(); }, 3000);
                    return;
                }

                if (!_onAssign) {
                    mostrarError('fa-triangle-exclamation', 'No hay ninguna persona seleccionada para vincular.');
                    setTimeout(() => _resetVincularNfc(), 3000);
                    return;
                }

                iconWait.style.display  = 'none';
                imgStatus.src           = '../assets/img/logo_umbrella.png';
                imgStatus.style.display = 'block';
                imgStatus.classList.add('spinning-umbrella');
                nfcMsg.className = '';
                nfcMsg.innerHTML = `<small>Vinculando <code style="font-size:0.85em;">${uid}</code>...</small>`;
                setColor('#3b82f6');

                try {
                    const res = await _onAssign(uid);

                    // Errores devueltos por Odoo con status explícito
                    if (res.status === 'error' || res.error) {
                        const msg = res.message || res.error?.message || 'Odoo rechazó la operación';

                        // Tarjeta ya vinculada a otra persona
                        if (msg.toLowerCase().includes('ya') || msg.toLowerCase().includes('exist')) {
                            mostrarError('fa-link', msg, '#f59e0b');
                        }
                        // Persona no encontrada
                        else if (msg.toLowerCase().includes('encontr') || msg.toLowerCase().includes('dni')) {
                            mostrarError('fa-user-xmark', msg);
                        }
                        // Formato inválido del UID
                        else if (msg.toLowerCase().includes('format') || msg.toLowerCase().includes('inválid')) {
                            mostrarError('fa-barcode', msg);
                        }
                        // Error genérico de Odoo
                        else {
                            mostrarError('fa-triangle-exclamation', msg);
                        }

                        setTimeout(() => { _resetVincularNfc(); nfcInput.focus(); }, 4000);
                        return;
                    }

                    imgStatus.classList.remove('spinning-umbrella');
                    imgStatus.src    = '../assets/img/logo_umbrella_success.png';
                    nfcMsg.className = 'msg-success';
                    nfcMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${res.message || 'Vinculado con éxito'}`;
                    setColor('#10b981');

                    setTimeout(() => {
                        const cb = _onSuccess;
                        cerrarVincularNfc();
                        if (cb) cb();
                    }, 2000);

                } catch (err) {
                    // Error de red / servidor caído
                    const esRed = err instanceof TypeError || err.message?.toLowerCase().includes('fetch');
                    if (esRed) {
                        mostrarError('fa-server', 'No se pudo conectar con el servidor. Comprueba la red.');
                    } else {
                        mostrarError('fa-triangle-exclamation', err.message || 'Error inesperado al vincular.');
                    }
                    setTimeout(() => { _resetVincularNfc(); nfcInput.focus(); }, 4000);
                }
            });
        }

        // ── Escape cierra cualquier modal global ──
        document.addEventListener('keydown', e => {
            if (e.key !== 'Escape') return;
            cerrarEliminar();
            cerrarDesvincular();
            cerrarVincularNfc();
        });
    });

    return { abrirEliminar, cerrarEliminar, abrirDesvincular, cerrarDesvincular, abrirVincularNfc, cerrarVincularNfc };
})();
