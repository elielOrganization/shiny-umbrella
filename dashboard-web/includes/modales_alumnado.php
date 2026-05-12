<style>
/* --- Overlay con desenfoque --- */
.modal-overlay-custom {
    display: none;
    position: fixed;
    z-index: 9999;
    left: 0; top: 0;
    width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-overlay-custom.show {
    display: flex;
    opacity: 1;
}

/* --- Caja del Modal --- */
.modal-box-vincular {
    background-color: #fff;
    border-radius: 20px;
    padding: 35px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border-top: 6px solid #007bff;
    transform: scale(0.9) translateY(20px);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-overlay-custom.show .modal-box-vincular {
    transform: scale(1) translateY(0);
}

/* --- Icono y Estados --- */
.nfc-icon-container {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.pulse-nfc-icon {
    font-size: 4rem;
    color: #007bff;
    animation: pulse 2s infinite;
}

.status-img-nfc {
    width: 85px;
    display: none; /* Se activa por JS */
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
}

/* Mensaje de estado */
#nfcStatusMsgAlumnos {
    margin-top: 20px;
    font-weight: 700;
    color: #64748b;
    font-size: 1rem;
}

.modal-box-vincular {
    position: relative; /* Necesario para que la X se posicione respecto a la caja */
    padding-top: 40px;
}

.close-modal-btn {
    position: absolute;
    top: 15px;
    right: 20px;
    font-size: 28px;
    font-weight: bold;
    color: #94a3b8;
    cursor: pointer;
    line-height: 1;
    transition: color 0.2s;
}

.close-modal-btn:hover {
    color: #ef4444;
}

/* Estilos de los mensajes de Odoo */
#nfcStatusMsgAlumnos {
    margin-top: 20px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.msg-success { color: #10b981; }
.msg-error { color: #ef4444; }

/* Animación para el logo cuando está cargando */
.spinning-umbrella {
    animation: rotateUmbrella 2s linear infinite;
}
@keyframes rotateUmbrella {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

</style>

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

        <a href="#" id="btnAñadirManual" style="display: inline-block; margin-top: 18px; color: var(--primary-blue); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
            Añadir manualmente
        </a>
    </div>
</div>

<div id="manualStudentModal" class="modal-overlay">
    <div class="modal-card" style="max-width: 600px;"> 
        <span class="close-modal">&times;</span>
        <h3 class="modal-title">Añadir Alumno Manualmente</h3>
        <p class="modal-subtitle">Introduce los datos del nuevo alumno para registrarlo en el sistema.</p>
        
        <form id="formManualStudent" class="manual-form">
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
                    <label>Fecha de Nacimiento</label>
                    <input type="date" name="fecha_nacimiento" required>
                </div>
                <div class="form-group">
                    <label>Clase</label>
                    <select name="clase" required>
                        <option value="" disabled selected>Selecciona clase</option>
                        <option value="1º ESO">1º ESO</option>
                        <option value="2º ESO">2º ESO</option>
                        <option value="3º ESO">3º ESO</option>
                        <option value="4º ESO">4º ESO</option>
                        <option value="1º BACH">1º BACH</option>
                        <option value="2º BACH">2º BACH</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sección</label>
                    <select name="seccion" required>
                        <option value="" disabled selected>Sección</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>
                </div>
            </div>

            <div class="modal-actions" style="margin-top: 30px; justify-content: flex-end; gap: 12px;">
                <button type="button" class="btn-cancel">Cancelar</button>
                <button type="submit" class="btn-primary" style="padding: 10px 25px;">
                    <i class="fa-solid fa-save"></i> Guardar Alumno
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Modal NFC antiguo (reemplazado por modalNfcAlumnos) -->

<div id="deleteConfirmModal" class="modal-overlay-custom">
    <div class="modal-box-custom modal-box-delete">
        <div class="modal-icon-circle" style="background:#fef2f2;">
            <i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i>
        </div>
        <div class="modal-title"><h3>¿Estás seguro?</h3></div>
        <div class="modal-body">
            <p>Esta acción eliminará permanentemente al alumno <strong id="deleteAlumnoName" style="color:#ef4444;"></strong> de la base de datos de Odoo.</p>
        </div>
        <div class="modal-actions-row">
            <button id="btnCancelDelete" class="btn-modal-base btn-modal-cancel">Cancelar</button>
            <button id="btnConfirmDelete" class="btn-modal-base btn-modal-delete">Eliminar Alumno</button>
        </div>
    </div>
</div>

<div id="editAlumnoModal" class="modal-overlay">
    <div class="modal-card" style="max-width: 600px;">
        <span class="close-modal" onclick="document.getElementById('editAlumnoModal').classList.remove('show')">&times;</span>
        <h3 class="modal-title">Editar Alumno</h3>
        <p class="modal-subtitle">Modifica los datos del alumno en el sistema Odoo.</p>

        <form id="formEditAlumno" class="manual-form">
            <input type="hidden" name="id_odoo" id="editAlumnoId">

            <div class="form-grid">
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" name="nombre" id="editAlumnoNombre" placeholder="Ej. Juan" required>
                </div>
                <div class="form-group">
                    <label>Apellidos</label>
                    <input type="text" name="apellidos" id="editAlumnoApellidos" placeholder="Ej. Pérez García" required>
                </div>
                <div class="form-group">
                    <label>DNI / NIE</label>
                    <input type="text" name="dni" id="editAlumnoDni" placeholder="12345678Z" required disabled>
                </div>
                <div class="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input type="date" name="fecha_nacimiento" id="editAlumnoFecha" required>
                </div>
                <div class="form-group">
                    <label>Clase</label>
                    <select name="clase" id="editAlumnoClase" required>
                        <option value="" disabled>Selecciona clase</option>
                        <option value="1º ESO">1º ESO</option>
                        <option value="2º ESO">2º ESO</option>
                        <option value="3º ESO">3º ESO</option>
                        <option value="4º ESO">4º ESO</option>
                        <option value="1º BACH">1º BACH</option>
                        <option value="2º BACH">2º BACH</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sección</label>
                    <select name="seccion" id="editAlumnoSeccion" required>
                        <option value="" disabled>Sección</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>
                </div>
            </div>

            <div class="modal-actions" style="margin-top: 30px; justify-content: flex-end; gap: 12px;">
                <button type="button" class="btn-cancel" onclick="document.getElementById('editAlumnoModal').classList.remove('show')">Cancelar</button>
                <button type="submit" class="btn-primary" style="padding: 10px 25px;">
                    <i class="fa-solid fa-save"></i> Actualizar
                </button>
            </div>
        </form>
    </div>
</div>

<div id="modalNfcAlumnos" class="modal-overlay-custom">
    <div class="modal-box-vincular">
        <span class="close-modal-btn" onclick="document.getElementById('modalNfcAlumnos').classList.remove('show')">&times;</span>
        
        <div class="nfc-icon-container">
            <i id="iconWaiting" class="fa-solid fa-rss pulse-nfc-icon"></i>
            <img id="imgStatusNfc" src="../assets/img/logo_umbrella.png" class="status-img-nfc" alt="Status" style="display:none;">
        </div>

        <h3>Vinculando NFC</h3>
        <p style="color: #64748b; margin-bottom: 5px;">Alumno:</p>
        <p><strong id="nfcStudentName" style="color: #007bff; font-size: 1.2rem;"></strong></p>
        
        <input type="text" id="nfcInputAlumnos" style="position: absolute; opacity: 0; pointer-events: none;">

        <div id="nfcStatusMsgAlumnos" style="margin-top: 20px; font-weight: bold; min-height: 40px;">
            <small><i class="fa-solid fa-spinner fa-spin"></i> Esperando señal...</small>
        </div>
    </div>
</div>

<div id="unlinkNfcAlumnoModal" class="modal-overlay-custom">
    <div class="modal-box-custom modal-box-unlink">
        <div class="modal-icon-circle" style="background:#fef3c7;">
            <i class="fa-solid fa-link-slash" style="color:#d97706;"></i>
        </div>
        <div class="modal-title"><h3>¿Desvincular NFC?</h3></div>
        <div class="modal-body">
            <p>Se desvinculará la tarjeta de <strong id="unlinkNfcAlumnoNombre" style="color:#d97706;"></strong>. La tarjeta permanecerá en el sistema.</p>
        </div>
        <div class="modal-actions-row">
            <button id="btnCancelUnlinkAlumno" class="btn-modal-base btn-modal-cancel">Cancelar</button>
            <button id="btnConfirmUnlinkAlumno" class="btn-modal-base btn-modal-unlink">Desvincular</button>
        </div>
    </div>
</div>