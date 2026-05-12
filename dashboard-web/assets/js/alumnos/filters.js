// filters.js

window.applyFilters = function() {
    const searchTerm    = (document.getElementById('tableSearch')?.value || '').toLowerCase().trim();
    const checkedCursos = Array.from(document.querySelectorAll('input[name="filter-curso"]:checked')).map(cb => cb.value);
    const filterNoNfc   = !!document.querySelector('input[name="filter-no-nfc"]')?.checked;
    const filterTrans   = !!document.querySelector('input[name="filter-transporte"]')?.checked;
    const filterMayor   = !!document.querySelector('input[name="filter-mayor"]')?.checked;
    const filterMenor   = !!document.querySelector('input[name="filter-menor"]')?.checked;

    if (typeof AlumnosUI !== 'undefined') {
        AlumnosUI.aplicarFiltros(searchTerm, checkedCursos, filterNoNfc, filterTrans, filterMayor, filterMenor);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const btnToggle  = document.getElementById('btnFilterToggle');
    const filterMenu = document.getElementById('filterMenu');
    const btnApply   = document.getElementById('btnApplyFilters');
    const btnClear   = document.getElementById('btnClearFilters');
    const searchInput = document.getElementById('tableSearch');

    if (btnToggle) {
        btnToggle.onclick = (e) => {
            e.stopPropagation();
            filterMenu.classList.toggle('show');
        };
    }

    if (btnApply) {
        btnApply.onclick = () => {
            window.applyFilters();
            filterMenu.classList.remove('show');
        };
    }

    if (btnClear) {
        btnClear.onclick = () => {
            document.querySelectorAll('.filter-menu input[type="checkbox"]').forEach(cb => cb.checked = false);
            if (searchInput) searchInput.value = '';
            window.applyFilters();
        };
    }

    if (searchInput) {
        searchInput.oninput = () => window.applyFilters();
    }
});
