document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERENCIAS ---
    const csvProfModal    = document.getElementById('csvProfModal');
    const manualProfModal = document.getElementById('manualProfModal');
    const btnAñadirManualProf = document.getElementById('btnAñadirManualProf');

    const dropZoneProf      = document.getElementById('dropZoneProf');
    const fileInputProf     = document.getElementById('fileInputProf');
    const processingAreaProf = document.getElementById('processingAreaProf');
    const statusLogoProf    = document.getElementById('statusLogoProf');
    const statusTextProf    = document.getElementById('statusTextProf');

    // --- 2. GESTIÓN DE MODALES ---

    // Cambiar de modal CSV a Manual
    if (btnAñadirManualProf && manualProfModal && csvProfModal) {
        btnAñadirManualProf.addEventListener('click', (e) => {
            e.preventDefault();
            csvProfModal.classList.remove('show');
            manualProfModal.classList.add('show');
        });
    }

    // --- 3. LÓGICA DE IMPORTACIÓN CSV ---

    if (dropZoneProf && fileInputProf) {
        dropZoneProf.addEventListener('click', () => fileInputProf.click());

        fileInputProf.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleProfCsv(e.target.files[0]);
        });

        // Eventos Drag & Drop
        dropZoneProf.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZoneProf.classList.add('dragover');
        });
        dropZoneProf.addEventListener('dragleave', () => dropZoneProf.classList.remove('dragover'));
        dropZoneProf.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZoneProf.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) handleProfCsv(e.dataTransfer.files[0]);
        });
    }

    function handleProfCsv(file) {
        if (!dropZoneProf || !processingAreaProf) return;

        // Estado visual: Procesando
        dropZoneProf.style.display = 'none';
        processingAreaProf.style.display = 'flex';
        statusLogoProf.src = GLOBALS.IMG_LOADING;
        statusLogoProf.classList.add('spinning');
        statusTextProf.textContent = "Procesando archivo y enviando a Odoo...";
        statusTextProf.className = 'status-text';

        const oldSummary = processingAreaProf.querySelector('.import-summary');
        if (oldSummary) oldSummary.remove();

        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = function (e) {
            const csvContent = e.target.result;
            const lines = csvContent.split('\n');
            let summaryHTML = '<ul class="summary-list">';
            let count = 0;

            // Columnas: nombre(0), apellido(1), dni(2), fecha_nacimiento(3), departamento(4)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const cols = line.split(',');
                    if (cols.length >= 5) {
                        summaryHTML += `<li><span>${cols[0].trim()} ${cols[1].trim()}</span><strong>${cols[4].trim()}</strong></li>`;
                        count++;
                    }
                }
            }
            summaryHTML += '</ul>';

            // Enviar a Odoo vía PHP
            apiFetch(GLOBALS.URL_IMPORT_PROFESOR_CSV, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csv_content: csvContent })
            })
                .then(res => {
                    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    statusLogoProf.classList.remove('spinning');

                    // Odoo envuelve en JSON-RPC: { result: { status, message } }
                    // o devuelve error a nivel de protocolo: { error: { ... } }
                    const result = data.result ?? data;

                    if (data.error) {
                        throw new Error(data.error?.data?.message || data.error?.message || 'Error de Odoo');
                    }
                    if (result.status === 'error') {
                        throw new Error(result.message || 'Error al importar');
                    }

                    // Éxito
                    statusLogoProf.src = GLOBALS.IMG_SUCCESS;
                    statusTextProf.innerHTML = `¡Importado correctamente! (${count} profesores)`;
                    statusTextProf.classList.add('success');

                    const summaryDiv = document.createElement('div');
                    summaryDiv.className = 'import-summary';
                    summaryDiv.innerHTML = summaryHTML;
                    processingAreaProf.appendChild(summaryDiv);

                    setTimeout(() => {
                        csvProfModal.classList.remove('show');
                        resetProfCsvModal();
                        if (typeof fetchProfesores === 'function') fetchProfesores();
                    }, 3000);
                })
                .catch(err => {
                    statusLogoProf.classList.remove('spinning');
                    statusLogoProf.src = GLOBALS.IMG_ERROR;
                    statusTextProf.textContent = 'Error: ' + err.message;
                    statusTextProf.classList.add('error');
                    setTimeout(() => resetProfCsvModal(), 4000);
                });
        };

        reader.onerror = () => {
            statusLogoProf.classList.remove('spinning');
            statusTextProf.textContent = "Error al leer el archivo local.";
        };
    }

    // --- 4. FUNCIONES AUXILIARES ---

    // Expuesta globalmente para que ui_profesores.js pueda llamarla al abrir el modal
    window.resetProfCsvModal = resetProfCsvModal;

    function resetProfCsvModal() {
        if (!dropZoneProf) return;
        dropZoneProf.style.display = 'block';
        if (processingAreaProf) processingAreaProf.style.display = 'none';
        if (fileInputProf) fileInputProf.value = '';
        if (statusTextProf) statusTextProf.className = 'status-text';
        if (statusLogoProf) {
            statusLogoProf.classList.remove('spinning');
            statusLogoProf.src = GLOBALS.IMG_LOADING;
        }
        const oldSummary = document.querySelector('.import-summary');
        if (oldSummary) oldSummary.remove();
    }
});
