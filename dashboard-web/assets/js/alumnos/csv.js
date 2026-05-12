// assets/js/csv.js
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERENCIAS A ELEMENTOS DEL DOM ---
    const btnAddStudent = document.getElementById('btnAddStudent');
    const btnManual = document.getElementById('btnAñadirManual');

    const csvModal = document.getElementById('csvModal');
    const manualModal = document.getElementById('manualStudentModal');
    const formManual = document.getElementById('formManualStudent');

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processingArea = document.getElementById('processingArea');
    const statusLogo = document.getElementById('statusLogo');
    const statusText = document.getElementById('statusText');

    // --- 2. GESTIÓN DE MODALES ---

    // Abrir modal principal (CSV)
    if (btnAddStudent && csvModal) {
        btnAddStudent.addEventListener('click', () => {
            resetCsvModal();
            csvModal.classList.add('show');
        });
    }

    // Cambiar de modal CSV a Manual
    if (btnManual && manualModal && csvModal) {
        btnManual.addEventListener('click', (e) => {
            e.preventDefault();
            csvModal.classList.remove('show');
            manualModal.classList.add('show');
        });
    }

    // --- 3. LÓGICA DE IMPORTACIÓN CSV ---

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleCsvFile(e.target.files[0]);
        });

        // Eventos Drag & Drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) handleCsvFile(e.dataTransfer.files[0]);
        });
    }

    function handleCsvFile(file) {
        if (!dropZone || !processingArea) return;

        // Estado visual: Procesando
        dropZone.style.display = 'none';
        processingArea.style.display = 'flex';
        statusLogo.src = GLOBALS.IMG_LOADING;
        statusLogo.classList.add('spinning');
        statusText.textContent = "Procesando archivo y enviando a Odoo...";
        statusText.className = 'status-text';

        const oldSummary = processingArea.querySelector('.import-summary');
        if (oldSummary) oldSummary.remove();

        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = function (e) {
            const csvContent = e.target.result;
            const lines = csvContent.split('\n');
            let summaryHTML = '<ul class="summary-list">';
            let count = 0;

            // Generar vista previa del resumen
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
            fetch(GLOBALS.URL_IMPORT_ALUMNO_CSV, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csv_content: csvContent })
            })
                .then(response => {
                    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    statusLogo.classList.remove('spinning');
                    if (data.result || (data.data && !data.error)) {
                        statusLogo.src = GLOBALS.IMG_SUCCESS;
                        statusText.innerHTML = `¡Importado correctamente! (${count} alumnos)`;
                        statusText.classList.add('success');

                        const summaryDiv = document.createElement('div');
                        summaryDiv.className = 'import-summary';
                        summaryDiv.innerHTML = summaryHTML;
                        processingArea.appendChild(summaryDiv);

                        setTimeout(() => {
                            csvModal.classList.remove('show');
                            resetCsvModal();
                        }, 4000);
                    } else {
                        throw new Error(data.error ? data.error.data.message : "Error desconocido de Odoo");
                    }
                })
                .catch(error => {
                    statusLogo.classList.remove('spinning');
                    statusLogo.src = GLOBALS.IMG_ERROR;
                    statusText.textContent = "Fallo: " + error.message;
                    statusText.classList.add('error');
                    shakeModal(csvModal.querySelector('.modal-card'));
                    setTimeout(() => resetCsvModal(), 4000);
                });
        };

        reader.onerror = () => {
            statusLogo.classList.remove('spinning');
            statusText.textContent = "Error al leer el archivo local.";
        };
    }

    // --- 4. LÓGICA DE ENVÍO MANUAL ---

    if (formManual) {
        formManual.addEventListener('submit', function (e) {
            e.preventDefault();

            // CAPTURA MANUAL: Obtenemos los valores uno a uno para evitar errores de envío
            const datosAEnviar = {
                nombre: this.querySelector('[name="nombre"]').value.trim(),
                apellidos: this.querySelector('[name="apellidos"]').value.trim(),
                dni: this.querySelector('[name="dni"]').value.trim(),
                fecha_nacimiento: this.querySelector('[name="fecha_nacimiento"]').value,
                grupo_clase: `${this.querySelector('[name="clase"]').value} ${this.querySelector('[name="seccion"]').value}`
            };

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

            fetch(GLOBALS.URL_IMPORT_ALUMNO_MANUAL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosAEnviar)
            })
                .then(response => response.json())
                .then(data => {
                    // Odoo suele devolver la respuesta dentro de data.result
                    const res = data.result || data;

                    if (res.status === 'success' || res.id) {
                        alert(`¡Éxito! ${res.message || 'Alumno guardado'}. ID: ${res.id}`);
                        manualModal.classList.remove('show');
                        formManual.reset();
                        if (typeof fetchAlumnos === 'function') fetchAlumnos();
                    } else {
                        // Si el status es 'error' o existe un mensaje de fallo
                        throw new Error(res.message || "Error al crear el registro");
                    }
                })
                .catch(error => {
                    alert("Error: " + error.message);
                    if (typeof shakeModal === 'function') {
                        shakeModal(manualModal.querySelector('.modal-card'));
                    }
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                });
        });
    }

    // --- 5. FUNCIONES AUXILIARES ---

    function resetCsvModal() {
        if (!dropZone) return;
        dropZone.style.display = 'block';
        if (processingArea) processingArea.style.display = 'none';
        if (fileInput) fileInput.value = '';
        if (statusText) statusText.className = 'status-text';
        if (statusLogo) {
            statusLogo.classList.remove('spinning');
            statusLogo.src = GLOBALS.IMG_LOADING;
        }
        const oldSummary = document.querySelector('.import-summary');
        if (oldSummary) oldSummary.remove();
    }
});