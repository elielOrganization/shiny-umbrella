<?php
session_start();
if (!empty($_SESSION['uid'])) {
    header('Location: views/main.php');
    exit;
}

$error = $_GET['error'] ?? null;
$errorMsg = match($error) {
    'credenciales' => 'Usuario o contraseña incorrectos.',
    'conexion'     => 'No se pudo conectar con el servidor.',
    'campos'       => 'Rellena todos los campos.',
    default        => null
};
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Shiny Umbrella</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="assets/css/login.css">
</head>
<body>

<canvas id="bgCanvas"></canvas>

<div class="login-card">
    <div class="logo-area">
        <img src="assets/img/<?php echo $errorMsg ? 'logo_umbrella_error.png' : 'logo_umbrella.png'; ?>"
             alt="Logo" class="logo-img <?php echo $errorMsg ? 'logo-shake' : ''; ?>" id="mainLogo">
    </div>

    <div class="error-box <?php echo $errorMsg ? 'error-visible' : ''; ?>">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span><?php echo htmlspecialchars($errorMsg ?? ''); ?></span>
    </div>

    <div class="login-brand">
        <span class="login-brand-name">Shiny Umbrella</span>
    </div>

    <h2 style="font-size:1.1rem;font-weight:600;color:#374151;margin-bottom:14px;">Iniciar sesión</h2>

    <form id="loginForm" method="POST" action="controllers/login.php">
        <div class="input-group">
            <input type="email" name="email" id="email" class="input-field"
                   placeholder="Correo electrónico" required
                   value="<?php echo htmlspecialchars($_GET['email'] ?? ''); ?>">
        </div>

        <div class="input-group password-group">
            <input type="password" name="password" id="password" class="input-field"
                   placeholder="Contraseña" required>
            <i class="fa-solid fa-eye toggle-password" id="togglePassword"></i>
        </div>

        <button type="submit" class="btn-login" id="loginBtn">
            <?php echo $errorMsg ? 'Volver a intentar' : 'Iniciar sesión'; ?>
        </button>
    </form>
</div>

<script>

/* ---- Ondas animadas ---- */
(function () {
    const canvas = document.getElementById('bgCanvas');
    const ctx    = canvas.getContext('2d');
    let W, H, t = 0;

    const waves = [
        { amp: 38, freq: 0.012, speed: 0.018, color: 'rgba(99,130,246,0.13)',  yOff: 0.62 },
        { amp: 28, freq: 0.018, speed: 0.026, color: 'rgba(129,140,248,0.18)', yOff: 0.70 },
        { amp: 20, freq: 0.024, speed: 0.034, color: 'rgba(165,180,252,0.22)', yOff: 0.77 },
        { amp: 14, freq: 0.030, speed: 0.044, color: 'rgba(199,210,254,0.30)', yOff: 0.83 },
    ];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function drawWave(w, offset) {
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 2) {
            const y = H * w.yOff + Math.sin(x * w.freq + offset) * w.amp;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = w.color;
        ctx.fill();
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        t += 1;
        waves.forEach(w => drawWave(w, t * w.speed));
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
})();

/* ---- Toggle contraseña ---- */
document.getElementById('togglePassword').addEventListener('click', function () {
    const pwd  = document.getElementById('password');
    const show = pwd.type === 'password';
    pwd.type   = show ? 'text' : 'password';
    this.classList.toggle('fa-eye',       !show);
    this.classList.toggle('fa-eye-slash',  show);
});

/* ---- Spinner al enviar ---- */
document.getElementById('loginForm').addEventListener('submit', function () {
    const btn  = document.getElementById('loginBtn');
    const logo = document.getElementById('mainLogo');
    btn.disabled    = true;
    btn.textContent = btn.textContent.includes('intentar') ? 'Reintentando...' : 'Verificando...';
    logo.style.animationDuration = '0.6s';
});
</script>

</body>
</html>
