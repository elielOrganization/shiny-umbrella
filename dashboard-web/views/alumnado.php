<?php
require_once '../includes/auth.php';
$pageTitle = "Alumnado - Shiny Umbrella";
include '../includes/header.php';
include '../includes/sidebar.php';
?>

<main class="main-content">
    <div class="controls-row">
        <h2 class="page-title">Listado de Alumnado</h2>

        <div class="actions">
            <div class="search-box">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Buscar alumno..." class="search-input" id="tableSearch">
            </div>

            <div class="action-buttons">
                <div class="filter-dropdown-container">
                    <button class="btn-secondary" id="btnFilterToggle">
                        <i class="fa-solid fa-filter"></i> Filtros
                    </button>
                    
                    <div class="filter-menu" id="filterMenu">
                        <div class="filter-section">
                            <h4>Curso</h4>
                            <div class="course-grid">
                                <?php $cursos = ['1º ESO', '2º ESO', '3º ESO', '4º ESO', '1º BACH', '2º BACH']; 
                                foreach($cursos as $c): ?>
                                <label class="course-item">
                                    <input type="checkbox" name="filter-curso" value="<?php echo $c; ?>">
                                    <span class="filter-tag"><?php echo $c; ?></span>
                                </label>
                                <?php endforeach; ?>
                            </div>
                        </div>

                        <hr class="filter-divider">

                        <div class="filter-section">
                            <h4>Estado y Edad</h4>
                            <div class="filter-options">
                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i class="fa-solid fa-bus icon-transport"></i><span>Usa Transporte</span></div>
                                    <div class="filter-switch-part">
                                        <input type="checkbox" name="filter-transporte" value="yes">
                                        <div class="filter-toggle"></div>
                                    </div>
                                </label>

                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i class="fa-solid fa-id-badge icon-pending"></i><span>Sin tarjeta NFC</span></div>
                                    <div class="filter-switch-part">
                                        <input type="checkbox" name="filter-no-nfc" value="yes">
                                        <div class="filter-toggle"></div>
                                    </div>
                                </label>

                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i class="fa-solid fa-user-plus" style="color:#10b981"></i><span>Mayores de 18</span></div>
                                    <div class="filter-switch-part">
                                        <input type="checkbox" name="filter-mayor" value="yes">
                                        <div class="filter-toggle"></div>
                                    </div>
                                </label>

                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i class="fa-solid fa-child" style="color:#f59e0b"></i><span>Menores de 18</span></div>
                                    <div class="filter-switch-part">
                                        <input type="checkbox" name="filter-menor" value="yes">
                                        <div class="filter-toggle"></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="filter-footer">
                            <button id="btnClearFilters" type="button" class="btnClearFilters">Borrar</button>
                            <button id="btnApplyFilters" class="btn-apply-filters" type="button">Aplicar filtros</button>
                        </div>
                    </div>
                </div>

                <button class="btn-primary" id="btnAddStudent"><i class="fa-solid fa-plus"></i> Añadir Alumno</button>
            </div>
        </div>
    </div>

    <div class="table-container">
        <div class="table-header-row table-grid-layout">
            <div>Alumno (Apellido, Nombre)</div>
            <div>F. Nacimiento</div>
            <div>Grupo</div>
            <div>DNI</div>
            <div>ID NFC</div>
            <div class="text-center">Salida</div>
            <div class="text-center">Recreo</div>
            <div class="text-center">Transp.</div>
            <div class="text-center">Acciones</div>
        </div>

        <div id="tableLoader" class="table-main-loader">
            <img src="../assets/img/logo_umbrella.png" class="spinning-umbrella" alt="Cargando...">
            <p>Obteniendo alumnos de Odoo...</p>
        </div>

        <div id="tableBody"></div>
    </div>
</main>

<?php include '../includes/modales_alumnado.php'; ?>
<script src="../assets/js/config.js"></script>
<script src="../assets/js/ui.js"></script>

<script src="../assets/js/alumnos/api_alumnos.js"></script>
<script src="../assets/js/alumnos/ui_alumnos.js"></script>
<script src="../assets/js/alumnos/eventos_alumnos.js"></script>

<script src="../assets/js/alumnos/nfc.js"></script>
<script src="../assets/js/alumnos/filters.js"></script>
<script src="../assets/js/alumnos/csv.js"></script>
</body>
</html>