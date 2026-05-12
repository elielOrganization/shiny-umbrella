// ui.js

// Tooltip genérico que sigue al ratón
const _tooltip = document.createElement('div');
_tooltip.id = 'tooltip-calculado';
document.body.appendChild(_tooltip);

function _showTooltip(text) {
    _tooltip.textContent = text;
    _tooltip.style.display = 'block';
}

function _hideTooltip() {
    _tooltip.style.display = 'none';
}

document.addEventListener('mouseover', (e) => {
    const campo = e.target.closest('.campo-calculado');
    if (campo) {
        _showTooltip('Campo calculado según la edad del alumno');
        return;
    }
    const sidebarTip = e.target.closest('[data-tooltip]');
    if (sidebarTip && document.getElementById('sidebar')?.classList.contains('collapsed')) {
        _showTooltip(sidebarTip.dataset.tooltip);
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.campo-calculado') || e.target.closest('[data-tooltip]')) {
        _hideTooltip();
    }
});

document.addEventListener('mousemove', (e) => {
    if (_tooltip.style.display === 'block') {
        _tooltip.style.left = (e.clientX + 14) + 'px';
        _tooltip.style.top  = (e.clientY - 28) + 'px';
    }
});

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

    // Sidebar Toggle (logo + botón circular)
    const logoToggle = document.getElementById('logoToggle');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');

    function toggleSidebar() {
        if (sidebar) sidebar.classList.toggle('collapsed');
    }

    if (logoToggle) logoToggle.addEventListener('click', toggleSidebar);
    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', toggleSidebar);
});