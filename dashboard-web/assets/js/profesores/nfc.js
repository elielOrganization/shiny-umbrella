// profesores/nfc.js

window.activeProfDni = null;

window.prepararAsignacionNFCProf = function(btn) {
    const dni    = btn.getAttribute('data-dni');
    const nombre = btn.getAttribute('data-nombre');

    if (!dni || dni === '' || dni === 'false') {
        alert('Este profesor no tiene DNI asignado en Odoo.');
        return;
    }

    window.activeProfDni = dni;

    const modal      = document.getElementById('modalNfcProfesores');
    const nfcInput   = document.getElementById('nfcInputProfesores');
    const nfcName    = document.getElementById('nfcProfName');
    const imgStatus  = document.getElementById('imgStatusNfcProf');
    const iconWait   = document.getElementById('iconWaitingProf');
    const nfcMsg     = document.getElementById('nfcStatusMsgProfesores');

    if (!modal || !nfcInput) return;

    nfcName.textContent  = nombre;
    nfcInput.value       = '';
    if (iconWait)  { iconWait.style.display = 'block'; }
    if (imgStatus) { imgStatus.style.display = 'none'; imgStatus.classList.remove('spinning-umbrella'); }
    if (nfcMsg)    { nfcMsg.className = ''; nfcMsg.innerHTML = '<small><i class="fa-solid fa-spinner fa-spin"></i> Esperando señal...</small>'; }

    modal.classList.add('show');
    setTimeout(() => nfcInput.focus(), 400);
};

window.confirmarDesvincularNFCProf = function(uid, nombre) {
    window._unlinkUidProf = uid;
    const modal  = document.getElementById('unlinkNfcProfModal');
    const nameEl = document.getElementById('unlinkNfcProfNombre');
    if (nameEl) nameEl.textContent = nombre;
    if (modal)  modal.classList.add('show');
};

document.addEventListener('DOMContentLoaded', () => {
    // --- DESVINCULAR NFC PROFESOR ---
    const unlinkModal   = document.getElementById('unlinkNfcProfModal');
    const btnCancelUnlinkProf  = document.getElementById('btnCancelUnlinkProf');
    const btnConfirmUnlinkProf = document.getElementById('btnConfirmUnlinkProf');

    if (btnCancelUnlinkProf) {
        btnCancelUnlinkProf.addEventListener('click', () => {
            unlinkModal.classList.remove('show');
            window._unlinkUidProf = null;
        });
    }

    if (btnConfirmUnlinkProf) {
        btnConfirmUnlinkProf.addEventListener('click', async () => {
            if (!window._unlinkUidProf) return;
            const originalText = btnConfirmUnlinkProf.innerHTML;
            btnConfirmUnlinkProf.disabled = true;
            btnConfirmUnlinkProf.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Desvinculando...';

            try {
                const res = await fetch(GLOBALS.URL_UNLINK_CARD, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: window._unlinkUidProf })
                }).then(r => r.json());

                if (res.error) throw new Error(res.error.message || 'Error al desvincular');
                unlinkModal.classList.remove('show');
                if (typeof window.fetchProfesores === 'function') window.fetchProfesores();
            } catch (err) {
                alert('Error al desvincular: ' + err.message);
            } finally {
                btnConfirmUnlinkProf.disabled = false;
                btnConfirmUnlinkProf.innerHTML = originalText;
                window._unlinkUidProf = null;
            }
        });
    }

    const nfcInput  = document.getElementById('nfcInputProfesores');
    const nfcMsg    = document.getElementById('nfcStatusMsgProfesores');
    const imgStatus = document.getElementById('imgStatusNfcProf');
    const iconWait  = document.getElementById('iconWaitingProf');

    if (!nfcInput) return;

    const modalBox = document.querySelector('#modalNfcProfesores .modal-box-vincular');
    const setColor = c => { if (modalBox) modalBox.style.borderTopColor = c; };

    nfcInput.addEventListener('keydown', async (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();

        const uid = nfcInput.value.trim();
        const dni = window.activeProfDni;
        if (!uid || !dni) return;

        iconWait.style.display  = 'none';
        imgStatus.src           = '../assets/img/logo_umbrella.png';
        imgStatus.style.display = 'block';
        imgStatus.classList.add('spinning-umbrella');
        nfcMsg.className        = '';
        nfcMsg.innerHTML        = 'Consultando con Odoo...';
        setColor('#3b82f6');

        try {
            const res = await fetch(GLOBALS.URL_ASSIGN_CARD, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ uid, dni })
            }).then(r => r.json());

            if (res.status === 'error') throw new Error(res.message || 'Error al vincular');

            imgStatus.classList.remove('spinning-umbrella');
            imgStatus.src    = '../assets/img/logo_umbrella_success.png';
            nfcMsg.className = 'msg-success';
            nfcMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${res.message || 'Vinculado con éxito'}`;
            setColor('#10b981');

            setTimeout(() => {
                document.getElementById('modalNfcProfesores').classList.remove('show');
                if (typeof window.fetchProfesores === 'function') window.fetchProfesores();
            }, 2000);

        } catch (err) {
            imgStatus.classList.remove('spinning-umbrella');
            imgStatus.src    = '../assets/img/logo_umbrella_error.png';
            nfcMsg.className = 'msg-error';
            nfcMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${err.message}`;
            setColor('#ef4444');

            setTimeout(() => {
                if (!document.getElementById('modalNfcProfesores').classList.contains('show')) return;
                nfcInput.value          = '';
                imgStatus.style.display = 'none';
                iconWait.style.display  = 'block';
                nfcMsg.className        = '';
                nfcMsg.innerHTML        = '<small><i class="fa-solid fa-spinner fa-spin"></i> Esperando señal...</small>';
                setColor('#3b82f6');
                nfcInput.focus();
            }, 4000);
        }
    });
});
