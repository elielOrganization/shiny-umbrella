// table.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CARGAR LA TABLA AL INICIO ---
    fetchAlumnos();

    function fetchAlumnos() {
        const tableBody = document.getElementById('tableBody');
        const loader = document.getElementById('tableLoader');
        if (!tableBody || !loader) return;

        fetch(GLOBALS.URL_GET_ALUMNOS)
            .then(response => response.json())
            .then(data => {
                const listaAlumnos = data.result?.alumnos || [];
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

                        <div class="student-name">${alumno.apellido || ''}, ${alumno.nombre || ''}</div>
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
                                <input type="checkbox" ${alumno.permiso_salida ? 'checked' : ''} disabled>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="bool-cell">
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
                                onclick="prepararEdicionAlumno('${alumno.id}', '${alumno.nombre}', '${alumno.apellido}', '${alumno.dni}', '${alumno.fecha_nacimiento}', '${alumno.grupo_clase}')" >
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
            })
            .catch(error => {
                loader.innerHTML = `<p style="color:red; padding:20px;">Error de sincronización con Odoo.</p>`;
                console.error('Error:', error);
            });
    }

    // 2. GESTIÓN DE ACTUALIZACIÓN DE PERMISOS
    document.addEventListener('change', (e) => {
        // Detectamos si el cambio viene de un switch de transporte
        if (e.target.matches('input[data-field="permiso_transporte"]')) {
            const checkbox = e.target;
            const dni = checkbox.dataset.dni;
            const valor = checkbox.checked;

            const row = checkbox.closest('.table-row');
            if (row) {
                row.style.opacity = '0.6';
                row.style.pointerEvents = 'none';
            }

            fetch(GLOBALS.URL_UPDATE_TRANSPORTE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni: dni, valor: valor })
            })
            .then(res => res.json())
            .then(data => {
                row.style.opacity = '1';
                row.style.pointerEvents = 'auto';

                if (data.error) {
                    alert("Error de Odoo: " + (data.error.data?.message || "No se pudo actualizar"));
                    checkbox.checked = !valor;
                } else {
                    row.setAttribute('data-transporte', valor ? 'yes' : 'no');
                    console.log(`Transporte actualizado para ${dni}: ${valor}`);
                }
            })
            .catch(() => {
                row.style.opacity = '1';
                row.style.pointerEvents = 'auto';
                alert("Error de conexión con el servidor");
                checkbox.checked = !valor;
            });
        }

        // Detectamos si el cambio viene de un switch de estado
        if (e.target.matches('input[data-field="estado"]')) {
            const checkbox = e.target;
            const dni = checkbox.dataset.dni;
            const valor = checkbox.checked;

            const row = checkbox.closest('.table-row');
            if (row) {
                row.style.opacity = '0.6';
                row.style.pointerEvents = 'none';
            }

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
                    alert("Error de Odoo: " + (data.error.data?.message || "No se pudo actualizar"));
                    checkbox.checked = !valor;
                } else {
                    row.setAttribute('data-estado', valor ? 'alta' : 'baja');
                }
            })
            .catch(() => {
                row.style.opacity = '1';
                row.style.pointerEvents = 'auto';
                alert("Error de conexión con el servidor");
                checkbox.checked = !valor;
            });
        }
    });

    // 3. Gestión de eliminación de alumnos
    const deleteModal = document.getElementById('deleteConfirmModal');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    const btnCancelDelete = document.getElementById('btnCancelDelete');

    window.alumniDniToDelete = null;

    window.confirmarEliminarAlumno = function(id, nombre) {
        window.alumniDniToDelete = id;
        const modal = document.getElementById('deleteConfirmModal');
        const nameSpan = document.getElementById('deleteProfName');
        
        if (modal) {
            if (nameSpan) nameSpan.textContent = nombre;
            modal.classList.add('show');
        }
    };

    if (btnCancelDelete) {
        btnCancelDelete.addEventListener('click', () => {
            deleteModal.classList.remove('show');
            window.alumniDniToDelete = null;
        });
    }

    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', () => {
            if (!window.alumniDniToDelete) return;

            const originalText = btnConfirmDelete.innerHTML;
            btnConfirmDelete.disabled = true;
            btnConfirmDelete.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Eliminando...';

            fetch(GLOBALS.URL_DELETE_PERSONA, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni: window.alumniDniToDelete })
            })
            .then(res => res.json())
            .then(data => {
                const res = data.result || data;
                if (res.status === 'success' || !data.error) {
                    deleteModal.classList.remove('show');
                    fetchAlumnos();
                } else {
                    alert("Error: " + (data.error?.message || "No se pudo eliminar"));
                }
            })
            .catch(() => alert("Error de conexión con el servidor"))
            .finally(() => {
                btnConfirmDelete.disabled = false;
                btnConfirmDelete.innerHTML = originalText;
                window.alumniDniToDelete = null;
            });
        });
    }

    // 4. Funciones auxiliares
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