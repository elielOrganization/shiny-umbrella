<?php
$pageTitle = "Dashboard Escolar";
include '../includes/header.php';
include '../includes/sidebar.php';
?>

<main class="main-content">
    <div class="controls-row">
        <h2 class="page-title">Estadísticas</h2>
    </div>

    <!-- Tarjetas de resumen -->
    <div class="stats-grid">
        <div class="card">
            <div class="card-title">
                <i class="fa-solid fa-user-group" style="margin-right:6px;color:#3b82f6;"></i>Alumnado
            </div>
            <div class="card-value" id="statAlumnos">—</div>
            <div class="card-subtext">Alumnos registrados</div>
        </div>

        <div class="card">
            <div class="card-title">
                <i class="fa-solid fa-chalkboard-user" style="margin-right:6px;color:#8b5cf6;"></i>Profesorado
            </div>
            <div class="card-value text-blue" id="statProfes">—</div>
            <div class="card-subtext">Profesores registrados</div>
        </div>
    </div>

    <!-- Gráfico distribución por curso -->
    <div class="chart-container">
        <div class="section-header">
            <i class="fa-solid fa-chart-simple" style="font-size:0.9rem;color:#6b7280;margin-right:10px;"></i>
            Alumnado por Curso
        </div>
        <div class="chart-area" id="courseChart">
            <div class="table-main-loader" id="chartLoader" style="display:flex;align-items:center;gap:10px;padding:20px;">
                <img src="../assets/img/logo_umbrella.png" class="spinning-umbrella" style="width:30px;margin:0;">
                <span>Cargando...</span>
            </div>
        </div>
    </div>

    <!-- Tabla de registros recientes -->
    <div class="table-container logs-container">
        <div class="logs-header">
            <div class="logs-header-left">
                <div class="logs-icon-wrap"><i class="fa-solid fa-clock-rotate-left"></i></div>
                <span>Entradas y Salidas Recientes</span>
            </div>
            <button class="logs-refresh-btn" onclick="cargarLogs()" title="Actualizar">
                <i class="fa-solid fa-rotate-right"></i>
            </button>
        </div>

        <div class="logs-tabs">
            <button class="logs-tab active" data-tipo="profesor" onclick="switchLogsTab(this)">
                <i class="fa-solid fa-chalkboard-user"></i> Profesores
            </button>
            <button class="logs-tab" data-tipo="alumno" onclick="switchLogsTab(this)">
                <i class="fa-solid fa-user-group"></i> Alumnos
            </button>
        </div>

        <div class="table-grid-logs table-header-row">
            <div>Hora</div>
            <div>Persona</div>
            <div>NFC</div>
            <div class="text-center">Tipo</div>
        </div>

        <div id="logsTableBody">
            <div class="table-main-loader" id="logsLoader">
                <img src="../assets/img/logo_umbrella.png" class="spinning-umbrella">
                <p>Cargando registros...</p>
            </div>
        </div>
    </div>
</main>

<script src="../assets/js/config.js"></script>
<script src="../assets/js/ui.js"></script>
<script src="../assets/js/main.js"></script>
</body>
</html>
