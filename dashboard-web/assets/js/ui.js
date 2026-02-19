// ui.js
document.addEventListener('DOMContentLoaded', () => {
    // Cerrar modales al hacer clic fuera del recuadro (Overlay)
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('show');
        }
    });

    // Botones de cierre (X y Cancelar)
    document.addEventListener('click', (e) => {
        if (e.target.matches('.close-modal, .btn-cancel, .close-nfc, #btnCancelNfc, #btnCancelReplace, #btnCancelOverwrite')) {
            const modal = e.target.closest('.modal-overlay');
            if (modal) modal.classList.remove('show');
        }
    });

    // Sidebar Toggle (Menú lateral)
    const logoToggle = document.getElementById('logoToggle');
    const sidebar = document.getElementById('sidebar');
    if (logoToggle && sidebar) {
        logoToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    }
});