document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    //  0. CONFIGURACIÓN
    // ==========================================
    
    // Rutas de imágenes (Ajusta si tu estructura es diferente)
    const IMG_LOADING = '../assets/img/logo_umbrella.png';
    const IMG_ERROR   = '../assets/img/logo_umbrella_error.png';
    const IMG_SUCCESS = '../assets/img/logo_umbrella_success.png';

    // Rutas de los Controladores PHP
    // Como el JS se carga en /views/, subimos un nivel (..) y entramos en controllers
    const URL_IMPORT_CSV  = '../controllers/import_odoo.php';
    const URL_ASSIGN_CARD = '../controllers/assign_card.php';

    // Variables Globales
    let lastScannedCode = "";      // Para detectar duplicados en el escáner
    let currentStudentDni = "";    // Para saber a qué alumno estamos vinculando

    // ==========================================
    //  1. UTILIDADES UI
    // ==========================================

    // Animación de vibración para errores
    function shakeModal(cardElement) {
        if (!cardElement) return;
        cardElement.style.animation = 'none';
        cardElement.offsetHeight; // Forzar reflow
        cardElement.style.animation = 'shake 0.3s ease-in-out';
    }

    // Cerrar modales al hacer clic fuera (Overlay)
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('show');
        }
    });

    // Botones de cierre (X y Cancelar)
    document.addEventListener('click', (e) => {
        if (e.target.matches('.close-modal, .btn-cancel, .close-nfc, #btnCancelNfc, #btnCancelReplace, #btnCancelOverwrite')) {
            const modal = e.target.closest('.modal-overlay');
            if (modal) modal.classList.remove('show');
        }
    });

    // Sidebar Toggle (Menú lateral)
    const logoToggle = document.getElementById('logoToggle');
    const sidebar = document.getElementById('sidebar');
    if (logoToggle && sidebar) {
        logoToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    }


    // ==========================================
    //  2. LÓGICA CSV (IMPORTAR ALUMNOS)
    // ==========================================
    const btnAddStudent = document.getElementById('btnAddStudent');
    const csvModal = document.getElementById('csvModal');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processingArea = document.getElementById('processingArea');
    const statusLogo = document.getElementById('statusLogo');
    const statusText = document.getElementById('statusText');

    if (btnAddStudent && csvModal) {
        // Abrir modal
        btnAddStudent.addEventListener('click', () => {
            resetCsvModal();
            csvModal.classList.add('show');
        });

        if (dropZone && fileInput) {
            // Clic en zona de arrastre -> Abrir selector de archivos
            dropZone.addEventListener('click', () => fileInput.click());
            
            // Cambio en el input file
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
    }

    function handleCsvFile(file) {
        if(!dropZone || !processingArea) return;

        // 1. UI: Mostrar estado "Cargando"
        dropZone.style.display = 'none';
        processingArea.style.display = 'flex';
        statusLogo.src = IMG_LOADING;
        statusLogo.classList.add('spinning');
        statusText.textContent = "Procesando archivo y enviando a Odoo...";
        statusText.className = 'status-text';
        
        // Limpiar lista anterior si existiera
        const oldSummary = processingArea.querySelector('.import-summary');
        if(oldSummary) oldSummary.remove();

        // 2. Leer archivo localmente para generar vista previa
        const reader = new FileReader();
        reader.readAsText(file); 

        reader.onload = function(e) {
            const csvContent = e.target.result;

            // --- GENERAR LA LISTA VISUAL (Nombres y DNI) ---
            const lines = csvContent.split('\n');
            let summaryHTML = '<ul class="summary-list">';
            let count = 0;

            for (let i = 1; i < lines.length; i++) { // Empezar en 1 para saltar cabecera
                const line = lines[i].trim();
                if (line) {
                    const cols = line.split(','); // Asumiendo separador por comas
                    // Nombre(0), Apellido(1), Fecha(2), Clase(3), DNI(4)
                    if (cols.length >= 5) {
                        const nombre = cols[0].trim();
                        const apellido = cols[1].trim();
                        const dni = cols[4].trim(); 
                        
                        summaryHTML += `<li>
                            <span>${nombre} ${apellido}</span>
                            <strong>${dni}</strong>
                        </li>`;
                        count++;
                    }
                }
            }
            summaryHTML += '</ul>';

            // --- 3. ENVIAR AL CONTROLADOR PHP ---
            apiFetch(URL_IMPORT_CSV, { 
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

                // Validamos si Odoo respondió bien (result existe o no hay error)
                if (data.result || (data.data && !data.error)) {
                    statusLogo.src = IMG_SUCCESS;
                    statusText.innerHTML = `¡Importado correctamente! (${count} alumnos)`;
                    statusText.classList.add('success');

                    // Mostramos la lista visual
                    const summaryDiv = document.createElement('div');
                    summaryDiv.className = 'import-summary';
                    summaryDiv.innerHTML = summaryHTML;
                    processingArea.appendChild(summaryDiv);
                    
                    // Esperar 4 segundos antes de cerrar para que el usuario lea
                    setTimeout(() => { 
                        csvModal.classList.remove('show'); 
                        resetCsvModal(); 
                        // window.location.reload(); // Descomentar para recargar la página
                    }, 4000);

                } else {
                    // Error lógico de Odoo
                    const errorMsg = data.error ? data.error.data.message : "Error desconocido de Odoo";
                    throw new Error(errorMsg);
                }
            })
            .catch(error => {
                console.error("Error Importación:", error);
                statusLogo.classList.remove('spinning');
                statusLogo.src = IMG_ERROR;
                statusText.textContent = "Fallo: " + error.message;
                statusText.classList.add('error');
                shakeModal(csvModal.querySelector('.modal-card'));
                
                // Reiniciar tras 4 segundos
                setTimeout(() => { resetCsvModal(); }, 4000);
            });
        };
        
        reader.onerror = () => {
            statusLogo.classList.remove('spinning');
            statusText.textContent = "Error al leer el archivo local.";
        };
    }

    function resetCsvModal() {
        if (!dropZone) return;
        dropZone.style.display = 'block';
        if(processingArea) processingArea.style.display = 'none';
        if(fileInput) fileInput.value = '';
        if(statusText) statusText.className = 'status-text';
        if (statusLogo) {
            statusLogo.classList.remove('spinning');
            statusLogo.src = IMG_LOADING;
        }
        const oldSummary = document.querySelector('.import-summary');
        if(oldSummary) oldSummary.remove();
    }


    // ==========================================
    //  3. LÓGICA NFC (VINCULAR TARJETA)
    // ==========================================
    const nfcModal = document.getElementById('nfcModal');
    const nfcInput = document.getElementById('nfcInput');
    const nfcContent = document.getElementById('nfcContent');
    const nfcProcessing = document.getElementById('nfcProcessing');
    const nfcStatusLogo = document.getElementById('nfcStatusLogo');
    const nfcStatusText = document.getElementById('nfcStatusText');

    // Modales auxiliares (Conflicto y Sobreescritura)
    const conflictModal = document.getElementById('nfcConflictModal');
    const conflictIDSpan = document.getElementById('conflictID');
    const overwriteModal = document.getElementById('nfcOverwriteModal');
    const oldScanValueSpan = document.getElementById('oldScanValue');
    const newScanValueSpan = document.getElementById('newScanValue');

    // 1. ABRIR MODAL Y CAPTURAR DNI
    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn-vincular')) {
            // IMPORTANTE: Leemos el DNI del atributo data-dni del botón
            currentStudentDni = e.target.getAttribute('data-dni'); 
            
            if (!currentStudentDni) {
                alert("Error: Este botón no tiene un DNI asignado.");
                return;
            }

            resetNfcModal();
            nfcModal.classList.add('show');
            // Timeout para asegurar el foco tras la animación CSS
            setTimeout(() => nfcInput.focus(), 200);
        }
    });

    if (nfcInput) {
        // 2. EVENTO DE ESCANEO (ENTER)
        nfcInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                
                // Obtenemos valor bruto (puede ser 10 dígitos, hex, etc.)
                const rawValue = nfcInput.value.trim();
                
                // Limpieza básica: solo letras y números. NO recortamos longitud.
                const formattedValue = rawValue.replace(/[^a-zA-Z0-9]/g, '');

                if (!formattedValue) {
                    nfcInput.style.borderColor = "var(--danger-red)";
                    shakeModal(nfcModal.querySelector('.modal-card'));
                    nfcInput.value = ""; 
                    return;
                }

                // Si ya habíamos escaneado algo y es diferente, preguntamos si sobreescribir
                if (lastScannedCode !== "" && lastScannedCode !== formattedValue) {
                    if(oldScanValueSpan) oldScanValueSpan.textContent = lastScannedCode;
                    if(newScanValueSpan) newScanValueSpan.textContent = formattedValue;
                    if(overwriteModal) overwriteModal.classList.add('show');
                } else {
                    // Si es el primero o es igual, procesamos
                    confirmLocalScan(formattedValue);
                }
            }
        });

        // Truco: Seleccionar todo el texto al enfocar para facilitar reescritura
        nfcInput.addEventListener('focus', () => {
            nfcInput.select();
        });
    }

    // --- LÓGICA DE SOBREESCRITURA (MODAL INTERMEDIO) ---
    document.getElementById('btnConfirmOverwrite')?.addEventListener('click', () => {
        const val = newScanValueSpan.textContent;
        confirmLocalScan(val);
        overwriteModal.classList.remove('show');
        nfcInput.focus();
    });

    document.getElementById('btnCancelOverwrite')?.addEventListener('click', () => {
        overwriteModal.classList.remove('show');
        nfcInput.value = lastScannedCode; // Restaurar anterior
        nfcInput.focus();
    });

    // Función auxiliar: valida visualmente el código en el input
    function confirmLocalScan(val) {
        if(!nfcInput) return;
        lastScannedCode = val;
        nfcInput.value = val;
        nfcInput.style.borderColor = "var(--success-green)";
        nfcInput.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
        nfcInput.select(); 
    }

    // 3. GUARDAR EN ODOO
    document.getElementById('btnSaveNfc')?.addEventListener('click', () => {
        if(!nfcInput) return;
        const idValue = nfcInput.value.trim();
        
        if (idValue === "") {
            nfcInput.style.borderColor = "var(--danger-red)";
            shakeModal(nfcModal.querySelector('.modal-card'));
            return;
        }

        // Aquí podríamos comprobar duplicados locales si tuviéramos una lista cargada
        // Por ahora enviamos directamente a procesar
        processNfcSave(idValue);
    });

    // 4. PROCESAR GUARDADO (LLAMADA AL SERVIDOR)
    function processNfcSave(idValue) {
        if(!nfcContent || !nfcProcessing) return;
        
        // UI: Mostrar carga
        nfcContent.style.display = 'none';
        nfcProcessing.style.display = 'flex';
        
        if(nfcStatusLogo) {
            nfcStatusLogo.src = IMG_LOADING;
            nfcStatusLogo.classList.add('spinning');
        }
        if(nfcStatusText) {
            nfcStatusText.textContent = "Vinculando tarjeta en Odoo...";
            nfcStatusText.className = 'status-text';
        }

        // PETICIÓN FETCH
        apiFetch(URL_ASSIGN_CARD, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                uid: idValue,       // Código del chip
                dni: currentStudentDni // DNI del alumno
            })
        })
        .then(response => {
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if(nfcStatusLogo) nfcStatusLogo.classList.remove('spinning');

            if (data.result) {
                // ÉXITO
                if(nfcStatusLogo) nfcStatusLogo.src = IMG_SUCCESS;
                if(nfcStatusText) {
                    nfcStatusText.textContent = "¡Tarjeta vinculada correctamente!";
                    nfcStatusText.classList.add('success');
                }
                
                // Cerrar modal
                setTimeout(() => {
                    nfcModal.classList.remove('show');
                    // location.reload(); // Descomentar si quieres recargar la página
                }, 1500);

            } else {
                // ERROR DE ODOO
                throw new Error(data.error ? data.error.data.message : "Error desconocido al asignar.");
            }
        })
        .catch(error => {
            console.error("Error NFC:", error);
            if(nfcStatusLogo) nfcStatusLogo.src = IMG_ERROR;
            if(nfcStatusText) {
                nfcStatusText.textContent = "Error: " + error.message;
                nfcStatusText.classList.add('error');
            }
            shakeModal(nfcModal.querySelector('.modal-card'));

            // Volver a mostrar el input tras 2.5 segundos para reintentar
            setTimeout(() => { 
                nfcProcessing.style.display = 'none'; 
                nfcContent.style.display = 'block'; 
                nfcInput.focus();
                nfcInput.select();
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
        // No reseteamos currentStudentDni aquí porque lo necesitamos si hubo un error y reintentamos
    }
});

// ==========================================
    //  4. LÓGICA DE FILTROS (CON BOTÓN APLICAR)
    // ==========================================
    const btnFilterToggle = document.getElementById('btnFilterToggle');
    const filterMenu = document.getElementById('filterMenu');
    const btnApplyFilters = document.getElementById('btnApplyFilters');
    const btnClearFilters = document.getElementById('btnClearFilters');
    const tableRows = document.querySelectorAll('.table-row');

    if (btnFilterToggle && filterMenu) {
        // Abrir/Cerrar menú
        btnFilterToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            filterMenu.classList.toggle('show');
        });

        // Botón Aplicar
        btnApplyFilters.addEventListener('click', () => {
            applyFilters();
            filterMenu.classList.remove('show'); // Cerramos al aplicar
        });

        function applyFilters() {
            const checkedCursos = Array.from(document.querySelectorAll('input[name="filter-curso"]:checked')).map(cb => cb.value);
            const filterNoNfc = document.querySelector('input[name="filter-no-nfc"]').checked;
            const filterTrans = document.querySelector('input[name="filter-transporte"]').checked;
            const filterMayor = document.querySelector('input[name="filter-mayor"]').checked;
            const filterMenor = document.querySelector('input[name="filter-menor"]').checked;

            document.querySelectorAll('.table-row').forEach(row => {
                const rowCurso = row.getAttribute('data-curso');
                const rowNfc = row.getAttribute('data-nfc');
                const rowTrans = row.getAttribute('data-transporte');
                const esMayor = row.getAttribute('data-es-mayor');

                let show = true;

                // Lógica de Filtros
                if (checkedCursos.length > 0 && !checkedCursos.some(c => rowCurso.includes(c))) show = false;
                if (filterNoNfc && rowNfc !== 'no') show = false;
                if (filterTrans && rowTrans !== 'yes') show = false;
                if (filterMayor && esMayor !== 'yes') show = false;
                if (filterMenor && esMayor !== 'no') show = false;

                row.style.display = show ? 'grid' : 'none';
            });
        }

        // Limpiar
        btnClearFilters.addEventListener('click', () => {
            document.querySelectorAll('.filter-menu input[type="checkbox"]').forEach(cb => cb.checked = false);
            applyFilters();
        });
    }

document.addEventListener('DOMContentLoaded', () => {
    fetchAlumnos();

    function fetchAlumnos() {
    const tableBody = document.getElementById('tableBody');
    const loader = document.getElementById('tableLoader');

    apiFetch('../controllers/get_alumnos.php')
        .then(response => response.json())
        .then(data => {
            // Accedemos a result.alumnos según la estructura de tu Odoo
            const listaAlumnos = data.result.alumnos || [];
            loader.style.display = 'none';

            if (listaAlumnos.length === 0) {
                tableBody.innerHTML = `<div style="padding:40px; text-align:center;">No hay alumnos registrados.</div>`;
                return;
            }

            let html = '';
            listaAlumnos.forEach(alumno => {
                const edad = calcularEdadJS(alumno.fecha_nacimiento);
                const tieneNFC = alumno.uid && alumno.uid !== "";
                
                html += `
                <div class="table-row table-grid-layout" 
                    data-curso="${alumno.grupo_clase || ''}"
                    data-nfc="${tieneNFC ? 'yes' : 'no'}" 
                    data-transporte="${alumno.permiso_transporte ? 'yes' : 'no'}"
                    data-es-mayor="${edad >= 18 ? 'yes' : 'no'}">

                    <div class="student-name">
                        ${alumno.apellido || ''}, ${alumno.nombre || ''}
                    </div>

                    <div class="text-gray">${formatearFecha(alumno.fecha_nacimiento)}</div>
                    <div class="text-gray">${alumno.grupo_clase || 'S/G'}</div>
                    <div class="text-gray">${alumno.dni || 'N/A'}</div>

                    <div>
                        ${tieneNFC 
                            ? `<span class="nfc-id-tag">${alumno.uid}</span>` 
                            : `<button class="btn-vincular" data-dni="${alumno.dni}">Vincular</button>`
                        }
                    </div>

                    <div class="bool-cell">
                        <label class="switch">
                            <input type="checkbox" 
                                ${alumno.permiso_salida ? 'checked' : ''} 
                                disabled>
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="bool-cell">
                        <label class="switch">
                            <input type="checkbox" 
                                ${alumno.permiso_recreo ? 'checked' : ''} 
                                disabled>
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="bool-cell">
                        <label class="switch">
                            <input type="checkbox" class="js-update-permiso" 
                                data-dni="${alumno.dni}" data-field="permiso_transporte" 
                                ${alumno.permiso_transporte ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>`;
            });

            tableBody.innerHTML = html;
        })
        .catch(error => {
            loader.innerHTML = `<p style="color:red;">Error de sincronización con Odoo.</p>`;
            console.error('Error:', error);
        });
}

    // GESTIÓN DE ACTUALIZACIÓN DE PERMISOS (Cualquier switch)
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('js-update-permiso')) {
            const checkbox = e.target;
            const dni = checkbox.dataset.dni;
            const campo = checkbox.dataset.field; // permiso_salida, etc.
            const valor = checkbox.checked;

            checkbox.closest('.table-row').style.opacity = '0.5';

            apiFetch('../controllers/update_generic.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni: dni, campo: campo, valor: valor })
            })
            .then(res => res.json())
            .then(data => {
                checkbox.closest('.table-row').style.opacity = '1';
                if (data.error) {
                    alert("Error al guardar");
                    checkbox.checked = !valor;
                }
            })
            .catch(() => {
                checkbox.closest('.table-row').style.opacity = '1';
                checkbox.checked = !valor;
            });
        }
    });

    // Funciones auxiliares
    function calcularEdadJS(fecha) {
        if (!fecha) return 0;
        const hoy = new Date();
        const cumple = new Date(fecha);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        const m = hoy.getMonth() - cumple.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
        return edad;
    }

    function formatearFecha(fecha) {
        if (!fecha) return 'N/A';
        const [y, m, d] = fecha.split('-');
        return `${d}/${m}/${y}`;
    }
});