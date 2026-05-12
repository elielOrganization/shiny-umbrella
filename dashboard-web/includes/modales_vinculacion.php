<style>
    .pulse-nfc-icon {
        font-size: 3.5rem;
        color: #3b82f6;
        margin-bottom: 18px;
        display: block;
        animation: pulse 2s infinite;
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1);    opacity: 1;   }
        50%       { transform: scale(1.15); opacity: 0.65; }
    }
    #nfc-status-msg { min-height: 42px; font-weight: 600; }
</style>

<!-- Modal: Vincular NFC -->
<div id="modalNfc" class="modal-overlay-custom">
    <div class="modal-box-custom modal-box-vincular">
        <button class="close-modal-btn" id="closeModalNfc">&times;</button>
        <i class="fa-solid fa-rss pulse-nfc-icon"></i>
        <div class="modal-title"><h3>Vincular NFC</h3></div>
        <div class="modal-body">
            <p>Acerque la tarjeta o llavero al lector NFC...</p>
        </div>
        <input type="text" id="nfcInput" style="position:absolute;opacity:0;pointer-events:none;">
        <div id="nfc-status-msg"></div>
    </div>
</div>

<!-- Modal: Eliminar tarjeta NFC -->
<div id="deleteNfcModal" class="modal-overlay-custom">
    <div class="modal-box-custom modal-box-delete">
        <div class="modal-icon-circle" style="background:#fef2f2;">
            <i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i>
        </div>
        <div class="modal-title"><h3>¿Estás seguro?</h3></div>
        <div class="modal-body">
            <p>Esta acción eliminará permanentemente la tarjeta <strong id="deleteNfcUidText" style="color:#ef4444;font-family:monospace;"></strong> de la base de datos.</p>
        </div>
        <div class="modal-actions-row">
            <button type="button" class="btn-modal-base btn-modal-cancel" id="btnCancelDeleteNfc">Cancelar</button>
            <button type="button" class="btn-modal-base btn-modal-delete" id="btnConfirmDeleteNfc">Sí, eliminar</button>
        </div>
    </div>
</div>

<!-- Modal: Desvincular tarjeta NFC -->
<div id="unlinkNfcModal" class="modal-overlay-custom">
    <div class="modal-box-custom modal-box-unlink">
        <div class="modal-icon-circle" style="background:#fef3c7;">
            <i class="fa-solid fa-link-slash" style="color:#d97706;"></i>
        </div>
        <div class="modal-title"><h3>¿Desvincular tarjeta?</h3></div>
        <div class="modal-body">
            <p>La tarjeta <strong id="unlinkNfcUidText" style="color:#d97706;font-family:monospace;"></strong> dejará de estar operativa pero se mantendrá en el sistema.</p>
        </div>
        <div class="modal-actions-row">
            <button type="button" class="btn-modal-base btn-modal-cancel" id="btnCancelUnlinkNfc">Cancelar</button>
            <button type="button" class="btn-modal-base btn-modal-unlink" id="btnConfirmUnlinkNfc">Desvincular</button>
        </div>
    </div>
</div>
