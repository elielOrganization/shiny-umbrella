<?php
require_once '../includes/auth.php';
$pageTitle = "Profesorado - Shiny Umbrella";
include '../includes/header.php';
include '../includes/sidebar.php';
?>

<main class="main-content">
    <div class="controls-row">
        <h2 class="page-title">Listado de Profesorado</h2>

        <div class="actions">
            <div class="search-box">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Buscar profesor..." class="search-input" id="tableSearchProf">
            </div>

            <div class="action-buttons">
                <div class="filter-dropdown-container">
                    <button class="btn-secondary" id="btnFilterToggleProf">
                        <i class="fa-solid fa-filter"></i> Filtros
                    </button>

                    <div class="filter-menu" id="filterMenuProf">
                        <div class="filter-section">
                            <h4>Departamento</h4>
                            <div class="dep-grid">
                                <?php $departamentos = ['Matemáticas', 'Lengua', 'Inglés', 'Ciencias', 'Historia', 'Tecnología', 'Educación Física', 'Arte', 'Música', 'Filosofía', 'Tecnología'];
                                foreach (array_unique($departamentos) as $dep): ?>
                                    <label class="course-item">
                                        <input type="checkbox" name="filter-dep" value="<?php echo $dep; ?>">
                                        <span class="filter-tag"><?php echo $dep; ?></span>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                        </div>

                        <hr class="filter-divider">

                        <div class="filter-section">
                            <h4>Estado</h4>
                            <div class="filter-options">
                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i class="fa-solid fa-user-check" style="color:var(--success-green);"></i><span>Solo Alta</span></div>
                                    <div class="filter-switch-part">
                                        <input type="checkbox" name="filter-estado" value="alta">
                                        <div class="filter-toggle"></div>
                                    </div>
                                </label>
                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i class="fa-solid fa-user-xmark" style="color:var(--danger-red);"></i><span>Solo Baja</span></div>
                                    <div class="filter-switch-part">
                                        <input type="checkbox" name="filter-estado" value="baja">
                                        <div class="filter-toggle"></div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <hr class="filter-divider">

                        <div class="filter-section">
                            <h4>Vinculación NFC</h4>
                            <div class="filter-options">
                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i class="fa-brands fa-nfc-symbol icon-nfc"></i><span>Con UID asignado</span></div>
                                    <div class="filter-switch-part">
                                        <input type="checkbox" name="filter-nfc" value="con">
                                        <div class="filter-toggle"></div>
                                    </div>
                                </label>
                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i class="fa-solid fa-id-badge icon-pending"></i><span>Sin UID (Pendientes)</span></div>
                                    <div class="filter-switch-part">
                                        <input type="checkbox" name="filter-nfc" value="sin">
                                        <div class="filter-toggle"></div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="filter-footer">
                            <button id="btnClearFiltersProf" type="button" class="btnClearFilters">Borrar</button>
                            <button id="btnApplyFiltersProf" class="btn-apply-filters" type="button">Aplicar filtros</button>
                        </div>
                    </div>
                </div>

                <button class="btn-primary" id="btnAddProfesor"><i class="fa-solid fa-plus"></i> Añadir Profesor</button>
            </div>
        </div>
    </div>

    <div class="table-container">
        <div class="table-header-row table-grid-prof">
            <div>Profesor (Apellido, Nombre)</div>
            <div>DNI</div>
            <div>Departamento</div>
            <div>ID NFC</div>
            <div class="text-center">Estado</div>
            <div class="text-center">Acciones</div>
        </div>

        <div id="tableLoaderProf" class="table-main-loader">
            <img src="../assets/img/logo_umbrella.png" class="spinning-umbrella" alt="Cargando...">
            <p>Obteniendo profesores de Odoo...</p>
        </div>

        <div id="tableBodyProf"></div>
    </div>
</main>

<?php include '../includes/modales_profesores.php'; ?>
<script src="../assets/js/config.js?v=2"></script>
<script src="../assets/js/ui.js?v=2"></script>

<script src="../assets/js/profesores/api_profesores.js?v=2"></script>
<script src="../assets/js/profesores/ui_profesores.js?v=2"></script>
<script src="../assets/js/profesores/eventos_profesores.js?v=2"></script>
<script src="../assets/js/profesores/nfc.js?v=2"></script>
</body>
</html>
