// nfc_global.js — Lector NFC global (todas las páginas)

(function () {
    let buffer = '';
    let timer  = null;
    const SCAN_TIMEOUT = 80; // ms entre pulsaciones para considerarlo scanner

    function anyModalOpen() {
        // El propio #nfcLookupModal NO bloquea (permite re-escanear con una nueva tarjeta)
        return !!(
            document.querySelector('.modal-overlay.show') ||
            document.querySelector('.modal-overlay-custom.show:not(#nfcLookupModal)') ||
            document.querySelector('.modal-nfc[style*="flex"]')
        );
    }

    function openLookupModal(uid) {
        const modal = document.getElementById('nfcLookupModal');
        const uidEl = document.getElementById('nfcLookupUid');
        const body  = document.getElementById('nfcLookupBody');
        if (!modal) return;

        uidEl.textContent = uid;
        body.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;color:#6b7280;padding:10px 0;">
                <i class="fa-solid fa-spinner fa-spin"></i> Consultando...
            </div>`;
        modal.classList.add('show');

        const url = typeof NFC_LOOKUP_URL !== 'undefined'
            ? NFC_LOOKUP_URL
            : '../controllers/lookup_nfc.php';

        console.log('[NFC Global] Consultando uid:', uid, '→', url);

        apiFetch(url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ uid })
        })
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
            return r.json();
        })
        .then(data => {
            console.log('[NFC Global] Respuesta:', data);

            // Normalizar: Odoo devuelve { jsonrpc, result: {...} } o { error: {...} }
            const res = data.result ?? data;

            const tieneError = data.error
                || res.error
                || res.status === 'error'
                || res.status === 'not_found';

            if (tieneError) {
                const msg = data.error?.message
                    || (typeof res.error === 'string' ? res.error : res.error?.message)
                    || res.message
                    || 'Tarjeta no encontrada en el sistema';
                body.innerHTML = `
                    <div class="nfc-lookup-notfound">
                        <i class="fa-solid fa-circle-xmark"></i>
                        <span>${msg}</span>
                    </div>`;
                return;
            }

            const nombre = res.nombre || res.name || res.display_name || '—';
            const tipo   = (res.tipo || res.type || '').toLowerCase();
            const esProf = tipo.includes('profesor') || tipo.includes('teacher') || tipo.includes('prof');

            const badgeClass = esProf ? 'nfc-lookup-badge-prof' : 'nfc-lookup-badge-alum';
            const badgeIcon  = esProf ? 'fa-chalkboard-user' : 'fa-user-graduate';
            const badgeText  = esProf ? 'Profesor' : 'Alumno';

            const initials = nombre.split(' ')
                .filter(Boolean).slice(0, 2)
                .map(w => w[0]).join('').toUpperCase();

            body.innerHTML = `
                <div class="nfc-lookup-person">
                    <div class="nfc-lookup-avatar">${initials || '?'}</div>
                    <div class="nfc-lookup-info">
                        <div class="nfc-lookup-name">${nombre}</div>
                        <span class="nfc-lookup-badge ${badgeClass}">
                            <i class="fa-solid ${badgeIcon}"></i> ${badgeText}
                        </span>
                    </div>
                </div>`;
        })
        .catch(err => {
            console.error('[NFC Global] Error:', err);
            const esRed = err instanceof TypeError;
            body.innerHTML = `
                <div class="nfc-lookup-notfound">
                    <i class="fa-solid fa-${esRed ? 'server' : 'triangle-exclamation'}"></i>
                    <span>${esRed ? 'No se pudo conectar con el servidor' : err.message}</span>
                </div>`;
        });
    }

    function processBuffer(uid) {
        uid = uid.trim();
        console.log('[NFC Global] Buffer recibido:', JSON.stringify(uid), '| longitud:', uid.length);
        if (uid.length < 3) return;
        if (anyModalOpen()) {
            console.log('[NFC Global] Bloqueado: hay un modal abierto');
            return;
        }
        openLookupModal(uid);
    }

    document.addEventListener('keydown', (e) => {
        // Ignorar si el foco está en un campo de texto (excepto nfcInputGlobal propio del vincular)
        const active = document.activeElement;
        const tag    = active?.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && active?.id !== 'nfcInputGlobal') {
            // Si está en nfcInputGlobal, el modal de vincular ya lo gestiona; ignorar aquí igualmente
            return;
        }
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

        if (e.key === 'Enter') {
            clearTimeout(timer);
            processBuffer(buffer);
            buffer = '';
            return;
        }

        if (e.key.length !== 1) return;

        clearTimeout(timer);
        buffer += e.key;
        timer = setTimeout(() => { buffer = ''; }, SCAN_TIMEOUT * 5);
    });

    // Cerrar modal al hacer clic en el overlay o pulsar Escape
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('nfcLookupModal');
        if (modal && e.target === modal) modal.classList.remove('show');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('nfcLookupModal')?.classList.remove('show');
        }
    });
})();
