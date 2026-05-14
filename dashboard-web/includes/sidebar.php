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
        <div class="sidebar-logout" id="btnAbrirLogout" data-tooltip="Cerrar sesión" style="cursor:pointer;">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span class="nav-text">Cerrar sesión</span>
        </div>
    </div>
</nav>
<button id="sidebar-toggle-btn" title="Expandir / Colapsar menú">
    <i class="fa-solid fa-chevron-right"></i>
</button>

<!-- Modal cerrar sesión — aquí para que esté disponible en todas las páginas -->
<div id="modalLogout" class="modal-overlay-custom">
    <div class="modal-box-custom" style="border-top:6px solid #64748b;">
        <div class="modal-icon-circle" style="background:#f1f5f9;">
            <i class="fa-solid fa-right-from-bracket" style="color:#64748b;font-size:2rem;"></i>
        </div>
        <div class="modal-title"><h3 style="margin:0 0 8px;color:#1e293b;font-size:1.3rem;font-weight:700;">¿Cerrar sesión?</h3></div>
        <div class="modal-body">
            <p style="color:#64748b;font-size:0.95rem;margin-bottom:24px;">Tu sesión se cerrará y tendrás que volver a iniciarla.</p>
        </div>
        <div class="modal-actions-row">
            <button type="button" id="btnCancelLogout"  class="btn-modal-base btn-modal-cancel">Cancelar</button>
            <button type="button" id="btnConfirmLogout" class="btn-modal-base"
                    style="background:#64748b;color:#fff;">Cerrar sesión</button>
        </div>
    </div>
</div>

<script>
(function () {
    var modal   = document.getElementById('modalLogout');
    var btnOpen = document.getElementById('btnAbrirLogout');
    var btnCancel  = document.getElementById('btnCancelLogout');
    var btnConfirm = document.getElementById('btnConfirmLogout');

    function abrir()  { modal.classList.add('show'); }
    function cerrar() { modal.classList.remove('show'); }

    btnOpen.addEventListener('click', abrir);
    btnCancel.addEventListener('click', cerrar);

    // Clic en el fondo
    modal.addEventListener('click', function (e) {
        if (e.target === modal) cerrar();
    });

    // Confirmar → ir al logout
    btnConfirm.addEventListener('click', function () {
        this.disabled  = true;
        this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saliendo...';
        window.location.href = '../controllers/logout.php';
    });

    // Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') cerrar();
    });
})();
</script>
