// config.js
// ==========================================
// CONFIGURACIÓN Y UTILIDADES GLOBALES
// ==========================================

const GLOBALS = {
    // Rutas de imágenes
    IMG_LOADING: '../assets/img/logo_umbrella.png',
    IMG_ERROR:   '../assets/img/logo_umbrella_error.png',
    IMG_SUCCESS: '../assets/img/logo_umbrella_success.png',
    
    // Rutas de Controladores PHP
    URL_IMPORT_ALUMNO_CSV:      '../controllers/import_alumno.php',
    URL_IMPORT_ALUMNO_MANUAL:      '../controllers/import_alumno_manual.php',

    URL_IMPORT_PROFESOR_CSV:      '../controllers/import_profesor.php',
    URL_IMPORT_PROFESOR_MANUAL:      '../controllers/import_profesor_manual.php',

    URL_DELETE_PERSONA: '../controllers/delete_persona.php',
    
    URL_ASSIGN_CARD:     '../controllers/assign_card.php',
    URL_GET_ALUMNOS:     '../controllers/get_alumnos.php',
    URL_GET_PROFESORES: '../controllers/get_profesores.php',
    URL_UPDATE_TRANSPORTE: '../controllers/update_transporte.php',
    URL_UPDATE_ESTADO: '../controllers/update_estado.php'
};

// Animación de vibración para errores en modales
function shakeModal(cardElement) {
    if (!cardElement) return;
    cardElement.style.animation = 'none';
    cardElement.offsetHeight; // Forzar reflow del navegador
    cardElement.style.animation = 'shake 0.3s ease-in-out';
}