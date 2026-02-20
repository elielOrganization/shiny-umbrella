<?php
$pageTitle = "Vinculación NFC - Shiny Umbrella";
include '../includes/header.php';
include '../includes/sidebar.php';
?>

<link rel="stylesheet" href="../assets/css/tables.css">

<style>
    /* FORZAR GRID DE 4 COLUMNAS */
    .table-grid-nfc {
        display: grid !important;
        grid-template-columns: 70px 2fr 100px 160px !important;
        gap: 10px;
        align-items: center;
        padding: 12px 20px;
    }

    /* ESTILOS SHINY PARA BOTONES DE ACCIÓN */
    .nfc-actions-wrapper {
        display: flex;
        gap: 12px;
        justify-content: center;
    }

    .btn-shiny {
        border: none !important;
        width: 30px !important;
        height: 30px !important;
        border-radius: 10px !important;
        display: flex !important;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white !important;
        font-size: 1rem !important;
        transition: all 0.2s ease-in-out !important;
        box-shadow: 0 4px 6px rgba(0,0,0,0.15) !important;
    }

    .btn-shiny:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 6px 12px rgba(0,0,0,0.2) !important;
        filter: brightness(1.1);
    }

    .btn-shiny:active {
        transform: translateY(0);
    }

    /* Botón Desvincular - Naranja Shiny */
    .btn-orange-shiny {
        background: linear-gradient(135deg, #4da0ff 0%, #0072f5 100%) !important;
    }

    /* Botón Eliminar - Rojo Shiny */
    .btn-red-shiny {
        background: linear-gradient(135deg, #FF5252 0%, #D32F2F 100%) !important;
    }

    /* Badge para el UID */
    .uid-display {
        background-color: #f1f5f9;
        color: #334155;
        padding: 5px 12px;
        border-radius: 6px;
        font-family: 'Courier New', Courier, monospace;
        font-weight: 600;
        border: 1px solid #e2e8f0;
    }

    .spinning-umbrella {
        width: 50px;
        animation: spin 2s linear infinite;
    }
    @keyframes spin { from {transform:rotate(0deg);} to {transform:rotate(360deg);} }
</style>

<main class="main-content">
    <div class="controls-row">
        <h2 class="page-title">Gestión de Tarjetas NFC</h2>
        
        <div class="actions">
            <button class="btn-primary" id="btnOpenNfcModal">
                <i class="fa-solid fa-rss"></i> Iniciar Vinculación
            </button>
        </div>
    </div>

    <div class="table-container">
        <div class="table-header-row table-grid-nfc">
            <div>ID</div>
            <div>Identificador (UID)</div>
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

<?php 
// Incluimos el archivo de modales separado
include '../includes/modales_vinculacion.php'; 
?>

<script src="../assets/js/config.js"></script>
<script src="../assets/js/ui.js"></script>
<script>
    // Lógica para abrir/cerrar el modal
    const modal = document.getElementById('modalNfc');
    const btn = document.getElementById('btnOpenNfcModal');
    const span = document.querySelector('.close-modal');

    btn.onclick = () => modal.style.display = "flex";
    span.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }
</script>
</body>
</html>