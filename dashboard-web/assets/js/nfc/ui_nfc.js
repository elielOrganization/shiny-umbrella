// assets/js/nfc/ui_nfc.js
window.UI_NFC = {
    _allData:   [],
    _mapaUid:   {},
    _filtered:  [],
    _page:      1,
    POR_PAGINA: 10,

    renderizarTabla: function(listaCards, mapaUid = {}) {
        this._allData  = listaCards || [];
        this._mapaUid  = mapaUid;
        this._filtered = this._allData;
        this._page     = 1;
        this._renderPagina();
    },

    aplicarFiltros: function(searchTerm, activoChecked, vinculoChecked) {
        this._filtered = this._allData.filter(item => {
            const cardUid = item.uid || '';
            const persona = this._mapaUid[cardUid];
            const activo  = item.activo ? 'activo' : 'inactivo';
            const vinculo = persona ? 'vinculada' : 'libre';
            const texto   = (cardUid + ' ' + (persona || '')).toLowerCase();

            if (searchTerm        && !texto.includes(searchTerm))               return false;
            if (activoChecked.length > 0  && !activoChecked.includes(activo))   return false;
            if (vinculoChecked.length > 0 && !vinculoChecked.includes(vinculo)) return false;
            return true;
        });
        this._page = 1;
        this._renderPagina();
    },

    _renderPagina: function() {
        const tableBody = document.getElementById('tableBodyNfc');
        if (!tableBody) return;

        const total     = this._filtered.length;
        const totalPags = Math.max(1, Math.ceil(total / this.POR_PAGINA));
        const inicio    = (this._page - 1) * this.POR_PAGINA;
        const pagina    = this._filtered.slice(inicio, inicio + this.POR_PAGINA);
        const offsetIdx = inicio;

        if (!total) {
            tableBody.innerHTML = '<div style="padding:20px;text-align:center;color:#666;">No hay tarjetas registradas.</div>';
            return;
        }

        let html = '';
        pagina.forEach((item, i) => {
            const cardUid = item.uid || '';
            const persona = this._mapaUid[cardUid];

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
                <div><strong>${offsetIdx + i + 1}</strong></div>
                <div>
                    <span class="nfc-id-tag"><i class="fa-solid fa-rss"></i>${cardUid || 'SIN UID'}</span>
                </div>
                <div>${vinculadoBadge}</div>
                <div class="text-center">
                    <i class="fa-solid ${item.activo ? 'fa-circle-check' : 'fa-circle-xmark'}"
                       style="color:${item.activo ? '#16a34a' : '#dc3545'};font-size:1.2rem;"></i>
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

        const paginacion = totalPags > 1 ? `
            <div class="logs-pagination">
                <button class="logs-page-btn" onclick="UI_NFC._cambiarPagina(-1)" ${this._page === 1 ? 'disabled' : ''}>
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <span class="logs-page-info">${this._page} / ${totalPags}</span>
                <button class="logs-page-btn" onclick="UI_NFC._cambiarPagina(1)" ${this._page === totalPags ? 'disabled' : ''}>
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>` : '';

        tableBody.innerHTML = html + paginacion;
    },

    _cambiarPagina: function(dir) {
        const totalPags = Math.max(1, Math.ceil(this._filtered.length / this.POR_PAGINA));
        const body      = document.getElementById('tableBodyNfc');

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

    abrirModalEliminar: function(uid) {
        Modales.abrirEliminar({
            titulo:   '¿Eliminar tarjeta?',
            cuerpo:   `Esta acción eliminará permanentemente la tarjeta <strong style="color:#ef4444;font-family:monospace;">${uid}</strong> de la base de datos.`,
            btnTexto: 'Sí, eliminar',
            onConfirm: async () => {
                const res = await API_NFC.eliminar(uid);
                if (res.status !== 'ok') throw new Error(res.message || 'Error al eliminar');
                Modales.cerrarEliminar();
                await window.recargarTablaNfc();
            }
        });
    },

    cerrarModalEliminar: function() { Modales.cerrarEliminar(); },

    notificarModal: function(mensaje, tipo) {
        const statusMsg = document.getElementById('nfc-status-msg');
        if (!statusMsg) return;
        if (tipo === 'ok') {
            statusMsg.innerHTML = `
                <div style="color:#28a745;background:#e8f5e9;padding:10px;border-radius:8px;">
                    <i class="fa-solid fa-circle-check"></i> ${mensaje}
                </div>`;
        } else {
            statusMsg.innerHTML = `
                <div style="color:#dc3545;background:#fbe9e7;padding:10px;border-radius:8px;">
                    <i class="fa-solid fa-circle-xmark"></i> ${mensaje}
                </div>`;
        }
    },

    abrirModalDesvincular: function(uid) {
        Modales.abrirDesvincular({
            cuerpo:   `La tarjeta <strong style="color:#d97706;font-family:monospace;">${uid}</strong> dejará de estar operativa pero se mantendrá en el sistema.`,
            onConfirm: async () => {
                const res = await API_NFC.desvincular(uid);
                if (res.status !== 'ok') throw new Error(res.message || 'Error al desvincular');
                Modales.cerrarDesvincular();
                await window.recargarTablaNfc();
            }
        });
    },

    cerrarModalDesvincular: function() { Modales.cerrarDesvincular(); }
};
