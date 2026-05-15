/**
 * @file ui_profesores.js
 */

window.UI_Profesores = {

    // --- ESTADO INTERNO ---
    _allData:   [],
    _filtered:  [],
    _page:      1,
    POR_PAGINA: 10,

    // --- LOADER ---
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

    // --- TABLA ---
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

    // --- PAGINACIÓN ---
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
        Modales.abrirEliminar({
            titulo:   '¿Eliminar profesor?',
            cuerpo:   `Esta acción eliminará permanentemente a <strong style="color:#ef4444;">${nombreCompleto}</strong> de la base de datos de Odoo.`,
            btnTexto: 'Eliminar Profesor',
            onConfirm: async () => {
                await API_Profesores.eliminar(dni);
                Modales.cerrarEliminar();
                if (typeof window.fetchProfesores === 'function') window.fetchProfesores();
            }
        });
    },
    cerrarModalEliminar: () => Modales.cerrarEliminar(),

    // --- MODAL CSV ---
    abrirModalCSV: () => {
        UI_Profesores.resetModalCSV();
        document.getElementById('csvProfModal').classList.add('show');
    },
    cerrarModalCSV: () => document.getElementById('csvProfModal').classList.remove('show'),

    resetModalCSV: () => {
        const drop  = document.getElementById('dropZoneProf');
        const area  = document.getElementById('processingAreaProf');
        const logo  = document.getElementById('statusLogoProf');
        const texto = document.getElementById('statusTextProf');
        const input = document.getElementById('fileInputProf');
        if (drop)  drop.style.display  = 'block';
        if (area)  area.style.display  = 'none';
        if (input) input.value         = '';
        if (texto) texto.className     = 'status-text';
        if (logo)  { logo.classList.remove('spinning'); logo.src = GLOBALS.IMG_LOADING; }
        const old = document.querySelector('.import-summary');
        if (old) old.remove();
    },

    mostrarEstadoCSV: ({ mensaje, esError = false, spinning = false, logoSrc = null, summaryHTML = null } = {}) => {
        const texto = document.getElementById('statusTextProf');
        const logo  = document.getElementById('statusLogoProf');
        const area  = document.getElementById('processingAreaProf');

        document.getElementById('dropZoneProf').style.display = 'none';
        area.style.display = 'flex';

        // Logo
        if (logoSrc) logo.src = logoSrc;
        if (spinning) logo.classList.add('spinning');
        else          logo.classList.remove('spinning');

        // Texto
        texto.className = 'status-text' + (esError ? ' error' : '');
        texto.innerHTML = mensaje;

        // Resumen (lista de profesores procesados)
        const old = area.querySelector('.import-summary');
        if (old) old.remove();
        if (summaryHTML) {
            const div = document.createElement('div');
            div.className = 'import-summary';
            div.innerHTML = summaryHTML;
            area.appendChild(div);
        }
    }
};
