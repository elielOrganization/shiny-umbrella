document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalNfc');
    const inputInvisible = document.getElementById('nfcInput');
    const statusMsg = document.getElementById('nfc-status-msg');

    const closeModalNfc = () => {
        modal.classList.remove('show');
        inputInvisible.value = '';
        statusMsg.innerHTML = '';
    };

    document.getElementById('btnOpenNfcModal').onclick = () => {
        modal.classList.add('show');
        statusMsg.innerHTML = '<small><i class="fa-solid fa-spinner fa-spin"></i> Esperando tarjeta...</small>';
        inputInvisible.value = '';
        inputInvisible.focus();
    };

    document.getElementById('closeModalNfc').onclick = closeModalNfc;

    modal.addEventListener('click', (e) => { if (e.target === modal) closeModalNfc(); });

    // Al detectar lectura (Enter)
    inputInvisible.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const uid = inputInvisible.value.trim();
            if (!uid) return;

            statusMsg.innerHTML = '<i class="fa-solid fa-sync fa-spin"></i> Procesando...';

            try {
                // Llamamos a la API y recibimos {status, message}
                const respuesta = await API_NFC.añadir(uid);

                if (respuesta.status === 'ok') {
                    // Mensaje de éxito de Odoo
                    UI_NFC.notificarModal(respuesta.message, 'ok');
                    
                    // Esperar y cerrar
                    setTimeout(async () => {
                        modal.style.display = "none";
                        await window.recargarTablaNfc();
                    }, 2000);

                } else {
                    // Mensaje de error de Odoo (ej: "UID ya existe" o "Formato inválido")
                    UI_NFC.notificarModal(respuesta.message, 'error');
                    
                    // Limpiar input para reintento
                    inputInvisible.value = "";
                    inputInvisible.focus();
                }

            } catch (error) {
                UI_NFC.notificarModal("Error técnico al conectar con el servidor", 'error');
            }
        }
    });

    const btnCancelDelete = document.getElementById('btnCancelDeleteNfc');
    if (btnCancelDelete) {
        btnCancelDelete.onclick = () => UI_NFC.cerrarModalEliminar();
    }

    // Botón Confirmar del Modal de Eliminación
    const btnConfirmDelete = document.getElementById('btnConfirmDeleteNfc');
    if (btnConfirmDelete) {
        btnConfirmDelete.onclick = async function() {
            const uid = this.getAttribute('data-uid');
            const originalText = this.innerHTML;
            
            this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Eliminando...';
            this.disabled = true;

            try {
                const respuesta = await API_NFC.eliminar(uid);
                if (respuesta.status === 'ok') {
                    UI_NFC.cerrarModalEliminar();
                    await window.recargarTablaNfc();
                } else {
                    alert("Error: " + respuesta.message);
                }
            } catch (error) {
                alert("Error técnico: " + error.message);
            } finally {
                this.innerHTML = originalText;
                this.disabled = false;
            }
        };
    }

    document.getElementById('btnCancelUnlinkNfc').onclick = () => UI_NFC.cerrarModalDesvincular();

    document.getElementById('btnConfirmUnlinkNfc').onclick = async function() {
        const uid = this.getAttribute('data-uid');
        this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
        
        try {
            const res = await API_NFC.desvincular(uid);
            if (res.status === 'ok') {
                UI_NFC.cerrarModalDesvincular();
                await window.recargarTablaNfc();
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            this.innerHTML = 'Desvincular';
        }
    };
});

window.eliminarCard = function(uid) {
    UI_NFC.abrirModalEliminar(uid);
};

window.desvincularCard = function(uid) {
    UI_NFC.abrirModalDesvincular(uid);
};