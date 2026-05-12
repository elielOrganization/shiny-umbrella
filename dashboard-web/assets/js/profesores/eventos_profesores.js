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
    const btnAbrirAñadir = document.getElementById('btnAddProfesor'); // Asume que existe un botón principal para añadir
    const btnLinkAñadir = document.getElementById('btnAñadirManualProf'); // Enlace desde el modal CSV
    
    if (btnAbrirAñadir) btnAbrirAñadir.addEventListener('click', UI_Profesores.abrirModalManual);
    if (btnLinkAñadir) btnLinkAñadir.addEventListener('click', (e) => { e.preventDefault(); UI_Profesores.abrirModalManual(); });

    const formManual = document.getElementById('formManualProf');
    if (formManual) {
        formManual.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
            btn.disabled = true;

            const datos = {
                nombre: document.getElementById('manualProfNombre').value.trim(),
                apellidos: document.getElementById('manualProfApellidos').value.trim(),
                dni: document.getElementById('manualProfDni').value.trim(),
                departamento: document.getElementById('manualProfDepartamento').value
            };

            try {
                await API_Profesores.añadirManual(datos);
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

    // --- 4. EVENTOS: ELIMINAR ---
    const deleteModal = document.getElementById('deleteConfirmModal');

    document.getElementById('btnCancelDeleteProf')?.addEventListener('click', () => UI_Profesores.cerrarModalEliminar());
    deleteModal?.addEventListener('click', (e) => { if (e.target === deleteModal) UI_Profesores.cerrarModalEliminar(); });

    const btnConfirmarEliminar = document.getElementById('btnConfirmDeleteProf');
    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', async function() {
            const dni = this.getAttribute('data-dni');
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Eliminando...';
            this.disabled = true;

            try {
                await API_Profesores.eliminar(dni);
                UI_Profesores.cerrarModalEliminar();
                window.fetchProfesores();
            } catch (err) {
                alert("Error al eliminar: " + err.message);
            } finally {
                this.innerHTML = originalText;
                this.disabled = false;
            }
        });
    }

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

        UI_Profesores.mostrarEstadoCSV("Enviando a Odoo...");

        try {
            const result = await API_Profesores.subirCSV(archivo);
            UI_Profesores.mostrarEstadoCSV("¡Archivo procesado con éxito!", false, true);
            
            setTimeout(() => {
                UI_Profesores.cerrarModalCSV();
                window.fetchProfesores();
            }, 3000);

        } catch (err) {
            UI_Profesores.mostrarEstadoCSV("Error: " + err.message, true);
            setTimeout(() => UI_Profesores.resetModalCSV(), 4000);
        }
    }

    const tableBody = document.getElementById('tableBodyProf');
    if (tableBody) {
        tableBody.addEventListener('change', async function(e) {
            // Comprobamos si lo que ha cambiado es un interruptor de estado
            if (e.target.classList.contains('prof-estado-switch')) {
                const dni = e.target.getAttribute('data-dni');
                const nuevoEstado = e.target.checked; // true (activado) o false (desactivado)
                
                // Bloqueamos el interruptor mientras enviamos a Odoo
                e.target.disabled = true;
                
                try {
                    await API_Profesores.actualizarEstado(dni, nuevoEstado);
                    // Opcional: podrías mostrar una pequeña notificación de éxito aquí
                } catch (error) {
                    alert("Error al cambiar el estado: " + error.message);
                    // Si el servidor falla, devolvemos el interruptor visualmente a donde estaba
                    e.target.checked = !nuevoEstado;
                } finally {
                    // Desbloqueamos el interruptor
                    e.target.disabled = false;
                }
            }
        });
    }

// ==========================================
    // 7. EVENTOS: FILTROS Y BÚSQUEDA
    // ==========================================
    const btnToggleFiltros = document.getElementById('btnFilterToggleProf'); 
    const panelFiltros = document.getElementById('filterMenuProf');
    
    // 1. Abrir/Cerrar el menú
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

    // 2. Aplicar Filtros
    const btnAplicarFiltros = document.getElementById('btnApplyFiltersProf');
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', () => {
            aplicarFiltrosYBusqueda();
            if (panelFiltros) panelFiltros.classList.remove('show');
        });
    }

    // 3. Borrar Filtros
    const btnBorrarFiltros = document.getElementById('btnClearFiltersProf');
    if (btnBorrarFiltros) {
        btnBorrarFiltros.addEventListener('click', () => {
            document.querySelectorAll('#filterMenuProf input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.getElementById('tableSearchProf').value = ''; // Limpiamos buscador
            
            document.querySelectorAll('#tableBodyProf .table-row').forEach(fila => fila.style.display = '');
            if (panelFiltros) panelFiltros.classList.remove('show');
        });
    }

    // 4. Buscador por texto (Búsqueda en vivo)
    const buscadorInput = document.getElementById('tableSearchProf');
    if (buscadorInput) {
        buscadorInput.addEventListener('input', aplicarFiltrosYBusqueda);
    }

    // Función maestra que combina los checkboxes y el buscador
    function aplicarFiltrosYBusqueda() {
        const buscador = document.getElementById('tableSearchProf');
        const textoBusqueda = (buscador ? buscador.value : '').toLowerCase();
        
        const depsSeleccionados = Array.from(document.querySelectorAll('input[name="filter-dep"]:checked')).map(cb => cb.value);
        const estadosSeleccionados = Array.from(document.querySelectorAll('input[name="filter-estado"]:checked')).map(cb => cb.value);
        const nfcSeleccionados = Array.from(document.querySelectorAll('input[name="filter-nfc"]:checked')).map(cb => cb.value);

        const filas = document.querySelectorAll('#tableBodyProf .table-row');

        // CHIVATO PARA LA CONSOLA (Pulsa F12 en tu navegador)
        console.log("--- INICIANDO FILTRADO ---");
        console.log(`Filas encontradas en la tabla: ${filas.length}`);
        console.log(`Filtros activos -> Dep: [${depsSeleccionados}], Estado: [${estadosSeleccionados}], NFC: [${nfcSeleccionados}]`);

        filas.forEach((fila, index) => {
            // Leer las etiquetas ocultas
            const depFila = fila.getAttribute('data-dep') || '';
            const estadoFila = fila.getAttribute('data-estado') || '';
            const nfcFila = fila.getAttribute('data-nfc') || '';
            
            // Leer el texto del nombre/apellidos para buscar
            const nombreNodo = fila.querySelector('.student-name');
            const nombreCompleto = nombreNodo ? nombreNodo.textContent.toLowerCase() : '';

            // Comprobar condiciones
            const pasaBusqueda = textoBusqueda === '' || nombreCompleto.includes(textoBusqueda);
            const pasaDep = depsSeleccionados.length === 0 || depsSeleccionados.includes(depFila);
            const pasaEstado = estadosSeleccionados.length === 0 || estadosSeleccionados.includes(estadoFila);
            const pasaNfc = nfcSeleccionados.length === 0 || nfcSeleccionados.includes(nfcFila);

            // Si pasa TODO, se muestra
            if (pasaBusqueda && pasaDep && pasaEstado && pasaNfc) {
                // Borramos la orden de ocultar para que recupere su grid/flex original
                fila.style.display = ''; 
            } else {
                // ¡Aplastamos al CSS obligando a que se oculte sí o sí!
                fila.style.setProperty('display', 'none', 'important'); 
            }

            // Chivato de la primera fila para asegurarnos de que está leyendo bien
            if (index === 0) {
                console.log(`Fila 1 detectada -> Nombre: ${nombreCompleto}, Dep: ${depFila}, Estado: ${estadoFila}, NFC: ${nfcFila}`);
            }
        });
        console.log("--- FIN DEL FILTRADO ---");
    }
    });