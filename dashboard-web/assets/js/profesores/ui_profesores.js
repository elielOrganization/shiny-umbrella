/**
 * @file ui_profesores.js
 */

window.UI_Profesores = {
    _allData:   [],
    _filtered:  [],
    _page:      1,
    POR_PAGINA: 10,

    toggleLoader: function(mostrar) {
        const loader    = document.getElementById('tableLoaderProf');
        const tableBody = document.getElementById('tableBodyProf');
        if (mostrar) {
            if (loader) loader.style.display = '';
            if (tableBody) { tableBody.innerHTML = ''; tableBody.style.display = 'none'; }
        } else {
            if (loader) loader.style.display = 'none';
            if (tableBody) tableBody.style.display = '';
        }
    },

    renderizarTabla: function(listaProfesores) {
        this._allData  = listaProfesores || [];
        this._filtered = this._allData;
        this._page     = 1;
        this._renderPagina();
    },

    aplicarFiltros: function(textoBusqueda, depsSeleccionados, estadosSeleccionados, nfcSeleccionados) {
        this._filtered = this._allData.filter(prof => {
            const tieneNFC = !!(prof.uid && prof.uid !== '');
            const dep      = prof.departamento || '';
            const estado   = prof.estado ? 'alta' : 'baja';
            const nfc      = tieneNFC ? 'con' : 'sin';
            const texto    = `${prof.apellido || ''} ${prof.nombre || ''}`.toLowerCase();

            if (textoBusqueda && !texto.includes(textoBusqueda))                          return false;
            if (depsSeleccionados.length > 0    && !depsSeleccionados.includes(dep))      return false;
            if (estadosSeleccionados.length > 0 && !estadosSeleccionados.includes(estado)) return false;
            if (nfcSeleccionados.length > 0     && !nfcSeleccionados.includes(nfc))       return false;
            return true;
        });
        this._page = 1;
        this._renderPagina();
    },

    _renderPagina: function() {
        const tableBody = document.getElementById('tableBodyProf');
        if (!tableBody) return;

        const total     = this._filtered.length;
        const totalPags = Math.max(1, Math.ceil(total / this.POR_PAGINA));
        const inicio    = (this._page - 1) * this.POR_PAGINA;
        const pagina    = this._filtered.slice(inicio, inicio + this.POR_PAGINA);

        if (!total) {
            tableBody.innerHTML = `<div style="padding:40px;text-align:center;">No hay profesores registrados o falló la conexión.</div>`;
            return;
        }

        let html = '';
        pagina.forEach(prof => {
            const tieneNFC = !!(prof.uid && prof.uid !== '');
            html += `
            <div class="table-row table-grid-prof" data-dep="${prof.departamento || ''}" data-estado="${prof.estado ? 'alta' : 'baja'}" data-nfc="${tieneNFC ? 'con' : 'sin'}">
                <div class="student-name">${prof.apellido || ''}, ${prof.nombre || ''}</div>
                <div class="text-gray">${prof.dni || ''}</div>
                <div class="text-gray">${prof.departamento || ''}</div>
                <div>
                    ${tieneNFC
                        ? `<span class="nfc-id-tag nfc-tag-wrapper">
                            <i class="fa-solid fa-rss"></i>${prof.uid}
                            <button class="btn-unlink-nfc" onclick="confirmarDesvincularNFCProf('${prof.uid}', '${prof.nombre || ''} ${prof.apellido || ''}')" title="Desvincular NFC">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                           </span>`
                        : `<button class="btn-vincular" data-dni="${prof.dni}" data-nombre="${prof.nombre || ''} ${prof.apellido || ''}" onclick="prepararAsignacionNFCProf(this)">Vincular</button>`
                    }
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

        const paginacion = totalPags > 1 ? `
            <div class="logs-pagination">
                <button class="logs-page-btn" onclick="UI_Profesores._cambiarPagina(-1)" ${this._page === 1 ? 'disabled' : ''}>
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <span class="logs-page-info">${this._page} / ${totalPags}</span>
                <button class="logs-page-btn" onclick="UI_Profesores._cambiarPagina(1)" ${this._page === totalPags ? 'disabled' : ''}>
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>` : '';

        tableBody.innerHTML = html + paginacion;
    },

    _cambiarPagina: function(dir) {
        const totalPags = Math.max(1, Math.ceil(this._filtered.length / this.POR_PAGINA));
        const body      = document.getElementById('tableBodyProf');

        body.style.transition = 'opacity 0.12s ease, transform 0.12s ease';
        body.style.opacity    = '0';
        body.style.transform  = 'scale(0.97)';

        setTimeout(() => {
            this._page = Math.max(1, Math.min(totalPags, this._page + dir));
            this._renderPagina();
            body.style.transition = 'none';
            body.style.transform  = 'scale(1.02)';
            body.style.opacity    = '0';
            requestAnimationFrame(() => requestAnimationFrame(() => {
                body.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
                body.style.opacity    = '1';
                body.style.transform  = 'scale(1)';
            }));
        }, 120);
    },

    // --- MODAL EDICIÓN ---
    abrirModalEdicion: function(id, nombre, apellido, dni, departamento) {
        document.getElementById('editProfId').value       = id;
        document.getElementById('editProfNombre').value   = nombre;
        document.getElementById('editProfApellidos').value = apellido;
        document.getElementById('editProfDni').value      = dni;
        const depSelect = document.getElementById('editProfDepartamento');
        if (departamento) depSelect.value = departamento;
        else depSelect.value = '';
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
        if (btnConfirmar) btnConfirmar.setAttribute('data-dni', dni);
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
        texto.textContent = 'Verificando archivo...';
        const oldSummary = document.querySelector('.import-summary');
        if (oldSummary) oldSummary.remove();
    },

    mostrarEstadoCSV: (mensaje, esError = false, detenerGiro = false) => {
        const texto = document.getElementById('statusTextProf');
        const logo  = document.getElementById('statusLogoProf');
        document.getElementById('dropZoneProf').style.display = 'none';
        document.getElementById('processingAreaProf').style.display = 'flex';
        texto.textContent = mensaje;
        if (esError) {
            texto.classList.add('error');
            logo.classList.remove('spinning');
        } else {
            texto.classList.remove('error');
            if (!detenerGiro) logo.classList.add('spinning');
        }
        if (detenerGiro) logo.classList.remove('spinning');
    }
};
