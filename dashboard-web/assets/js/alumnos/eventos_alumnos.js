// eventos_alumnos.js

// 1. VARIABLE GLOBAL PARA ASEGURAR EL DNI
window.activeDni = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CARGA INICIAL ---
    window.fetchAlumnos = function() {
        const tableBody = document.getElementById('tableBody');
        const loader = document.getElementById('tableLoader');
        if (!tableBody || !loader) return;

        AlumnosAPI.getAlumnos()
            .then(data => {
                const listaAlumnos = data.result?.alumnos || [];
                AlumnosUI.renderTable(listaAlumnos);
            })
            .catch(error => {
                console.error('Error:', error);
                AlumnosUI.showError();
            });
    };

    window.fetchAlumnos();

    // --- 2. ACTUALIZACIÓN DE PERMISOS (Transporte y Estado) ---
    document.addEventListener('change', async (e) => {
        const isTransporte = e.target.matches('input[data-field="permiso_transporte"]');
        const isEstado = e.target.matches('input[data-field="estado"]');

        if (isTransporte || isEstado) {
            const checkbox = e.target;
            const dni = checkbox.dataset.dni;
            const valor = checkbox.checked;
            const row = checkbox.closest('.table-row');

            if (row) {
                row.style.opacity = '0.6';
                row.style.pointerEvents = 'none';
            }

            try {
                const data = isTransporte 
                    ? await AlumnosAPI.updateTransporte(dni, valor)
                    : await AlumnosAPI.updateEstado(dni, valor);

                if (data.error) {
                    alert("Error de Odoo: " + (data.error.data?.message || "No se pudo actualizar"));
                    checkbox.checked = !valor;
                } else {
                    if (isTransporte) {
                        row.setAttribute('data-transporte', valor ? 'yes' : 'no');
                    } else {
                        row.setAttribute('data-estado', valor ? 'alta' : 'baja');
                    }
                }
            } catch (error) {
                alert("Error de conexión con el servidor");
                checkbox.checked = !valor;
            } finally {
                if (row) {
                    row.style.opacity = '1';
                    row.style.pointerEvents = 'auto';
                }
            }
        }
    });

    // --- 3. ELIMINACIÓN DE ALUMNOS ---
    const deleteModal = document.getElementById('deleteConfirmModal');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    const btnCancelDelete = document.getElementById('btnCancelDelete');

    window.alumniDniToDelete = null;

    window.confirmarEliminarAlumno = function(id, nombre) {
        window.alumniDniToDelete = id;
        const modal = document.getElementById('deleteConfirmModal');
        const nameSpan = document.getElementById('deleteAlumnoName');
        
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
        btnConfirmDelete.addEventListener('click', async () => {
            if (!window.alumniDniToDelete) return;
            const originalText = btnConfirmDelete.innerHTML;
            btnConfirmDelete.disabled = true;
            btnConfirmDelete.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Eliminando...';

            try {
                const data = await AlumnosAPI.deleteAlumno(window.alumniDniToDelete);
                const res = data.result || data;
                if (res.status === 'success' || !data.error) {
                    deleteModal.classList.remove('show');
                    window.fetchAlumnos();
                } else {
                    alert("Error: " + (data.error?.message || "No se pudo eliminar"));
                }
            } catch (error) {
                alert("Error de conexión");
            } finally {
                btnConfirmDelete.disabled = false;
                btnConfirmDelete.innerHTML = originalText;
                window.alumniDniToDelete = null;
            }
        });
    }

    // --- 4. DESVINCULAR NFC ALUMNO ---
    let activeUnlinkUidAlumno = null;

    window.confirmarDesvincularNFC = function(uid, nombre) {
        activeUnlinkUidAlumno = uid;
        const modal = document.getElementById('unlinkNfcAlumnoModal');
        const nameEl = document.getElementById('unlinkNfcAlumnoNombre');
        if (nameEl) nameEl.textContent = nombre;
        if (modal)  modal.classList.add('show');
    };

    const btnCancelUnlink = document.getElementById('btnCancelUnlinkAlumno');
    const btnConfirmUnlink = document.getElementById('btnConfirmUnlinkAlumno');
    const unlinkModal = document.getElementById('unlinkNfcAlumnoModal');

    if (btnCancelUnlink) {
        btnCancelUnlink.addEventListener('click', () => {
            unlinkModal.classList.remove('show');
            activeUnlinkUidAlumno = null;
        });
    }

    if (btnConfirmUnlink) {
        btnConfirmUnlink.addEventListener('click', async () => {
            if (!activeUnlinkUidAlumno) return;
            const originalText = btnConfirmUnlink.innerHTML;
            btnConfirmUnlink.disabled = true;
            btnConfirmUnlink.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Desvinculando...';

            try {
                const res = await fetch(GLOBALS.URL_UNLINK_CARD, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: activeUnlinkUidAlumno })
                }).then(r => r.json());

                if (res.error) throw new Error(res.error.message || 'Error al desvincular');
                unlinkModal.classList.remove('show');
                window.fetchAlumnos();
            } catch (err) {
                alert('Error al desvincular: ' + err.message);
            } finally {
                btnConfirmUnlink.disabled = false;
                btnConfirmUnlink.innerHTML = originalText;
                activeUnlinkUidAlumno = null;
            }
        });
    }

    // --- 5. EDICIÓN DE ALUMNOS ---
    const formEditAlumno = document.getElementById('formEditAlumno');
    if (formEditAlumno) {
        formEditAlumno.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Actualizando...';
            btn.disabled = true;

            const clase = document.getElementById('editAlumnoClase').value;
            const seccion = document.getElementById('editAlumnoSeccion').value;
            const datos = {
                id: document.getElementById('editAlumnoId').value,
                nombre: document.getElementById('editAlumnoNombre').value.trim(),
                apellidos: document.getElementById('editAlumnoApellidos').value.trim(),
                dni: document.getElementById('editAlumnoDni').value.trim(),
                fecha_nacimiento: document.getElementById('editAlumnoFecha').value,
                grupo_clase: `${clase} ${seccion}`
            };

            try {
                await AlumnosAPI.updateAlumno(datos);
                document.getElementById('editAlumnoModal').classList.remove('show');
                window.fetchAlumnos();
            } catch (err) {
                alert("Error al actualizar: " + err.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    const nfcInput = document.getElementById('nfcInputAlumnos');
    const nfcMsg = document.getElementById('nfcStatusMsgAlumnos');
    const imgStatus = document.getElementById('imgStatusNfc');
    const iconWaiting = document.getElementById('iconWaiting');

    const modalBox = document.querySelector('#modalNfcAlumnos .modal-box-vincular');
    const setColor = c => { if (modalBox) modalBox.style.borderTopColor = c; };

    if (nfcInput) {
        nfcInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const uid = nfcInput.value.trim();
                const dni = window.activeDni;

                if (!uid || !dni) return;

                iconWaiting.style.display = 'none';
                imgStatus.src = '../assets/img/logo_umbrella.png';
                imgStatus.style.display = 'block';
                imgStatus.classList.add('spinning-umbrella');
                nfcMsg.className = '';
                nfcMsg.innerHTML = 'Consultando con Odoo...';
                setColor('#3b82f6');

                try {
                    const res = await AlumnosAPI.assignCard(uid, dni);

                    if (res.status === 'error') throw new Error(res.message || 'Error al vincular');

                    imgStatus.classList.remove('spinning-umbrella');
                    imgStatus.src = '../assets/img/logo_umbrella_success.png';
                    nfcMsg.className = 'msg-success';
                    nfcMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${res.message || 'Vinculado con éxito'}`;
                    setColor('#10b981');

                    setTimeout(() => {
                        document.getElementById('modalNfcAlumnos').classList.remove('show');
                        window.fetchAlumnos();
                    }, 2000);

                } catch (err) {
                    imgStatus.classList.remove('spinning-umbrella');
                    imgStatus.src = '../assets/img/logo_umbrella_error.png';
                    nfcMsg.className = 'msg-error';
                    nfcMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${err.message}`;
                    setColor('#ef4444');

                    setTimeout(() => {
                        if (document.getElementById('modalNfcAlumnos').classList.contains('show')) {
                            nfcInput.value = '';
                            imgStatus.style.display = 'none';
                            iconWaiting.style.display = 'block';
                            nfcMsg.className = '';
                            nfcMsg.innerHTML = '<small><i class="fa-solid fa-spinner fa-spin"></i> Esperando señal...</small>';
                            setColor('#007bff');
                            nfcInput.focus();
                        }
                    }, 4000);
                }
            }
        });
    }
});

window.prepararEdicionAlumno = function(btn) {
    const d = btn.dataset;
    document.getElementById('editAlumnoId').value = d.id;
    document.getElementById('editAlumnoNombre').value = d.nombre;
    document.getElementById('editAlumnoApellidos').value = d.apellido;
    document.getElementById('editAlumnoDni').value = d.dni;
    document.getElementById('editAlumnoFecha').value = d.fecha;

    // Separar "4º ESO B" → clase="4º ESO", seccion="B"
    const partes = (d.grupo || '').trim().split(' ');
    const seccion = partes.length > 1 ? partes[partes.length - 1] : '';
    const clase = partes.length > 1 ? partes.slice(0, -1).join(' ') : d.grupo;
    document.getElementById('editAlumnoClase').value = clase;
    document.getElementById('editAlumnoSeccion').value = seccion;

    document.getElementById('editAlumnoModal').classList.add('show');
};

window.prepararAsignacionNFC = function(btn) {
    // 1. Extraer los datos del botón
    const dni = btn.getAttribute('data-dni');
    const nombre = btn.getAttribute('data-nombre');

    if (!dni || dni === "" || dni === "false") {
        alert("Este alumno no tiene DNI asignado en Odoo.");
        return;
    }

    // 2. Guardar DNI en la variable global para el lector NFC
    window.activeDni = dni;
    
    // 3. Referencias a elementos
    const modal = document.getElementById('modalNfcAlumnos');
    const nfcInput = document.getElementById('nfcInputAlumnos');
    const nfcName = document.getElementById('nfcStudentName');
    const imgStatus = document.getElementById('imgStatusNfc');
    const iconWaiting = document.getElementById('iconWaiting');
    const nfcMsg = document.getElementById('nfcStatusMsgAlumnos');

    if (modal && nfcInput) {
        // Reset Visual Total
        nfcName.textContent = nombre;
        nfcInput.value = '';
        
        // Mostrar icono de señal azul, ocultar imagen de Umbrella
        if (iconWaiting) iconWaiting.style.display = 'block';
        if (imgStatus) {
            imgStatus.style.display = 'none';
            imgStatus.classList.remove('spinning-umbrella');
        }
        
        // Mensaje inicial
        if (nfcMsg) {
            nfcMsg.className = '';
            nfcMsg.innerHTML = '<small><i class="fa-solid fa-spinner fa-spin"></i> Esperando señal...</small>';
        }

        // 4. Abrir modal
        modal.classList.add('show'); 
        setTimeout(() => nfcInput.focus(), 400); 
    }
};