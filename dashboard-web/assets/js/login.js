document.addEventListener('DOMContentLoaded', () => {
    const loginForm      = document.getElementById('loginForm');
    const emailInput     = document.getElementById('email');
    const passwordInput  = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const mainLogo       = document.getElementById('mainLogo');
    const loginBtn       = document.getElementById('loginBtn');
    const errorBox       = document.getElementById('errorBox');

    // Rutas de imágenes
    const IMG_NORMAL = '../src/img/logo_umbrella.png';
    const IMG_ERROR  = '../src/img/logo_error.png';

    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        errorBox.style.display = 'none';
        mainLogo.src = IMG_NORMAL;
        mainLogo.classList.add('spinning');
        loginBtn.textContent = 'Verificando...';
        loginBtn.disabled = true;

        setTimeout(() => {
            mainLogo.classList.remove('spinning');
            loginBtn.textContent = 'Iniciar Sesión';
            loginBtn.disabled = false;

            const emailValue = emailInput.value.toLowerCase();

            if (emailValue === 'error@demo.com') {
                handleLoginError();
            } else {
                window.location.href = 'index.html';
            }
        }, 2000);
    });

    function handleLoginError() {
        mainLogo.src = IMG_ERROR;
        errorBox.style.display = 'flex';
        passwordInput.value = '';
    }
});
