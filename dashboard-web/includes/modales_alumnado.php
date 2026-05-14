<?php include '../includes/modales_globales.php'; ?>

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

        <div class="processing-area" id="processingArea" style="display:none;">
            <img src="../src/img/logo_umbrella.png" alt="Procesando" class="spinner-img" id="statusLogo">
            <p class="status-text" id="statusText">Verificando archivo...</p>
        </div>

        <a href="#" id="btnAñadirManual" style="display:inline-block;margin-top:18px;color:var(--primary-blue);text-decoration:none;font-size:0.9rem;font-weight:500;">
            Añadir manualmente
        </a>
    </div>
</div>

<div id="manualStudentModal" class="modal-overlay">
    <div class="modal-card" style="max-width:600px;">
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
            <div class="modal-actions" style="margin-top:30px;justify-content:flex-end;gap:12px;">
                <button type="button" class="btn-cancel">Cancelar</button>
                <button type="submit" class="btn-primary" style="padding:10px 25px;">
                    <i class="fa-solid fa-save"></i> Guardar Alumno
                </button>
            </div>
        </form>
    </div>
</div>

<div id="editAlumnoModal" class="modal-overlay">
    <div class="modal-card" style="max-width:600px;">
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
            <div class="modal-actions" style="margin-top:30px;justify-content:flex-end;gap:12px;">
                <button type="button" class="btn-cancel" onclick="document.getElementById('editAlumnoModal').classList.remove('show')">Cancelar</button>
                <button type="submit" class="btn-primary" style="padding:10px 25px;">
                    <i class="fa-solid fa-save"></i> Actualizar
                </button>
            </div>
        </form>
    </div>
</div>
