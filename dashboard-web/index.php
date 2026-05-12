<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Shiny Umbrella</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../login.css">
</head>
<body>

    <div class="login-card">
        <div class="logo-area">
            <img src="../src/img/logo_umbrella.png" alt="Logo" class="logo-img" id="mainLogo">
        </div>

        <form id="loginForm" method="POST" action="login_process.php">
            <div class="input-group">
                <input type="email" name="email" id="email" class="input-field" placeholder="Correo Electrónico" required>
            </div>

            <div class="input-group password-group">
                <input type="password" name="password" id="password" class="input-field" placeholder="Contraseña" required>
                <i class="fa-solid fa-eye toggle-password" id="togglePassword"></i>
            </div>

            <div class="options-row">
                <label class="remember-me">
                    <input type="checkbox" name="remember">
                    Recordarme
                </label>
                <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" class="btn-login" id="loginBtn">Iniciar Sesión</button>
            
            <div class="error-box" id="errorBox">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>Usuario o contraseña incorrectos</span>
            </div>
        </form>
    </div>

    <script src="../login.js"></script>
</body>
</html>