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
            apiFetch(GLOBALS.URL_IMPORT_ALUMNO_CSV, {
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

                    // Odoo envuelve en JSON-RPC: { result: { status, message } }
                    // o devuelve error a nivel de protocolo: { error: { ... } }
                    const res = data.result ?? data;

                    if (data.error) {
                        throw new Error(data.error?.data?.message || data.error?.message || 'Error de Odoo');
                    }
                    if (res.status === 'error') {
                        const err = new Error(res.message || 'Error al importar');
                        err.rechazados = res.rechazados || [];
                        throw err;
                    }

                    // Éxito
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
                        if (typeof fetchAlumnos === 'function') fetchAlumnos();
                    }, 3000);
                })
                .catch(error => {
                    statusLogo.classList.remove('spinning');
                    statusLogo.src = GLOBALS.IMG_ERROR;
                    statusText.textContent = error.message;
                    statusText.classList.add('error');

                    const oldSummary = processingArea.querySelector('.import-summary');
                    if (oldSummary) oldSummary.remove();

                    if (error.rechazados?.length) {
                        const summaryDiv = document.createElement('div');
                        summaryDiv.className = 'import-summary';
                        summaryDiv.innerHTML = '<ul class="summary-list">' +
                            error.rechazados.map(r =>
                                `<li><span>${r.nombre} ${r.apellido}</span><strong style="color:#ef4444">${r.razon}</strong></li>`
                            ).join('') +
                            '</ul>';
                        processingArea.appendChild(summaryDiv);
                    }

                    setTimeout(() => resetCsvModal(), error.rechazados?.length ? 8000 : 4000);
                });
        };

        reader.onerror = () => {
            statusLogo.classList.remove('spinning');
            statusText.textContent = "Error al leer el archivo local.";
        };
    }

    // --- 4. LÓGICA DE ENVÍO MANUAL ---

    const DNI_REGEX = /^\d{8}[A-Z]$/;

    function setFieldError(field, msg) {
        field.classList.add('input-invalid');
        let err = field.parentElement.querySelector('.field-error');
        if (!err) {
            err = document.createElement('span');
            err.className = 'field-error';
            field.after(err);
        }
        err.textContent = msg;
    }

    function clearFieldError(field) {
        field.classList.remove('input-invalid');
        const err = field.parentElement.querySelector('.field-error');
        if (err) err.remove();
    }

    function clearAllErrors(form) {
        form.querySelectorAll('.input-invalid').forEach(f => f.classList.remove('input-invalid'));
        form.querySelectorAll('.field-error').forEach(e => e.remove());
    }

    if (formManual) {
        // Auto-mayúsculas en el campo DNI
        const dniInputAlumno = formManual.querySelector('[name="dni"]');
        if (dniInputAlumno) {
            dniInputAlumno.addEventListener('input', () => {
                const pos = dniInputAlumno.selectionStart;
                dniInputAlumno.value = dniInputAlumno.value.toUpperCase();
                dniInputAlumno.setSelectionRange(pos, pos);
            });
        }

        // Limpiar el error de cada campo en cuanto el usuario lo edita
        formManual.querySelectorAll('input, select').forEach(field => {
            field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => clearFieldError(field));
        });

        formManual.addEventListener('submit', function (e) {
            e.preventDefault();
            clearAllErrors(this);

            const nombreField   = this.querySelector('[name="nombre"]');
            const apellidosField = this.querySelector('[name="apellidos"]');
            const dniField      = this.querySelector('[name="dni"]');
            const fechaField    = this.querySelector('[name="fecha_nacimiento"]');
            const claseField    = this.querySelector('[name="clase"]');
            const seccionField  = this.querySelector('[name="seccion"]');

            const nombre    = nombreField.value.trim();
            const apellidos = apellidosField.value.trim();
            const dni       = dniField.value.trim().toUpperCase();
            const fecha     = fechaField.value;
            const clase     = claseField.value;
            const seccion   = seccionField.value;

            let hayErrores = false;

            if (!nombre)                { setFieldError(nombreField,    'El nombre es obligatorio.');                        hayErrores = true; }
            if (!apellidos)             { setFieldError(apellidosField, 'Los apellidos son obligatorios.');                  hayErrores = true; }
            if (!DNI_REGEX.test(dni))   { setFieldError(dniField,       'Formato inválido. Ej: 12345678Z');                 hayErrores = true; }
            if (!fecha)                 { setFieldError(fechaField,     'La fecha de nacimiento es obligatoria.');           hayErrores = true; }
            if (!clase)                 { setFieldError(claseField,     'Selecciona un curso.');                             hayErrores = true; }
            if (!seccion)               { setFieldError(seccionField,   'Selecciona una sección.');                         hayErrores = true; }

            if (hayErrores) return;

            const datosAEnviar = {
                nombre,
                apellidos,
                dni,
                fecha_nacimiento: fecha,
                grupo_clase: `${clase} ${seccion}`
            };

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

            apiFetch(GLOBALS.URL_IMPORT_ALUMNO_MANUAL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosAEnviar)
            })
                .then(response => response.json())
                .then(data => {
                    const res = data.result || data;
                    if (res.status === 'ok' || res.status === 'success' || res.id) {
                        manualModal.classList.remove('show');
                        formManual.reset();
                        if (typeof fetchAlumnos === 'function') fetchAlumnos();
                    } else {
                        throw new Error(res.message || 'Error al crear el registro');
                    }
                })
                .catch(error => {
                    setFieldError(dniField, error.message || 'Error inesperado');
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