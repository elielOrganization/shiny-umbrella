// nfc.js
document.addEventListener('DOMContentLoaded', () => {
    let lastScannedCode = "";      
    let currentStudentDni = "";    

    const nfcModal = document.getElementById('nfcModal');
    const nfcInput = document.getElementById('nfcInput');
    const nfcContent = document.getElementById('nfcContent');
    const nfcProcessing = document.getElementById('nfcProcessing');
    const nfcStatusLogo = document.getElementById('nfcStatusLogo');
    const nfcStatusText = document.getElementById('nfcStatusText');
    const overwriteModal = document.getElementById('nfcOverwriteModal');
    const oldScanValueSpan = document.getElementById('oldScanValue');
    const newScanValueSpan = document.getElementById('newScanValue');

    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn-vincular')) {
            currentStudentDni = e.target.getAttribute('data-dni'); 
            if (!currentStudentDni) return alert("Error: Este botón no tiene un DNI asignado.");
            resetNfcModal();
            nfcModal.classList.add('show');
            setTimeout(() => nfcInput.focus(), 200);
        }
    });

    if (nfcInput) {
        nfcInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const formattedValue = nfcInput.value.trim().replace(/[^a-zA-Z0-9]/g, '');

                if (!formattedValue) {
                    nfcInput.style.borderColor = "var(--danger-red)";
                    shakeModal(nfcModal.querySelector('.modal-card'));
                    nfcInput.value = ""; 
                    return;
                }

                if (lastScannedCode !== "" && lastScannedCode !== formattedValue) {
                    if(oldScanValueSpan) oldScanValueSpan.textContent = lastScannedCode;
                    if(newScanValueSpan) newScanValueSpan.textContent = formattedValue;
                    if(overwriteModal) overwriteModal.classList.add('show');
                } else {
                    confirmLocalScan(formattedValue);
                }
            }
        });
        nfcInput.addEventListener('focus', () => nfcInput.select());
    }

    document.getElementById('btnConfirmOverwrite')?.addEventListener('click', () => {
        confirmLocalScan(newScanValueSpan.textContent);
        overwriteModal.classList.remove('show');
        nfcInput.focus();
    });

    document.getElementById('btnCancelOverwrite')?.addEventListener('click', () => {
        overwriteModal.classList.remove('show');
        nfcInput.value = lastScannedCode;
        nfcInput.focus();
    });

    function confirmLocalScan(val) {
        if(!nfcInput) return;
        lastScannedCode = val;
        nfcInput.value = val;
        nfcInput.style.borderColor = "var(--success-green)";
        nfcInput.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
        nfcInput.select(); 
    }

    document.getElementById('btnSaveNfc')?.addEventListener('click', () => {
        if(!nfcInput) return;
        const idValue = nfcInput.value.trim();
        if (idValue === "") {
            nfcInput.style.borderColor = "var(--danger-red)";
            shakeModal(nfcModal.querySelector('.modal-card'));
            return;
        }
        processNfcSave(idValue);
    });

    function processNfcSave(idValue) {
        if(!nfcContent || !nfcProcessing) return;
        
        nfcContent.style.display = 'none';
        nfcProcessing.style.display = 'flex';
        
        if(nfcStatusLogo) { nfcStatusLogo.src = GLOBALS.IMG_LOADING; nfcStatusLogo.classList.add('spinning'); }
        if(nfcStatusText) { nfcStatusText.textContent = "Vinculando tarjeta en Odoo..."; nfcStatusText.className = 'status-text'; }

        fetch(GLOBALS.URL_ASSIGN_CARD, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: idValue, dni: currentStudentDni })
        })
        .then(response => response.json())
        .then(data => {
            if(nfcStatusLogo) nfcStatusLogo.classList.remove('spinning');

            if (data.error) {
                const msg = data.error.data?.message || data.error.message || "Error al asignar.";
                throw new Error(msg);
            }

            if (data.result) {
                if(nfcStatusLogo) nfcStatusLogo.src = GLOBALS.IMG_SUCCESS;
                if(nfcStatusText) { 
                    nfcStatusText.textContent = "¡Tarjeta vinculada!"; 
                    nfcStatusText.classList.add('success'); 
                }

                setTimeout(() => {
                    nfcModal.classList.remove('show');
                    if (typeof fetchAlumnos === 'function') fetchAlumnos();
                    if (typeof fetchProfesores === 'function') fetchProfesores();
                }, 1500);
            }
        })
        .catch(error => {
            if(nfcStatusLogo) { 
                nfcStatusLogo.src = GLOBALS.IMG_ERROR; 
                nfcStatusLogo.classList.remove('spinning');
            }
            if(nfcStatusText) { 
                nfcStatusText.textContent = "Error: " + error.message; 
                nfcStatusText.classList.add('error'); 
            }

            shakeModal(nfcModal.querySelector('.modal-card'));

            setTimeout(() => { 
                nfcProcessing.style.display = 'none'; 
                nfcContent.style.display = 'block'; 
                nfcInput.value = "";
                nfcInput.focus();
            }, 2500);
        });
    }

    function resetNfcModal() {
        if (!nfcContent || !nfcInput) return;
        nfcContent.style.display = 'block';
        if(nfcProcessing) nfcProcessing.style.display = 'none';
        nfcInput.value = '';
        nfcInput.style.borderColor = '#d1d5db';
        nfcInput.style.boxShadow = "none";
        lastScannedCode = "";
    }
});