// ui_alumnos.js
const AlumnosUI = {
    _allData:   [],
    _filtered:  [],
    _page:      1,
    POR_PAGINA: 10,

    renderTable(listaAlumnos) {
        const loader = document.getElementById('tableLoader');
        if (loader) loader.style.display = 'none';

        this._allData  = listaAlumnos;
        this._filtered = listaAlumnos;
        this._page     = 1;
        this._renderPagina();

        if (typeof window.applyFilters === 'function') window.applyFilters();
    },

    aplicarFiltros(searchTerm, checkedCursos, filterNoNfc, filterTrans, filterMayor, filterMenor) {
        this._filtered = this._allData.filter(alumno => {
            const edad     = this.calcularEdad(alumno.fecha_nacimiento);
            const tieneNFC = !!(alumno.uid && alumno.uid !== '');
            const curso    = (alumno.grupo_clase || '').trim();
            const texto    = [
                alumno.apellido, alumno.nombre,
                this.formatearFecha(alumno.fecha_nacimiento),
                curso, alumno.dni || '', alumno.uid || ''
            ].join(' ').toLowerCase();

            if (searchTerm && !texto.includes(searchTerm))               return false;
            if (checkedCursos.length > 0 && !checkedCursos.includes(curso)) return false;
            if (filterNoNfc  && tieneNFC)                                 return false;
            if (filterTrans  && !alumno.permiso_transporte)               return false;
            if (filterMayor  && edad < 18)                                return false;
            if (filterMenor  && edad >= 18)                               return false;
            return true;
        });
        this._page = 1;
        this._renderPagina();
    },

    _renderPagina() {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const total     = this._filtered.length;
        const totalPags = Math.max(1, Math.ceil(total / this.POR_PAGINA));
        const inicio    = (this._page - 1) * this.POR_PAGINA;
        const pagina    = this._filtered.slice(inicio, inicio + this.POR_PAGINA);

        if (!total) {
            tableBody.innerHTML = `<div style="padding:40px;text-align:center;">No hay alumnos registrados.</div>`;
            return;
        }

        let html = '';
        pagina.forEach(alumno => {
            const dniRaw       = alumno.dni || alumno.vat || '';
            const dniLimpio    = (dniRaw === false) ? '' : String(dniRaw).trim();
            const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`.replace(/'/g, '');
            const edad         = this.calcularEdad(alumno.fecha_nacimiento);
            const tieneNFC     = !!(alumno.uid && alumno.uid !== '');

            html += `
            <div class="table-row table-grid-layout"
                data-curso="${alumno.grupo_clase || ''}"
                data-nfc="${tieneNFC ? 'yes' : 'no'}"
                data-transporte="${alumno.permiso_transporte ? 'yes' : 'no'}"
                data-es-mayor="${edad >= 18 ? 'yes' : 'no'}">

                <div class="student-name">${alumno.apellido || ''}, ${alumno.nombre || ''}</div>
                <div class="text-gray">${this.formatearFecha(alumno.fecha_nacimiento)}</div>
                <div class="text-gray">${alumno.grupo_clase || 'S/G'}</div>
                <div class="text-gray">${alumno.dni || 'N/A'}</div>

                <div>
                    ${tieneNFC
                        ? `<span class="uid-label nfc-tag-wrapper">
                            <i class="fa-solid fa-rss"></i>${alumno.uid}
                            <button class="btn-unlink-nfc" onclick="confirmarDesvincularNFC('${alumno.uid}', '${alumno.nombre} ${alumno.apellido}')" title="Desvincular NFC">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                           </span>`
                        : `<button class="btn-vincular"
                            data-dni="${dniLimpio}"
                            data-nombre="${nombreCompleto}"
                            onclick="prepararAsignacionNFC(this)">
                            Vincular
                        </button>`
                    }
                </div>

                <div class="bool-cell campo-calculado" title="Campo calculado automáticamente según la edad del alumno">
                    <label class="switch">
                        <input type="checkbox" ${alumno.permiso_salida ? 'checked' : ''} disabled>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="bool-cell campo-calculado" title="Campo calculado automáticamente según la edad del alumno">
                    <label class="switch">
                        <input type="checkbox" ${alumno.permiso_recreo ? 'checked' : ''} disabled>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="bool-cell">
                    <label class="switch">
                        <input type="checkbox"
                            ${alumno.permiso_transporte ? 'checked' : ''}
                            data-dni="${alumno.dni}"
                            data-field="permiso_transporte">
                        <span class="slider round"></span>
                    </label>
                </div>

                <div class="table-actions">
                    <button class="btn-table-action edit"
                        data-id="${alumno.id}"
                        data-nombre="${alumno.nombre || ''}"
                        data-apellido="${alumno.apellido || ''}"
                        data-dni="${alumno.dni || ''}"
                        data-fecha="${alumno.fecha_nacimiento || ''}"
                        data-grupo="${alumno.grupo_clase || ''}"
                        onclick="prepararEdicionAlumno(this)">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-table-action delete"
                        onclick="confirmarEliminarAlumno('${alumno.dni}', '${alumno.nombre} ${alumno.apellido}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>`;
        });

        const paginacion = totalPags > 1 ? `
            <div class="logs-pagination">
                <button class="logs-page-btn" onclick="AlumnosUI._cambiarPagina(-1)" ${this._page === 1 ? 'disabled' : ''}>
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <span class="logs-page-info">${this._page} / ${totalPags}</span>
                <button class="logs-page-btn" onclick="AlumnosUI._cambiarPagina(1)" ${this._page === totalPags ? 'disabled' : ''}>
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>` : '';

        tableBody.innerHTML = html + paginacion;
    },

    _cambiarPagina(dir) {
        const totalPags = Math.max(1, Math.ceil(this._filtered.length / this.POR_PAGINA));
        const body      = document.getElementById('tableBody');

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

    showError() {
        const loader = document.getElementById('tableLoader');
        if (loader) loader.innerHTML = `<p style="color:red;padding:20px;">Error de sincronización con Odoo.</p>`;
    },

    calcularEdad(fecha) {
        if (!fecha) return 0;
        const hoy   = new Date();
        const cumple = new Date(fecha);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        const m  = hoy.getMonth() - cumple.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
        return edad;
    },

    formatearFecha(fecha) {
        if (!fecha) return 'N/A';
        const [y, m, d] = fecha.split('-');
        return `${d}/${m}/${y}`;
    }
};

window.AlumnosUI = AlumnosUI;
