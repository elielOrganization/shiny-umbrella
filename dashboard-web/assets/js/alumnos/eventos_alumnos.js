// eventos_alumnos.js

window.activeDni = null;

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CARGA INICIAL ---
    window.fetchAlumnos = function() {
        const tableBody = document.getElementById('tableBody');
        const loader    = document.getElementById('tableLoader');
        if (!tableBody || !loader) return;

        AlumnosAPI.getAlumnos()
            .then(data => {
                const listaAlumnos = data.result?.alumnos || [];
                AlumnosUI.renderTable(listaAlumnos);
            })
            .catch(() => AlumnosUI.showError());
    };

    window.fetchAlumnos();

    // --- 2. ACTUALIZACIÓN DE PERMISOS ---
    document.addEventListener('change', async (e) => {
        const isTransporte = e.target.matches('input[data-field="permiso_transporte"]');
        const isEstado     = e.target.matches('input[data-field="estado"]');
        if (!isTransporte && !isEstado) return;

        const checkbox = e.target;
        const dni      = checkbox.dataset.dni;
        const valor    = checkbox.checked;
        const row      = checkbox.closest('.table-row');

        if (row) { row.style.opacity = '0.6'; row.style.pointerEvents = 'none'; }

        try {
            const data = isTransporte
                ? await AlumnosAPI.updateTransporte(dni, valor)
                : await AlumnosAPI.updateEstado(dni, valor);

            if (data.error) {
                alert('Error de Odoo: ' + (data.error.data?.message || 'No se pudo actualizar'));
                checkbox.checked = !valor;
            } else if (row) {
                row.setAttribute(isTransporte ? 'data-transporte' : 'data-estado', valor ? 'yes' : 'no');
            }
        } catch {
            alert('Error de conexión con el servidor');
            checkbox.checked = !valor;
        } finally {
            if (row) { row.style.opacity = '1'; row.style.pointerEvents = 'auto'; }
        }
    });

    // --- 3. ELIMINACIÓN DE ALUMNOS ---
    window.confirmarEliminarAlumno = function(dni, nombre) {
        Modales.abrirEliminar({
            titulo:   '¿Eliminar alumno?',
            cuerpo:   `Esta acción eliminará permanentemente a <strong style="color:#ef4444;">${nombre}</strong> de la base de datos de Odoo.`,
            btnTexto: 'Eliminar Alumno',
            onConfirm: async () => {
                const data = await AlumnosAPI.deleteAlumno(dni);
                const res  = data.result || data;
                if (res.status === 'success' || !data.error) {
                    Modales.cerrarEliminar();
                    window.fetchAlumnos();
                } else {
                    throw new Error(data.error?.message || 'No se pudo eliminar');
                }
            }
        });
    };

    // --- 4. DESVINCULAR NFC ALUMNO ---
    window.confirmarDesvincularNFC = function(uid, nombre) {
        Modales.abrirDesvincular({
            cuerpo:   `Se desvinculará la tarjeta de <strong style="color:#d97706;">${nombre}</strong>. La tarjeta permanecerá en el sistema.`,
            onConfirm: async () => {
                const res = await fetch(GLOBALS.URL_UNLINK_CARD, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ uid })
                }).then(r => r.json());

                if (res.error) throw new Error(res.error.message || 'Error al desvincular');
                Modales.cerrarDesvincular();
                window.fetchAlumnos();
            }
        });
    };

    // --- 5. EDICIÓN DE ALUMNOS ---
    const formEditAlumno = document.getElementById('formEditAlumno');
    if (formEditAlumno) {
        formEditAlumno.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn  = this.querySelector('button[type="submit"]');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Actualizando...';
            btn.disabled  = true;

            const clase   = document.getElementById('editAlumnoClase').value;
            const seccion = document.getElementById('editAlumnoSeccion').value;
            const datos   = {
                id:              document.getElementById('editAlumnoId').value,
                nombre:          document.getElementById('editAlumnoNombre').value.trim(),
                apellidos:       document.getElementById('editAlumnoApellidos').value.trim(),
                dni:             document.getElementById('editAlumnoDni').value.trim(),
                fecha_nacimiento: document.getElementById('editAlumnoFecha').value,
                grupo_clase:     `${clase} ${seccion}`
            };

            try {
                await AlumnosAPI.updateAlumno(datos);
                document.getElementById('editAlumnoModal').classList.remove('show');
                window.fetchAlumnos();
            } catch (err) {
                alert('Error al actualizar: ' + err.message);
            } finally {
                btn.innerHTML = orig;
                btn.disabled  = false;
            }
        });
    }
});

// --- EDITAR ALUMNO (desde onclick en tabla) ---
window.prepararEdicionAlumno = function(btn) {
    const d = btn.dataset;
    document.getElementById('editAlumnoId').value       = d.id;
    document.getElementById('editAlumnoNombre').value   = d.nombre;
    document.getElementById('editAlumnoApellidos').value = d.apellido;
    document.getElementById('editAlumnoDni').value      = d.dni;
    document.getElementById('editAlumnoFecha').value    = d.fecha;

    const partes  = (d.grupo || '').trim().split(' ');
    const seccion = partes.length > 1 ? partes[partes.length - 1] : '';
    const clase   = partes.length > 1 ? partes.slice(0, -1).join(' ') : d.grupo;
    document.getElementById('editAlumnoClase').value   = clase;
    document.getElementById('editAlumnoSeccion').value = seccion;

    document.getElementById('editAlumnoModal').classList.add('show');
};

// --- VINCULAR NFC (desde onclick en tabla) ---
window.prepararAsignacionNFC = function(btn) {
    const dni    = btn.getAttribute('data-dni');
    const nombre = btn.getAttribute('data-nombre');

    if (!dni || dni === '' || dni === 'false') {
        alert('Este alumno no tiene DNI asignado en Odoo.');
        return;
    }

    window.activeDni = dni;

    Modales.abrirVincularNfc({
        nombre,
        tipoLabel: 'Alumno',
        onAssign:  (uid) => AlumnosAPI.assignCard(uid, dni),
        onSuccess: () => window.fetchAlumnos()
    });
};
