<?php
$pageTitle = "Profesorado - Shiny Umbrella";
include '../includes/header.php';
include '../includes/sidebar.php';
?>

<style>
    /* Clase exclusiva para cuadrar las 5 columnas de esta tabla, idéntica a table-grid-layout */
    .table-grid-prof {
        display: grid;
        grid-template-columns: minmax(200px, 2fr) 1fr 1fr 1fr 0.8fr;
        gap: 10px;
        align-items: center;
    }

    /* Clase exclusiva para cuadrar las 5 columnas de esta tabla */
    .table-grid-prof {
        display: grid;
        grid-template-columns: minmax(200px, 2fr) 1fr 1fr 1fr 0.8fr;
        gap: 10px;
        align-items: center;
    }

    /* Clase exclusiva para que los departamentos largos quepan en el filtro */
    .dep-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }
</style>

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
                            <div class="course-grid">
                                <?php $departamentos = ['Matemáticas', 'Lengua', 'Inglés', 'Ciencias', 'Historia', 'Tecnología'];
                                foreach ($departamentos as $dep): ?>
                                    <label class="course-item">
                                        <input type="checkbox" name="filter-dep" value="<?php echo $dep; ?>">
                                        <span class="filter-tag"><?php echo $dep; ?></span>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                        </div>

                        <div class="filter-section">
                            <h4>Estado</h4>
                            <div class="filter-options">
                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i class="fa-solid fa-user-check"
                                            style="color: var(--success-green);"></i><span>Solo Alta</span></div>
                                    <div class="filter-switch-part">
                                        <input type="checkbox" name="filter-estado" value="alta">
                                        <div class="filter-toggle"></div>
                                    </div>
                                </label>

                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i class="fa-solid fa-user-xmark"
                                            style="color: var(--danger-red);"></i><span>Solo Baja</span></div>
                                    <div class="filter-switch-part">
                                        <input type="checkbox" name="filter-estado" value="baja">
                                        <div class="filter-toggle"></div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="filter-section">
                            <h4>Vinculación NFC</h4>
                            <div class="filter-options">
                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i
                                            class="fa-brands fa-nfc-symbol icon-nfc"></i><span>Con UID asignado</span>
                                    </div>
                                    <div class="filter-switch-part">
                                        <input type="checkbox" name="filter-nfc" value="con">
                                        <div class="filter-toggle"></div>
                                    </div>
                                </label>

                                <label class="filter-switch-row">
                                    <div class="filter-label-part"><i
                                            class="fa-solid fa-id-badge icon-pending"></i><span>Sin UID
                                            (Pendientes)</span></div>
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

                <button class="btn-primary" id="btnAddProfesor"><i class="fa-solid fa-plus"></i> Añadir</button>
            </div>
        </div>
    </div>

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
<script src="../assets/js/config.js"></script>
<script src="../assets/js/ui.js"></script>
<script src="../assets/js/profesores/table.js?v=2"></script>
<script src="../assets/js/profesores/nfc.js"></script>
</body>

</html>