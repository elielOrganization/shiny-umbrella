<div id="csvProfModal" class="modal-overlay">
    <div class="modal-card">
        <span class="close-modal" onclick="document.getElementById('csvProfModal').classList.remove('show')">&times;</span>
        <h3 class="modal-title">Importar Profesores</h3>
        <p class="modal-subtitle">Arrastra tu archivo CSV aquí o haz clic para subirlo.</p>
        
        <div class="upload-area" id="dropZoneProf">
            <i class="fa-solid fa-cloud-arrow-up upload-icon"></i>
            <p>Suelta el archivo CSV aquí</p>
            <input type="file" id="fileInputProf" accept=".csv" hidden>
        </div>
        
        <div class="processing-area" id="processingAreaProf" style="display: none;">
            <img src="../src/img/logo_umbrella.png" alt="Procesando" class="spinner-img" id="statusLogoProf">
            <p class="status-text" id="statusTextProf">Verificando archivo...</p>
        </div>

        <a href="#" id="btnAñadirManualProf" style="display: inline-block; margin-top: 18px; color: var(--primary-blue); text-decoration: none; font-size: 0.9rem; font-weight: 500;">
            Añadir manualmente
        </a>
    </div>
</div>

<div id="manualProfModal" class="modal-overlay">
    <div class="modal-card" style="max-width: 600px;"> 
        <span class="close-modal" onclick="document.getElementById('manualProfModal').classList.remove('show')">&times;</span>
        <h3 class="modal-title">Añadir Profesor Manualmente</h3>
        <p class="modal-subtitle">Introduce los datos del nuevo profesor para registrarlo en el sistema.</p>
        
        <form id="formManualProf" class="manual-form">
            <div class="form-grid">
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" name="nombre" placeholder="Ej. Juan" required>
                </div>
                <div class="form-group">
                    <label>Apellidos</label>
                    <input type="text" name="apellidos" placeholder="Ej. Pérez García" required>
                </div>
                <div class="form-group">
                    <label>DNI / NIE</label>
                    <input type="text" name="dni" placeholder="12345678Z" required>
                </div>
                <div class="form-group">
                    <label>Departamento</label>
                    <select name="departamento" required>
                        <option value="" disabled selected>Selecciona un departamento</option>
                        <option value="Matemáticas">Matemáticas</option>
                        <option value="Lengua">Lengua</option>
                        <option value="Inglés">Inglés</option>
                        <option value="Ciencias">Ciencias</option>
                        <option value="Historia">Historia</option>
                        <option value="Tecnología">Tecnología</option>
                    </select>
                </div>
            </div>

            <div class="modal-actions" style="margin-top: 30px; justify-content: flex-end; gap: 12px;">
                <button type="button" class="btn-cancel" onclick="document.getElementById('manualProfModal').classList.remove('show')">Cancelar</button>
                <button type="submit" class="btn-primary" style="padding: 10px 25px;">
                    <i class="fa-solid fa-save"></i> Guardar Profesor
                </button>
            </div>
        </form>
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

<div id="deleteConfirmModal" class="modal-overlay">
    <div class="modal-card modal-confirm">
        <div class="confirm-icon">
            <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 class="modal-title">¿Estás seguro?</h3>
        <p class="modal-subtitle">Esta acción eliminará permanentemente al profesor <strong id="deleteProfName"></strong> de la base de datos de Odoo.</p>
        
        <div class="confirm-actions">
            <button id="btnCancelDelete" class="btn-secondary">Cancelar</button>
            <button id="btnConfirmDelete" class="btn-danger">Eliminar Profesor</button>
        </div>
    </div>
</div>