// assets/js/nfc/ui_nfc.js
window.UI_NFC = {
    renderizarTabla: function(listaCards) {
        const tableBody = document.getElementById('tableBodyNfc');
        if (!tableBody) return;

        // (Las validaciones de array se mantienen igual...)

        if (listaCards.length === 0) {
            tableBody.innerHTML = '<div style="padding:20px; text-align:center; color: #666;">No hay tarjetas registradas.</div>';
            return;
        }

        let html = '';
        listaCards.forEach((item, index) => {
            // Usamos 'item.uid' como identificador único para las acciones
            const cardUid = item.uid || ''; 

            let botonDesvincular = '';
            if (item.activo) {
                botonDesvincular = `
                    <button class="btn-shiny btn-orange-shiny" title="Desvincular" onclick="desvincularCard('${item.uid}')">
                        <i class="fa-solid fa-link-slash"></i>
                    </button>`;
            } else {
                botonDesvincular = `<div style="width: 30px;"></div>`; 
            }

            html += `
            <div class="table-row table-grid-nfc">
                <div data-label="ID"><strong>${index + 1}</strong></div>
                
                <div data-label="UID">
                    <code style="background: #f4f4f4; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #333;">
                        ${cardUid || 'SIN UID'}
                    </code>
                </div>
                
                <div class="text-center" data-label="Activo">
                    <i class="fa-solid ${item.activo ? 'fa-circle-check' : 'fa-circle-xmark'}" 
                    style="color: ${item.activo ? '#28a745' : '#dc3545'}; font-size: 1.2rem;"></i>
                </div>
                
                <div class="text-center" data-label="Acciones">
                    <div class="nfc-actions-wrapper">
                        ${botonDesvincular}
                        <button class="btn-shiny btn-red-shiny" title="Eliminar" onclick="eliminarCard('${item.uid}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        });
        tableBody.innerHTML = html;
    },

    abrirModalEliminar: function(uid) {
        const modal = document.getElementById('deleteNfcModal');
        const textElement = document.getElementById('deleteNfcUidText');
        if (modal && textElement) {
            textElement.textContent = uid;
            modal.style.display = 'flex';
            // Guardamos el UID en un atributo del botón para recuperarlo al confirmar
            document.getElementById('btnConfirmDeleteNfc').setAttribute('data-uid', uid);
        }
    },

    cerrarModalEliminar: function() {
        const modal = document.getElementById('deleteNfcModal');
        if (modal) modal.style.display = 'none';
    }
};

window.UI_NFC.notificarModal = function(mensaje, tipo) {
    const statusMsg = document.getElementById('nfc-status-msg');
    if (!statusMsg) return;

    if (tipo === 'ok') {
        statusMsg.innerHTML = `
            <div style="color: #28a745; background: #e8f5e9; padding: 10px; border-radius: 8px;">
                <i class="fa-solid fa-circle-check"></i> ${mensaje}
            </div>`;
    } else {
        statusMsg.innerHTML = `
            <div style="color: #dc3545; background: #fbe9e7; padding: 10px; border-radius: 8px;">
                <i class="fa-solid fa-circle-xmark"></i> ${mensaje}
            </div>`;
    }
};

window.UI_NFC.abrirModalDesvincular = function(uid) {
    const modal = document.getElementById('unlinkNfcModal');
    document.getElementById('unlinkNfcUidText').textContent = uid;
    document.getElementById('btnConfirmUnlinkNfc').setAttribute('data-uid', uid);
    modal.style.display = 'flex';
};

window.UI_NFC.cerrarModalDesvincular = function() {
    document.getElementById('unlinkNfcModal').style.display = 'none';
};