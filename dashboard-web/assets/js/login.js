document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const mainLogo = document.getElementById('mainLogo');
    const loginBtn = document.getElementById('loginBtn');
    const errorBox = document.getElementById('errorBox');

    // Rutas de imágenes (Ajusta según tus carpetas)
    const IMG_NORMAL = '../src/img/logo_umbrella.png'; 
    const IMG_ERROR = '../src/img/logo_error.png';

    // 1. Lógica para MOSTRAR/OCULTAR contraseña
    togglePassword.addEventListener('click', () => {
        // Alternar tipo de input
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Alternar icono (ojo abierto / cerrado)
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // 2. Lógica del LOGIN (Simulación)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitar recarga real

        // A. ESTADO DE CARGA
        // 1. Limpiar errores previos
        errorBox.style.display = 'none';
        mainLogo.src = IMG_NORMAL; // Asegurar logo normal
        
        // 2. Activar animación giratoria
        mainLogo.classList.add('spinning');
        
        // 3. Deshabilitar botón
        loginBtn.textContent = 'Verificando...';
        loginBtn.disabled = true;

        // B. SIMULAR RESPUESTA DEL SERVIDOR (Delay de 2 segundos)
        setTimeout(() => {
            // Parar giro
            mainLogo.classList.remove('spinning');
            loginBtn.textContent = 'Iniciar Sesión';
            loginBtn.disabled = false;

            // COMPROBACIÓN DE ERROR (Para probar, usa el email: error@demo.com)
            const emailValue = emailInput.value.toLowerCase();

            if (emailValue === 'error@demo.com') {
                // --- CASO ERROR ---
                handleLoginError();
            } else {
                // --- CASO ÉXITO ---
                window.location.href = 'index.html';
            }

        }, 2000); // 2000ms = 2 segundos de espera
    });

    function handleLoginError() {
        // 1. Cambiar logo a error
        mainLogo.src = IMG_ERROR;
        
        // 2. Mostrar caja roja
        errorBox.style.display = 'flex';
        
        // 3. Vaciar contraseña (comportamiento típico de seguridad)
        passwordInput.value = '';
    }
});