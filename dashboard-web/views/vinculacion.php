<?php
require_once '../includes/auth.php';
$pageTitle = "Vinculación NFC - Shiny Umbrella";
include '../includes/header.php';
include '../includes/sidebar.php';
?>

<link rel="stylesheet" href="../assets/css/tables.css">

<style>
    .table-grid-nfc {
        display: grid !important;
        grid-template-columns: 50px 2fr 1.5fr 100px 120px !important;
        gap: 10px;
        align-items: center;
        padding: 12px 20px;
    }

    .nfc-actions-wrapper {
        display: flex;
        gap: 8px;
        justify-content: center;
    }

    .spinning-umbrella {
        width: 50px;
        animation: spin 2s linear infinite;
    }
    @keyframes spin { from {transform:rotate(0deg);} to {transform:rotate(360deg);} }

    .vinculado-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #f0fdf4;
        color: #16a34a;
        border: 1px solid #bbf7d0;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
    }

    .libre-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #f8fafc;
        color: #94a3b8;
        border: 1px solid #e2e8f0;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 500;
    }
</style>

<main class="main-content">
    <div class="controls-row">
        <h2 class="page-title">Gestión de Tarjetas NFC</h2>

        <div class="actions">
            <div class="search-box">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Buscar UID o persona..." class="search-input" id="nfcSearch">
            </div>

            <div class="filter-dropdown-container">
                <button class="btn-secondary" id="btnFilterToggleNfc">
                    <i class="fa-solid fa-filter"></i> Filtros
                </button>
                <div class="filter-menu" id="filterMenuNfc">
                    <div class="filter-section">
                        <h4>Estado</h4>
                        <div class="filter-options">
                            <label class="filter-switch-row">
                                <div class="filter-label-part"><i class="fa-solid fa-circle-check" style="color:#16a34a"></i><span>Activas</span></div>
                                <div class="filter-switch-part">
                                    <input type="checkbox" name="filter-nfc-activo" value="activo">
                                    <div class="filter-toggle"></div>
                                </div>
                            </label>
                            <label class="filter-switch-row">
                                <div class="filter-label-part"><i class="fa-solid fa-circle-xmark" style="color:#dc3545"></i><span>Inactivas</span></div>
                                <div class="filter-switch-part">
                                    <input type="checkbox" name="filter-nfc-activo" value="inactivo">
                                    <div class="filter-toggle"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <hr class="filter-divider">
                    <div class="filter-section">
                        <h4>Vinculación</h4>
                        <div class="filter-options">
                            <label class="filter-switch-row">
                                <div class="filter-label-part"><i class="fa-solid fa-user" style="color:#16a34a"></i><span>Vinculadas</span></div>
                                <div class="filter-switch-part">
                                    <input type="checkbox" name="filter-nfc-vinculo" value="vinculada">
                                    <div class="filter-toggle"></div>
                                </div>
                            </label>
                            <label class="filter-switch-row">
                                <div class="filter-label-part"><i class="fa-solid fa-circle-minus" style="color:#94a3b8"></i><span>Libres</span></div>
                                <div class="filter-switch-part">
                                    <input type="checkbox" name="filter-nfc-vinculo" value="libre">
                                    <div class="filter-toggle"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="filter-footer">
                        <button id="btnClearFiltersNfc" type="button" class="btnClearFilters">Borrar</button>
                        <button id="btnApplyFiltersNfc" type="button" class="btn-apply-filters">Aplicar</button>
                    </div>
                </div>
            </div>

            <button class="btn-primary" id="btnOpenNfcModal">
                <i class="fa-solid fa-rss"></i> Iniciar Vinculación
            </button>
        </div>
    </div>

    <div class="table-container">
        <div class="table-header-row table-grid-nfc">
            <div>#</div>
            <div>Identificador (UID)</div>
            <div>Vinculado a</div>
            <div class="text-center">Estado</div>
            <div class="text-center">Acciones</div>
        </div>

        <div id="tableBodyNfc">
            <div class="table-main-loader" style="padding: 50px; text-align: center;">
                <img src="../assets/img/logo_umbrella.png" class="spinning-umbrella" alt="Cargando..." style="width: 50px;">
                <p style="margin-top: 15px; color: #64748b;">Consultando dispositivos en Odoo...</p>
            </div>
        </div>
    </div>
</main>

<script src="../assets/js/config.js"></script>
<script src="../assets/js/ui.js"></script>

<script src="../assets/js/nfc/api_nfc.js"></script>
<script src="../assets/js/nfc/ui_nfc.js"></script>
<script src="../assets/js/nfc/eventos_nfc.js"></script>
<script src="../assets/js/nfc/filters_nfc.js"></script>

<?php 
// Incluimos el archivo de modales separado
include '../includes/modales_vinculacion.php'; 
?>

</body>
</html>