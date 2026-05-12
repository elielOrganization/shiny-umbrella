/**
 * @file ui_profesores.js
 * @description Módulo completo para la manipulación del DOM y Modales.
 * Se encarga de inyectar el HTML con las clases CSS correctas para mantener el diseño.
 * @author Paragüillas Aceitado
 */

window.UI_Profesores = {
    toggleLoader: function(mostrar) {
        const loader = document.getElementById('tableLoaderProf');
        const tableBody = document.getElementById('tableBodyProf');
        
        if (mostrar) {
            if (loader) loader.style.display = ''; 
            if (tableBody) {
                tableBody.innerHTML = '';
                tableBody.style.display = 'none';
            }
        } else {
            if (loader) loader.style.display = 'none';
            if (tableBody) tableBody.style.display = ''; 
        }
    },

    /**
     * Renderiza las filas de la tabla inyectando el HTML con sus etiquetas CSS.
     */
    renderizarTabla: function(listaProfesores) {
        const tableBody = document.getElementById('tableBodyProf');
        if (!tableBody) return;

        if (!listaProfesores || listaProfesores.length === 0) {
            tableBody.innerHTML = `<div style="padding:40px; text-align:center;">No hay profesores registrados o falló la conexión.</div>`;
            return;
        }

        let html = '';
        listaProfesores.forEach(prof => {
            const tieneNFC = prof.uid && prof.uid !== "";
            html += `
            <div class="table-row table-grid-prof" data-dep="${prof.departamento || ''}" data-estado="${prof.estado ? 'alta' : 'baja'}" data-nfc="${tieneNFC ? 'con' : 'sin'}">
                <div class="student-name">${prof.apellido || ''}, ${prof.nombre || ''}</div>
                
                <div class="text-gray">${prof.dni || ''}</div>
                
                <div class="text-gray">${prof.departamento || ''}</div>
                
                <div>
                    ${tieneNFC ? `<span class="nfc-id-tag"><i class="fa-solid fa-rss"></i>${prof.uid}</span>` : `<button class="btn-vincular" data-dni="${prof.dni}">Vincular</button>`}
                </div>

                <div class="text-center">
                    <label class="switch">
                        <input type="checkbox" ${prof.estado === true ? 'checked' : ''} class="prof-estado-switch" data-dni="${prof.dni}" data-field="estado">
                        <span class="slider round"></span>
                    </label>
                </div>

                <div class="table-actions">
                    <button class="btn-table-action edit" onclick="UI_Profesores.abrirModalEdicion(${prof.id}, '${prof.nombre || ''}', '${prof.apellido || ''}', '${prof.dni || ''}', '${prof.departamento || ''}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-table-action delete" onclick="UI_Profesores.abrirModalEliminar('${prof.dni || ''}', '${prof.nombre || ''} ${prof.apellido || ''}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>`;
        });

        tableBody.innerHTML = html;
    },

    // --- MODAL EDICIÓN ---
    abrirModalEdicion: function(id, nombre, apellido, dni, departamento) {
        document.getElementById('editProfId').value = id;
        document.getElementById('editProfNombre').value = nombre;
        document.getElementById('editProfApellidos').value = apellido;
        document.getElementById('editProfDni').value = dni;
        
        const depSelect = document.getElementById('editProfDepartamento');
        if (departamento) {
            depSelect.value = departamento;
        } else {
            depSelect.value = ""; 
        }

        document.getElementById('editProfModal').classList.add('show');
    },
    cerrarModalEdicion: () => document.getElementById('editProfModal').classList.remove('show'),

    // --- MODAL AÑADIR MANUAL ---
    abrirModalManual: () => {
        document.getElementById('formManualProf').reset();
        document.getElementById('manualProfModal').classList.add('show');
        document.getElementById('csvProfModal').classList.remove('show');
    },
    cerrarModalManual: () => document.getElementById('manualProfModal').classList.remove('show'),

    // --- MODAL ELIMINAR ---
    abrirModalEliminar: function(dni, nombreCompleto) {
        const btnConfirmar = document.getElementById('btnConfirmDeleteProf');
        if(btnConfirmar) btnConfirmar.setAttribute('data-dni', dni);
        
        document.getElementById('deleteProfName').textContent = nombreCompleto;
        document.getElementById('deleteConfirmModal').classList.add('show');
    },
    cerrarModalEliminar: () => document.getElementById('deleteConfirmModal').classList.remove('show'),

    // --- MODAL CSV ---
    abrirModalCSV: () => {
        UI_Profesores.resetModalCSV();
        document.getElementById('csvProfModal').classList.add('show');
    },
    cerrarModalCSV: () => document.getElementById('csvProfModal').classList.remove('show'),
    
    resetModalCSV: () => {
        document.getElementById('dropZoneProf').style.display = 'block';
        document.getElementById('processingAreaProf').style.display = 'none';
        document.getElementById('fileInputProf').value = '';
        
        const logo = document.getElementById('statusLogoProf');
        logo.classList.remove('spinning');
        logo.src = '../assets/img/logo_umbrella.png';
        
        const texto = document.getElementById('statusTextProf');
        texto.className = 'status-text';
        texto.textContent = "Verificando archivo...";
        
        const oldSummary = document.querySelector('.import-summary');
        if(oldSummary) oldSummary.remove();
    },
    
    mostrarEstadoCSV: (mensaje, esError = false, detenerGiro = false) => {
        const texto = document.getElementById('statusTextProf');
        const logo = document.getElementById('statusLogoProf');
        
        document.getElementById('dropZoneProf').style.display = 'none';
        document.getElementById('processingAreaProf').style.display = 'flex';
        
        texto.textContent = mensaje;
        if (esError) {
            texto.classList.add('error');
            logo.classList.remove('spinning');
        } else {
            texto.classList.remove('error');
            if(!detenerGiro) logo.classList.add('spinning');
        }

        if(detenerGiro) logo.classList.remove('spinning');
    }
};

window.UI_Profesores = UI_Profesores;