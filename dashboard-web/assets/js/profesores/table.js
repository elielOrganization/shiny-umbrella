document.addEventListener('DOMContentLoaded', () => {
    
    // --- PARTE 1: TABLA Y FETCH ODOO ---
    const tableBody = document.getElementById('tableBodyProf');
    const loader = document.getElementById('tableLoaderProf');
    
    // Ejecutamos la carga al iniciar
    fetchProfesores();

    function fetchProfesores() {
        if (!tableBody || !loader) return;

        fetch(GLOBALS.URL_GET_PROFESORES)
            .then(response => response.json())
            .then(data => {
                const listaProfesores = data.result?.profesores || [];
                loader.style.display = 'none';

                if (listaProfesores.length === 0) {
                    tableBody.innerHTML = `<div style="padding:40px; text-align:center;">No hay profesores registrados o falló la conexión.</div>`;
                    return;
                }

                let html = '';
                listaProfesores.forEach(prof => {
                    const tieneNFC = prof.uid && prof.uid !== "";
                    
                    // Inyectamos la fila con la nueva columna de ACCIONES al final
                    html += `
                    <div class="table-row table-grid-prof" ...>
                        <div class="student-name">${prof.apellido || ''}, ${prof.nombre || ''}</div>

                        <div class="text-gray">${prof.dni || ''}</div>

                        <div class="text-gray">${prof.departamento || ''}</div>

                        <div>
                            ${tieneNFC ? `<span class="nfc-id-tag">${prof.uid}</span>` : `<button class="btn-vincular" data-dni="${prof.dni}">Vincular</button>`}
                        </div>

                        <div class="text-center">
                            <label class="switch">
                                <input type="checkbox" ${prof.estado === true ? 'checked' : ''} class="prof-estado-switch" data-dni="${prof.dni}" data-field="estado">
                                <span class="slider round"></span>
                            </label>
                        </div>

                        <div class="table-actions">
                            <button class="btn-table-action edit" onclick="prepararEdicionProf(${prof.id}, '${prof.nombre}', '${prof.apellido}', '${prof.dni}', '${prof.departamento}')">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn-table-action delete" onclick="confirmarEliminarProf('${prof.dni}', '${prof.nombre} ${prof.apellido}')">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>`;
                });

                tableBody.innerHTML = html;
                
                // Eventos de los switches (se mantienen igual)
                document.querySelectorAll('.prof-estado-switch').forEach(toggle => {
                    toggle.addEventListener('change', (e) => {
                        const row = e.target.closest('.table-row');
                        row.setAttribute('data-estado', e.target.checked ? 'alta' : 'baja');
                    });
                });
            })
            .catch(error => {
                console.error("Error al cargar profesores:", error);
                loader.innerHTML = `<p style="color:red; text-align:center;">Error de conexión con Odoo.</p>`;
            });
    }

    const deleteModal = document.getElementById('deleteConfirmModal');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    const btnCancelDelete = document.getElementById('btnCancelDelete');

    if (btnCancelDelete) {
        btnCancelDelete.addEventListener('click', () => {
            deleteModal.classList.remove('show');
            window.profDniToDelete = null;
        });
    }

    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', () => {
            if (!window.profDniToDelete) return;

            const originalText = btnConfirmDelete.innerHTML;
            btnConfirmDelete.disabled = true;
            btnConfirmDelete.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Eliminando...';

            fetch(GLOBALS.URL_DELETE_PERSONA, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni: window.profDniToDelete })
            })
            .then(res => res.json())
            .then(data => {
                const res = data.result || data;
                if (res.status === 'success' || !data.error) {
                    deleteModal.classList.remove('show');
                    fetchProfesores(); // Recarga la lista tras borrar
                } else {
                    alert("Error: " + (data.error?.message || "No se pudo eliminar"));
                }
            })
            .catch(err => alert("Error de conexión: " + err.message))
            .finally(() => {
                btnConfirmDelete.disabled = false;
                btnConfirmDelete.innerHTML = originalText;
                window.profDniToDelete = null;
            });
        });
    };

    /**
     * Variables y funciones globales necesarias para los eventos onclick del HTML dinámico.
     */
    window.profDniToDelete = null;

    window.confirmarEliminarProf = function(dni, nombre) {
        window.profDniToDelete = dni;
        const modal = document.getElementById('deleteConfirmModal');
        const nameSpan = document.getElementById('deleteProfName');
        
        if (modal) {
            if (nameSpan) nameSpan.textContent = nombre;
            modal.classList.add('show');
        }
    };

    document.addEventListener('change', (e) => {
    // Detectamos si el cambio viene de un switch de estado
    if (e.target.matches('input[data-field="estado"]')) {
        const checkbox = e.target;
        const dni = checkbox.dataset.dni; // El DNI que inyectamos en el HTML
        const valor = checkbox.checked;   // true o false

        const row = checkbox.closest('.table-row');
        if (row) {
            // Bloqueamos la fila visualmente mientras se procesa
            row.style.opacity = '0.6';
            row.style.pointerEvents = 'none';
        }
        

        // Enviamos al controlador genérico
        fetch(GLOBALS.URL_UPDATE_ESTADO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni: dni, valor: valor })
        })
        .then(res => res.json())
        .then(data => {
            row.style.opacity = '1';
            row.style.pointerEvents = 'auto';

            if (data.error) {
                // Si Odoo devuelve error, revertimos el switch y avisamos
                alert("Error de Odoo: " + (data.error.data?.message || "No se pudo actualizar"));
                checkbox.checked = !valor;
            } else {
                // Éxito: Actualizamos el atributo data para que el filtro funcione bien
                row.setAttribute('data-estado', valor ? 'alta' : 'baja');
            }
        })
        .catch(err => {
            row.style.opacity = '1';
            row.style.pointerEvents = 'auto';
            alert("Error de conexión con el servidor");
            checkbox.checked = !valor;
        });
    }
});

    // --- PARTE 2: FILTROS (Intactos) ---
    const btnFilterToggle = document.getElementById('btnFilterToggleProf');
    const filterMenu = document.getElementById('filterMenuProf');
    const btnApplyFilters = document.getElementById('btnApplyFiltersProf');
    const btnClearFilters = document.getElementById('btnClearFiltersProf');

    if (btnFilterToggle && filterMenu) {
        btnFilterToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            filterMenu.classList.toggle('show');
        });

        btnApplyFilters.addEventListener('click', () => {
            applyFilters();
            filterMenu.classList.remove('show');
        });

        btnClearFilters.addEventListener('click', () => {
            document.querySelectorAll('#filterMenuProf input[type="checkbox"]').forEach(cb => cb.checked = false);
            applyFilters();
        });

        function applyFilters() {
            const checkedDeps = Array.from(document.querySelectorAll('input[name="filter-dep"]:checked')).map(cb => cb.value);
            const isAlta = document.querySelector('input[name="filter-estado"][value="alta"]')?.checked;
            const isBaja = document.querySelector('input[name="filter-estado"][value="baja"]')?.checked;
            const conNfc = document.querySelector('input[name="filter-nfc"][value="con"]')?.checked;
            const sinNfc = document.querySelector('input[name="filter-nfc"][value="sin"]')?.checked;

            document.querySelectorAll('#tableBodyProf .table-row').forEach(row => {
                const rowDep = row.getAttribute('data-dep');
                const rowEstado = row.getAttribute('data-estado');
                const rowNfc = row.getAttribute('data-nfc');

                let show = true;

                if (checkedDeps.length > 0 && !checkedDeps.some(d => rowDep.includes(d))) show = false;
                if (isAlta && !isBaja && rowEstado !== 'alta') show = false;
                if (isBaja && !isAlta && rowEstado !== 'baja') show = false;
                if (conNfc && !sinNfc && rowNfc !== 'con') show = false;
                if (sinNfc && !conNfc && rowNfc !== 'sin') show = false;

                row.style.display = show ? 'grid' : 'none';
            });
        }
    }
});

// assets/js/profesores_csv.js
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERENCIAS UNIFICADAS ---
    const btnAddProfesor = document.getElementById('btnAddProfesor');
    const csvProfModal = document.getElementById('csvProfModal');
    const manualProfModal = document.getElementById('manualProfModal');
    const btnAñadirManualProf = document.getElementById('btnAñadirManualProf');
    const formManualProf = document.getElementById('formManualProf');
    
    const dropZoneProf = document.getElementById('dropZoneProf');
    const fileInputProf = document.getElementById('fileInputProf');
    const processingAreaProf = document.getElementById('processingAreaProf');
    const statusLogoProf = document.getElementById('statusLogoProf');
    const statusTextProf = document.getElementById('statusTextProf');

    // --- 2. GESTIÓN DE MODALES ---

    // Abrir Modal CSV (Principal)
    if (btnAddProfesor && csvProfModal) {
        btnAddProfesor.addEventListener('click', () => {
            resetProfCsvModal();
            csvProfModal.classList.add('show');
        });
    }

    // El Salto: De CSV a Manual
    if (btnAñadirManualProf && csvProfModal && manualProfModal) {
        btnAñadirManualProf.addEventListener('click', (e) => {
            e.preventDefault();
            csvProfModal.classList.remove('show');
            manualProfModal.classList.add('show');
        });
    }

    // --- 3. LÓGICA DE ENVÍO MANUAL ---

    if (formManualProf) {
        formManualProf.addEventListener('submit', function(e) {
            e.preventDefault();

            const datos = {
                nombre:       this.querySelector('[name="nombre"]').value.trim(),
                apellidos:    this.querySelector('[name="apellidos"]').value.trim(),
                dni:          this.querySelector('[name="dni"]').value.trim(),
                departamento: this.querySelector('[name="departamento"]').value
            };

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

            fetch(GLOBALS.URL_IMPORT_PROFESOR_MANUAL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            })
            .then(res => res.json())
            .then(data => {
                const res = data.result || data;
                if (res.status === 'success' || res.id) {
                    alert("Profesor guardado correctamente");
                    manualProfModal.classList.remove('show');
                    this.reset();
                    if (typeof fetchProfesores === 'function') fetchProfesores();
                } else {
                    throw new Error(res.message || "Error en Odoo");
                }
            })
            .catch(err => alert("Error: " + err.message))
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
        });
    }

    // --- 4. LÓGICA DE IMPORTACIÓN CSV ---

    if (dropZoneProf && fileInputProf) {
        dropZoneProf.addEventListener('click', () => fileInputProf.click());

        fileInputProf.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleProfCsv(e.target.files[0]);
        });
    }

    function handleProfCsv(file) {
        if(!dropZoneProf || !processingAreaProf) return;

        // UI: Ocultar zona de carga, mostrar zona de procesado
        dropZoneProf.style.display = 'none';
        processingAreaProf.style.display = 'flex';
        
        // SOLUCIÓN AL ERROR DE IMAGEN: Forzamos la carga del logo Umbrella antes de la petición
        statusLogoProf.src = '../src/img/logo_umbrella.png'; 
        statusLogoProf.classList.add('spinning');
        statusTextProf.textContent = "Procesando profesores...";
        statusTextProf.classList.remove('success', 'error');
        
        const oldSummary = processingAreaProf.querySelector('.import-summary');
        if(oldSummary) oldSummary.remove();

        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = function(e) {
            const content = e.target.result;
            const lines = content.split('\n');
            let summaryHTML = '<ul class="summary-list">';
            let count = 0;

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const cols = line.split(',');
                    if (cols.length >= 4) {
                        summaryHTML += `<li><span>${cols[0].trim()} ${cols[1].trim()}</span><strong>${cols[3].trim()}</strong></li>`;
                        count++;
                    }
                }
            }
            summaryHTML += '</ul>';

            fetch(GLOBALS.URL_IMPORT_PROFESOR_CSV, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csv_content: content })
            })
            .then(res => res.json())
            .then(data => {
                statusLogoProf.classList.remove('spinning');
                if (data.result) {
                    statusLogoProf.src = GLOBALS.IMG_SUCCESS || '../src/img/logo_umbrella.png'; // Cambia a éxito si tienes el icono
                    statusTextProf.innerHTML = `¡Importado con éxito! (${count} profesores)`;
                    statusTextProf.classList.add('success');

                    const summaryDiv = document.createElement('div');
                    summaryDiv.className = 'import-summary';
                    summaryDiv.innerHTML = summaryHTML;
                    processingAreaProf.appendChild(summaryDiv);

                    setTimeout(() => {
                        csvProfModal.classList.remove('show');
                        resetProfCsvModal();
                        if (typeof fetchProfesores === 'function') fetchProfesores();
                    }, 4000);
                } else {
                    throw new Error(data.error?.data?.message || "Error en el servidor");
                }
            })
            .catch(err => {
                statusLogoProf.classList.remove('spinning');
                statusLogoProf.src = '../src/img/logo_umbrella.png'; // Podrías poner un logo de error aquí
                statusTextProf.textContent = "Error: " + err.message;
                statusTextProf.classList.add('error');
                setTimeout(() => resetProfCsvModal(), 4000);
            });
        };
    }

    // --- 5. FUNCIÓN DE RESETEO ---

    function resetProfCsvModal() {
        if (!dropZoneProf) return;
        dropZoneProf.style.display = 'block';
        processingAreaProf.style.display = 'none';
        if(fileInputProf) fileInputProf.value = '';
        statusTextProf.className = 'status-text';
        statusTextProf.textContent = "Verificando archivo...";
        statusLogoProf.classList.remove('spinning');
        statusLogoProf.src = '../src/img/logo_umbrella.png';
        
        const oldSummary = processingAreaProf.querySelector('.import-summary');
        if(oldSummary) oldSummary.remove();
    }
});
