<?php
$current_page = basename($_SERVER['PHP_SELF']);
?>
<nav class="sidebar collapsed" id="sidebar">
    <div class="logo-container" id="logoToggle" title="Clic para colapsar/expandir">
        <img src="../assets/img/logo_umbrella.png" alt="Logo" class="logo-img" id="logoImg">
    </div>

    <ul class="nav-list">
        <li class="nav-item <?php echo ($current_page == 'main.php') ? 'active' : ''; ?>" onclick="window.location.href='main.php'">
            <i class="fa-solid fa-chart-simple"></i>
            <span class="nav-text">Estadísticas</span>
        </li>
        <li class="nav-item <?php echo ($current_page == 'alumnado.php') ? 'active' : ''; ?>" onclick="window.location.href='alumnado.php'">
            <i class="fa-solid fa-user-group"></i>
            <span class="nav-text">Alumnado</span>
        </li>
        <li class="nav-item">
            <i class="fa-solid fa-chalkboard-user"></i>
            <span class="nav-text">Profesorado</span>
        </li>
        <li class="nav-item">
            <i class="fa-solid fa-expand"></i>
            <span class="nav-text">Vinculación NFC</span>
        </li>
    </ul>
</nav>