/**
 * @file eventos_profesores.js
 * @description Escuchadores de eventos que conectan la UI con la API.
 * @author Paragüillas Aceitado
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CARGA INICIAL ---
    window.fetchProfesores = async function() {
        UI_Profesores.toggleLoader(true);
        try {
            const profesores = await API_Profesores.obtenerTodos();
            UI_Profesores.renderizarTabla(profesores);
        } catch (error) {
            console.error(error);
            document.getElementById('tableBodyProf').innerHTML = `<div style="padding:40px; text-align:center; color: red;">Error: ${error.message}</div>`;
        } finally {
            UI_Profesores.toggleLoader(false);
        }
    };

    window.fetchProfesores(); // Ejecutamos al arrancar

    // --- 2. EVENTOS: EDICIÓN ---
    const formEditProf = document.getElementById('formEditProf');
    if (formEditProf) {
        formEditProf.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Actualizando...';
            btn.disabled = true;

            const datos = {
                id: document.getElementById('editProfId').value,
                nombre: document.getElementById('editProfNombre').value.trim(),
                apellidos: document.getElementById('editProfApellidos').value.trim(),
                dni: document.getElementById('editProfDni').value.trim(),
                departamento: document.getElementById('editProfDepartamento').value
            };

            try {
                await API_Profesores.actualizar(datos);
                UI_Profesores.cerrarModalEdicion();
                window.fetchProfesores();
            } catch (err) {
                alert("Error al actualizar: " + err.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // --- 3. EVENTOS: AÑADIR MANUALMENTE ---
    const btnAbrirAñadir = document.getElementById('btnAddProfesor');
    const btnLinkAñadir  = document.getElementById('btnAñadirManualProf');

    if (btnAbrirAñadir) btnAbrirAñadir.addEventListener('click', UI_Profesores.abrirModalCSV);
    if (btnLinkAñadir)  btnLinkAñadir.addEventListener('click', (e) => { e.preventDefault(); UI_Profesores.abrirModalManual(); });

    const DNI_REGEX_PROF = /^\d{8}[A-Z]$/;

    function setProfFieldError(field, msg) {
        field.classList.add('input-invalid');
        let err = field.parentElement.querySelector('.field-error');
        if (!err) {
            err = document.createElement('span');
            err.className = 'field-error';
            field.after(err);
        }
        err.textContent = msg;
    }

    function clearProfFieldError(field) {
        field.classList.remove('input-invalid');
        const err = field.parentElement.querySelector('.field-error');
        if (err) err.remove();
    }

    function clearAllProfErrors(form) {
        form.querySelectorAll('.input-invalid').forEach(f => f.classList.remove('input-invalid'));
        form.querySelectorAll('.field-error').forEach(e => e.remove());
    }

    const formManual = document.getElementById('formManualProf');
    if (formManual) {
        // Auto-mayúsculas en el campo DNI
        const dniInputProf = document.getElementById('manualProfDni');
        if (dniInputProf) {
            dniInputProf.addEventListener('input', () => {
                const pos = dniInputProf.selectionStart;
                dniInputProf.value = dniInputProf.value.toUpperCase();
                dniInputProf.setSelectionRange(pos, pos);
            });
        }

        // Limpiar el error de cada campo en cuanto el usuario lo edita
        formManual.querySelectorAll('input, select').forEach(field => {
            field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => clearProfFieldError(field));
        });

        formManual.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearAllProfErrors(this);

            const nombreField      = document.getElementById('manualProfNombre');
            const apellidosField   = document.getElementById('manualProfApellidos');
            const dniField         = document.getElementById('manualProfDni');
            const departamentoField = document.getElementById('manualProfDepartamento');

            const nombre       = nombreField.value.trim();
            const apellidos    = apellidosField.value.trim();
            const dni          = dniField.value.trim().toUpperCase();
            const departamento = departamentoField.value;

            let hayErrores = false;

            if (!nombre)                    { setProfFieldError(nombreField,      'El nombre es obligatorio.');               hayErrores = true; }
            if (!apellidos)                 { setProfFieldError(apellidosField,   'Los apellidos son obligatorios.');         hayErrores = true; }
            if (!DNI_REGEX_PROF.test(dni))  { setProfFieldError(dniField,         'Formato inválido. Ej: 12345678Z');        hayErrores = true; }
            if (!departamento)              { setProfFieldError(departamentoField, 'Selecciona un departamento.');             hayErrores = true; }

            if (hayErrores) return;

            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
            btn.disabled = true;

            try {
                await API_Profesores.añadirManual({ nombre, apellidos, dni, departamento });
                UI_Profesores.cerrarModalManual();
                window.fetchProfesores();
            } catch (err) {
                alert("Error al añadir: " + err.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // --- 4. EVENTOS: ELIMINAR (gestionado por Modales global) ---

    // --- 5. EVENTOS: SUBIDA DE CSV ---
    const dropZone = document.getElementById('dropZoneProf');
    const fileInput = document.getElementById('fileInputProf');

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) procesarArchivo(e.dataTransfer.files[0]);
        });

        fileInput.addEventListener('change', function() {
            if (this.files.length) procesarArchivo(this.files[0]);
        });
    }

    async function procesarArchivo(archivo) {
        if (!archivo.name.endsWith('.csv')) {
            alert("Por favor, sube un archivo CSV válido.");
            return;
        }

        const csvText = await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload  = e => resolve(e.target.result);
            r.onerror = () => reject(new Error('No se pudo leer el archivo'));
            r.readAsText(archivo);
        });

        const lines = csvText.split('\n');
        let summaryHTML = '<ul class="summary-list">';
        let count = 0;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(',');
            if (cols.length >= 5) {
                summaryHTML += `<li><span>${cols[0].trim()} ${cols[1].trim()}</span><strong>${cols[4].trim()}</strong></li>`;
                count++;
            }
        }
        summaryHTML += '</ul>';

        UI_Profesores.mostrarEstadoCSV({
            mensaje:  'Procesando archivo y enviando a Odoo...',
            spinning: true,
            logoSrc:  GLOBALS.IMG_LOADING
        });

        try {
            await API_Profesores.subirCSV(csvText);

            UI_Profesores.mostrarEstadoCSV({
                mensaje:     `¡Importado correctamente! (${count} profesores)`,
                logoSrc:     GLOBALS.IMG_SUCCESS,
                summaryHTML: summaryHTML
            });

            setTimeout(() => {
                UI_Profesores.cerrarModalCSV();
                UI_Profesores.resetModalCSV();
                window.fetchProfesores();
            }, 3000);

        } catch (err) {
            UI_Profesores.mostrarEstadoCSV({
                mensaje: 'Error: ' + err.message,
                esError: true,
                logoSrc: GLOBALS.IMG_ERROR
            });
            setTimeout(() => UI_Profesores.resetModalCSV(), 4000);
        }
    }

    const tableBody = document.getElementById('tableBodyProf');
    if (tableBody) {
        tableBody.addEventListener('change', async function(e) {
            if (e.target.classList.contains('prof-estado-switch')) {
                const dni = e.target.getAttribute('data-dni');
                const nuevoEstado = e.target.checked;

                e.target.disabled = true;

                try {
                    await API_Profesores.actualizarEstado(dni, nuevoEstado);
                } catch (error) {
                    alert("Error al cambiar el estado: " + error.message);
                    e.target.checked = !nuevoEstado;
                } finally {
                    e.target.disabled = false;
                }
            }
        });
    }

    // --- FILTROS Y BÚSQUEDA ---
    const btnToggleFiltros = document.getElementById('btnFilterToggleProf');
    const panelFiltros     = document.getElementById('filterMenuProf');

    if (btnToggleFiltros && panelFiltros) {
        btnToggleFiltros.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            panelFiltros.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!panelFiltros.contains(e.target) && !btnToggleFiltros.contains(e.target)) {
                panelFiltros.classList.remove('show');
            }
        });
    }

    const btnAplicarFiltros = document.getElementById('btnApplyFiltersProf');
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', () => {
            aplicarFiltrosYBusqueda();
            if (panelFiltros) panelFiltros.classList.remove('show');
        });
    }

    const btnBorrarFiltros = document.getElementById('btnClearFiltersProf');
    if (btnBorrarFiltros) {
        btnBorrarFiltros.addEventListener('click', () => {
            document.querySelectorAll('#filterMenuProf input[type="checkbox"]').forEach(cb => cb.checked = false);
            const buscador = document.getElementById('tableSearchProf');
            if (buscador) buscador.value = '';
            aplicarFiltrosYBusqueda();
            if (panelFiltros) panelFiltros.classList.remove('show');
        });
    }

    const buscadorInput = document.getElementById('tableSearchProf');
    if (buscadorInput) {
        buscadorInput.addEventListener('input', aplicarFiltrosYBusqueda);
    }

    function aplicarFiltrosYBusqueda() {
        const buscador             = document.getElementById('tableSearchProf');
        const textoBusqueda        = (buscador ? buscador.value : '').toLowerCase();
        const depsSeleccionados    = Array.from(document.querySelectorAll('input[name="filter-dep"]:checked')).map(cb => cb.value);
        const estadosSeleccionados = Array.from(document.querySelectorAll('input[name="filter-estado"]:checked')).map(cb => cb.value);
        const nfcSeleccionados     = Array.from(document.querySelectorAll('input[name="filter-nfc"]:checked')).map(cb => cb.value);

        UI_Profesores.aplicarFiltros(textoBusqueda, depsSeleccionados, estadosSeleccionados, nfcSeleccionados);
    }
    });