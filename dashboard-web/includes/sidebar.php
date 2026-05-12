<?php
$current_page = basename($_SERVER['PHP_SELF']);
$userName  = $_SESSION['name']  ?? 'Usuario';
$userLogin = $_SESSION['login'] ?? '';
$parts     = explode(' ', $userName);
$initials  = strtoupper(
    substr($parts[0] ?? '', 0, 1) .
    substr($parts[1] ?? '', 0, 1)
);
?>
<nav class="sidebar collapsed" id="sidebar">
    <div class="logo-container" id="logoToggle" title="Clic para colapsar/expandir">
        <img src="../assets/img/logo_umbrella.png" alt="Logo" class="logo-img" id="logoImg">
    </div>

    <ul class="nav-list">
        <li class="nav-item <?php echo ($current_page == 'main.php') ? 'active' : ''; ?>" onclick="window.location.href='main.php'" data-tooltip="Estadísticas">
            <i class="fa-solid fa-chart-simple"></i>
            <span class="nav-text">Estadísticas</span>
        </li>
        <li class="nav-item <?php echo ($current_page == 'alumnado.php') ? 'active' : ''; ?>" onclick="window.location.href='alumnado.php'" data-tooltip="Alumnado">
            <i class="fa-solid fa-user-group"></i>
            <span class="nav-text">Alumnado</span>
        </li>
        <li class="nav-item <?php echo ($current_page == 'profesores.php') ? 'active' : ''; ?>" onclick="window.location.href='profesores.php'" data-tooltip="Profesorado">
            <i class="fa-solid fa-chalkboard-user"></i>
            <span class="nav-text">Profesorado</span>
        </li>
        <li class="nav-item <?php echo ($current_page == 'vinculacion.php') ? 'active' : ''; ?>" onclick="window.location.href='vinculacion.php'" data-tooltip="Vinculación NFC">
            <i class="fa-solid fa-link"></i>
            <span class="nav-text">Vinculación NFC</span>
        </li>
    </ul>

    <!-- Sección inferior: perfil + cerrar sesión -->
    <div class="sidebar-bottom">
        <div class="sidebar-profile" data-tooltip="<?php echo htmlspecialchars($userName); ?>">
            <div class="sidebar-avatar"><?php echo htmlspecialchars($initials ?: 'U'); ?></div>
            <div class="sidebar-profile-info nav-text">
                <span class="sidebar-profile-name"><?php echo htmlspecialchars($userName); ?></span>
                <span class="sidebar-profile-role"><?php echo htmlspecialchars($userLogin); ?></span>
            </div>
        </div>
        <div class="sidebar-logout" data-tooltip="Cerrar sesión" onclick="window.location.href='../controllers/logout.php'">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span class="nav-text">Cerrar sesión</span>
        </div>
    </div>
</nav>
<button id="sidebar-toggle-btn" title="Expandir / Colapsar menú">
    <i class="fa-solid fa-chevron-right"></i>
</button>