// assets/js/nfc/ui_nfc.js
window.UI_NFC = {
    renderizarTabla: function(listaCards, mapaUid = {}) {
        const tableBody = document.getElementById('tableBodyNfc');
        if (!tableBody) return;

        if (listaCards.length === 0) {
            tableBody.innerHTML = '<div style="padding:20px; text-align:center; color: #666;">No hay tarjetas registradas.</div>';
            return;
        }

        let html = '';
        listaCards.forEach((item, index) => {
            const cardUid = item.uid || '';
            const persona = mapaUid[cardUid];

            const vinculadoBadge = persona
                ? `<span class="vinculado-badge"><i class="fa-solid fa-user"></i>${persona}</span>`
                : `<span class="libre-badge"><i class="fa-solid fa-circle-minus"></i>Libre</span>`;

            const botonDesvincular = item.activo
                ? `<button class="btn-table-action edit" title="Desvincular" onclick="desvincularCard('${cardUid}')">
                       <i class="fa-solid fa-link-slash"></i>
                   </button>`
                : `<div style="width:30px;"></div>`;

            html += `
            <div class="table-row table-grid-nfc"
                data-activo="${item.activo ? 'activo' : 'inactivo'}"
                data-vinculo="${persona ? 'vinculada' : 'libre'}">
                <div><strong>${index + 1}</strong></div>

                <div>
                    <span class="nfc-id-tag"><i class="fa-solid fa-rss"></i>${cardUid || 'SIN UID'}</span>
                </div>

                <div>${vinculadoBadge}</div>

                <div class="text-center">
                    <i class="fa-solid ${item.activo ? 'fa-circle-check' : 'fa-circle-xmark'}"
                       style="color: ${item.activo ? '#16a34a' : '#dc3545'}; font-size: 1.2rem;"></i>
                </div>

                <div class="text-center">
                    <div class="nfc-actions-wrapper">
                        ${botonDesvincular}
                        <button class="btn-table-action delete" title="Eliminar" onclick="eliminarCard('${cardUid}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        });
        tableBody.innerHTML = html;
        if (typeof window.applyNfcFilters === 'function') window.applyNfcFilters();
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