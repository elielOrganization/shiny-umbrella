// nfc_global.js — Lector NFC global (todas las páginas)

(function () {
    let buffer = '';
    let timer  = null;
    const SCAN_TIMEOUT = 80; // ms entre pulsaciones para considerarlo scanner

    function anyModalOpen() {
        return !!(
            document.querySelector('.modal-overlay.show') ||
            document.querySelector('.modal-overlay-custom.show') ||
            document.querySelector('.modal-nfc[style*="flex"]')
        );
    }

    function openLookupModal(uid) {
        const modal  = document.getElementById('nfcLookupModal');
        const uidEl  = document.getElementById('nfcLookupUid');
        const body   = document.getElementById('nfcLookupBody');

        if (!modal) return;

        // Reset
        uidEl.textContent = uid;
        body.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;color:#6b7280;padding:10px 0;">
                <i class="fa-solid fa-spinner fa-spin"></i> Consultando...
            </div>`;
        modal.classList.add('show');

        const url = typeof NFC_LOOKUP_URL !== 'undefined'
            ? NFC_LOOKUP_URL
            : '../controllers/lookup_nfc.php';

        fetch(url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ uid })
        })
        .then(r => r.json())
        .then(data => {
            const res = data.result || data;

            if (data.error || res.error || res.status === 'error') {
                const msg = data.error?.message || res.error || res.message || 'Tarjeta no encontrada';
                body.innerHTML = `
                    <div class="nfc-lookup-notfound">
                        <i class="fa-solid fa-circle-xmark"></i>
                        <span>${msg}</span>
                    </div>`;
                return;
            }

            const nombre = res.nombre || res.name || '—';
            const tipo   = (res.tipo || res.type || '').toLowerCase();
            const esProf = tipo.includes('profesor') || tipo.includes('teacher') || tipo.includes('prof');

            const badgeClass = esProf ? 'nfc-lookup-badge-prof' : 'nfc-lookup-badge-alum';
            const badgeIcon  = esProf ? 'fa-chalkboard-user' : 'fa-user-graduate';
            const badgeText  = esProf ? 'Profesor' : 'Alumno';

            const initials = nombre.split(' ')
                .slice(0, 2).map(w => w[0] || '').join('').toUpperCase();

            body.innerHTML = `
                <div class="nfc-lookup-person">
                    <div class="nfc-lookup-avatar">${initials}</div>
                    <div class="nfc-lookup-info">
                        <div class="nfc-lookup-name">${nombre}</div>
                        <span class="nfc-lookup-badge ${badgeClass}">
                            <i class="fa-solid ${badgeIcon}"></i> ${badgeText}
                        </span>
                    </div>
                </div>`;
        })
        .catch((err) => {
            console.error('[NFC Global] fetch error:', err, 'URL:', url);
            body.innerHTML = `
                <div class="nfc-lookup-notfound">
                    <i class="fa-solid fa-circle-xmark"></i>
                    <span>Error de conexión con el servidor</span>
                </div>`;
        });
    }

    function processBuffer(uid) {
        uid = uid.trim();
        if (uid.length < 3) return;
        if (anyModalOpen()) return;
        openLookupModal(uid);
    }

    document.addEventListener('keydown', (e) => {
        // Ignorar si el foco está en un campo de texto
        const tag = document.activeElement?.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

        if (e.key === 'Enter') {
            clearTimeout(timer);
            processBuffer(buffer);
            buffer = '';
            return;
        }

        // Solo caracteres imprimibles
        if (e.key.length !== 1) return;

        clearTimeout(timer);
        buffer += e.key;
        timer = setTimeout(() => { buffer = ''; }, SCAN_TIMEOUT * 5);
    });

    // Cerrar modal al hacer clic en el overlay
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
