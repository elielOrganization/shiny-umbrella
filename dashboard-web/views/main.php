<?php 
$pageTitle = "Dashboard Escolar";
include '../includes/header.php'; 
include '../includes/sidebar.php'; 
?>

<main class="main-content">
    <div class="stats-grid">
        <div class="card">
            <div class="card-title">SALIDAS HOY</div>
            <div class="card-value">142</div>
            <div class="card-subtext"><span class="text-green">+12%</span> vs ayer</div>
        </div>
        <div class="card">
            <div class="card-title">INCIDENCIAS</div>
            <div class="card-value text-red">3</div>
            <div class="card-subtext">Tarjetas no reconocidas</div>
        </div>
        <div class="card">
            <div class="card-title">ACTIVOS</div>
            <div class="card-value text-blue">98%</div>
            <div class="card-subtext">Sincronizado Odoo</div>
        </div>
    </div>

    <div class="chart-container">
        <div class="section-header">
            <i class="fa-solid fa-arrow-right-from-bracket" style="font-size: 0.9rem; color: #6b7280; margin-right: 10px;"></i>
            Salidas Anticipadas (Semana actual)
        </div>
        <div class="chart-area">
            <div class="bar-group"><div class="bar-track"><div class="bar-fill h-60"></div></div><span class="bar-label">L</span></div>
            <div class="bar-group"><div class="bar-track"><div class="bar-fill h-40"></div></div><span class="bar-label">M</span></div>
            <div class="bar-group"><div class="bar-track"><div class="bar-fill h-80"></div></div><span class="bar-label">X</span></div>
            <div class="bar-group"><div class="bar-track"><div class="bar-fill h-50"></div></div><span class="bar-label">J</span></div>
            <div class="bar-group"><div class="bar-track"><div class="bar-fill h-25"></div></div><span class="bar-label">V</span></div>
        </div>
    </div>

    <div class="table-container">
        <div class="table-header-row">
            <span class="section-header" style="margin:0;">Gestión Rápida de Permisos</span>
            <button class="btn-filter">Filtrar</button>
        </div>
        <div class="table-columns">
            <div>Alumno/a</div>
            <div>Grupo</div>
            <div>NFC ID</div>
            <div style="text-align: right;">Salir Recreo</div>
        </div>
        <div class="table-body">
            </div>
    </div>
</main>

<script src="../assets/js/config.js"></script>
<script src="../assets/js/ui.js"></script>
<script src="../assets/js/table.js"></script>
<script src="../assets/js/filters.js"></script>
<script src="../assets/js/csv.js"></script>
<script src="../assets/js/nfc.js"></script>
</body>
</html>