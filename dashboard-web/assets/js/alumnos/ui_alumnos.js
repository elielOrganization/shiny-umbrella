// ui_alumnos.js
const AlumnosUI = {
    renderTable(listaAlumnos) {
        const tableBody = document.getElementById('tableBody');
        const loader = document.getElementById('tableLoader');
        if (!tableBody || !loader) return;

        loader.style.display = 'none';

        if (listaAlumnos.length === 0) {
            tableBody.innerHTML = `<div style="padding:40px; text-align:center;">No hay alumnos registrados.</div>`;
            return;
        }

        let html = '';
        listaAlumnos.forEach(alumno => {
            const dniRaw = alumno.dni || alumno.vat || "";
            const dniLimpio = (dniRaw === false) ? "" : String(dniRaw).trim();
            const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`.replace(/'/g, "");
            const edad = this.calcularEdad(alumno.fecha_nacimiento);
            const tieneNFC = alumno.uid && alumno.uid !== "";
            
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

        tableBody.innerHTML = html;
        console.log("Tabla renderizada, aplicando filtros si existen...");
        if (typeof window.applyFilters === 'function') {
            window.applyFilters();
        }
    },

    showError() {
        const loader = document.getElementById('tableLoader');
        if (loader) {
            loader.innerHTML = `<p style="color:red; padding:20px;">Error de sincronización con Odoo.</p>`;
        }
    },

    calcularEdad(fecha) {
        if (!fecha) return 0;
        const hoy = new Date();
        const cumple = new Date(fecha);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        const m = hoy.getMonth() - cumple.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
        return edad;
    },

    formatearFecha(fecha) {
        if (!fecha) return 'N/A';
        const [y, m, d] = fecha.split('-');
        return `${d}/${m}/${y}`;
    }
};