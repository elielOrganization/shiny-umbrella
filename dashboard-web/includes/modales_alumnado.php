<div id="csvModal" class="modal-overlay">
    <div class="modal-card">
        <span class="close-modal">&times;</span>
        <h3 class="modal-title">Importar Alumnado</h3>
        <p class="modal-subtitle">Arrastra tu archivo CSV aquí o haz clic para subirlo.</p>
        <div class="upload-area" id="dropZone">
            <i class="fa-solid fa-cloud-arrow-up upload-icon"></i>
            <p>Suelta el archivo CSV aquí</p>
            <input type="file" id="fileInput" accept=".csv" hidden>
        </div>
        <div class="processing-area" id="processingArea" style="display: none;">
            <img src="../src/img/logo_umbrella.png" alt="Procesando" class="spinner-img" id="statusLogo">
            <p class="status-text" id="statusText">Verificando archivo...</p>
        </div>
    </div>
</div>

<div id="nfcModal" class="modal-overlay">
    <div class="modal-card">
        <span class="close-modal close-nfc">&times;</span>
        <h3 class="modal-title">Vincular Tarjeta NFC</h3>
        <p class="modal-subtitle">Acerca la tarjeta al lector o introduce el ID manualmente.</p>
        <div class="nfc-input-area" id="nfcContent">
            <div class="nfc-icon-container">
                <i class="fa-solid fa-wifi nfc-wave"></i>
                <i class="fa-solid fa-address-card nfc-card"></i>
            </div>
            <div class="input-group" style="text-align: left; margin-top: 20px;">
                <label style="font-size: 0.85rem; font-weight: 600; color: #374151;">NFC ID</label>
                <input type="text" id="nfcInput" class="input-field" placeholder="Ej: E4:55:A1:09" style="margin-top: 5px;">
            </div>
            <div class="modal-actions">
                <button class="btn-cancel" id="btnCancelNfc">Cancelar</button>
                <button class="btn-primary" id="btnSaveNfc" style="width: auto; justify-content: center;">Guardar</button>
            </div>
        </div>
        <div class="processing-area" id="nfcProcessing" style="display: none;">
            <img src="../src/img/logo_umbrella.png" alt="Procesando" class="spinner-img" id="nfcStatusLogo">
            <p class="status-text" id="nfcStatusText">Vinculando tarjeta...</p>
        </div>
    </div>
</div>

<div id="nfcConflictModal" class="modal-overlay" style="z-index: 1100;">
    <div class="modal-card">
        <div style="color: #f59e0b; font-size: 3rem; margin-bottom: 10px;">
            <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 class="modal-title">Tarjeta ya asignada</h3>
        <p class="modal-subtitle">
            El ID <span id="conflictID" class="text-mono" style="font-weight:bold;"></span> ya pertenece a un alumno.
            <br>¿Deseas desvincularla y asignar esta tarjeta al alumno actual?
        </p>
        <div class="modal-actions" style="justify-content: center; gap: 15px;">
            <button class="btn-cancel" id="btnCancelReplace">Cancelar</button>
            <button class="btn-primary" id="btnConfirmReplace" style="background-color: #f59e0b; border: none;">Sí, Reemplazar</button>
        </div>
    </div>
</div>

<div id="nfcOverwriteModal" class="modal-overlay" style="z-index: 1200;">
    <div class="modal-card">
        <div style="color: #3b82f6; font-size: 3rem; margin-bottom: 10px;">
            <i class="fa-solid fa-rotate"></i>
        </div>
        <h3 class="modal-title">¿Reemplazar escaneo?</h3>
        <p class="modal-subtitle">
            Ya tienes el código <span id="oldScanValue" class="text-mono" style="text-decoration: line-through;"></span>.
            <br>¿Quieres sustituirlo por el nuevo escaneo <span id="newScanValue" class="text-mono" style="color:#3b82f6;"></span>?
        </p>
        <div class="modal-actions" style="justify-content: center; gap: 15px;">
            <button class="btn-cancel" id="btnCancelOverwrite">Mantener anterior</button>
            <button class="btn-primary" id="btnConfirmOverwrite">Sustituir</button>
        </div>
    </div>
</div>