<!-- =====================================================
     modales_globales.php — Componentes de modal reutilizables
     Incluir en cualquier vista que necesite: eliminar, desvincular o vincular NFC
     ===================================================== -->

<!-- === COMPONENTE: ELIMINAR (genérico, rojo) === -->
<div id="modalEliminar" class="modal-overlay-custom">
    <div class="modal-box-custom modal-box-delete">
        <div class="modal-icon-circle" style="background:#fef2f2;">
            <i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i>
        </div>
        <div class="modal-title"><h3 id="modalEliminar-titulo">¿Estás seguro?</h3></div>
        <div class="modal-body">
            <p id="modalEliminar-cuerpo"></p>
        </div>
        <div class="modal-actions-row">
            <button type="button" class="btn-modal-base btn-modal-cancel" id="btnCancelEliminar">Cancelar</button>
            <button type="button" class="btn-modal-base btn-modal-delete" id="btnConfirmEliminar">Eliminar</button>
        </div>
    </div>
</div>

<!-- === COMPONENTE: DESVINCULAR NFC (genérico, ámbar) === -->
<div id="modalDesvincular" class="modal-overlay-custom">
    <div class="modal-box-custom modal-box-unlink">
        <div class="modal-icon-circle" style="background:#fef3c7;">
            <i class="fa-solid fa-link-slash" style="color:#d97706;"></i>
        </div>
        <div class="modal-title"><h3>¿Desvincular NFC?</h3></div>
        <div class="modal-body">
            <p id="modalDesvincular-cuerpo"></p>
        </div>
        <div class="modal-actions-row">
            <button type="button" class="btn-modal-base btn-modal-cancel" id="btnCancelDesvincular">Cancelar</button>
            <button type="button" class="btn-modal-base btn-modal-unlink" id="btnConfirmDesvincular">Desvincular</button>
        </div>
    </div>
</div>

<!-- === COMPONENTE: VINCULAR NFC (genérico, azul — escáner) === -->
<div id="modalVincularNfc" class="modal-overlay-custom">
    <div class="modal-box-custom modal-box-vincular">
        <button class="close-modal-btn" id="btnCerrarVincularNfc">&times;</button>

        <div class="nfc-icon-container">
            <i id="iconWaitingGlobal" class="fa-solid fa-rss pulse-nfc-icon"></i>
            <img id="imgStatusNfcGlobal"
                 src="../assets/img/logo_umbrella.png"
                 class="status-img-nfc"
                 alt="Estado"
                 style="display:none;">
        </div>

        <h3>Vinculando NFC</h3>
        <p style="color:#64748b;margin-bottom:5px;" id="modalVincularNfc-tipo-label"></p>
        <p><strong id="modalVincularNfc-nombre" style="color:#3b82f6;font-size:1.2rem;"></strong></p>

        <input type="text" id="nfcInputGlobal" tabindex="-1" style="position:absolute;opacity:0;pointer-events:none;">

        <div id="nfcStatusMsgGlobal" style="margin-top:20px;font-weight:bold;min-height:40px;">
            <small><i class="fa-solid fa-spinner fa-spin"></i> Esperando señal...</small>
        </div>
    </div>
</div>

<script src="../assets/js/modales_global.js"></script>
