<?php include '../includes/modales_globales.php'; ?>

<!-- Modal: Añadir tarjeta NFC al sistema (específico de vinculacion.php) -->
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
