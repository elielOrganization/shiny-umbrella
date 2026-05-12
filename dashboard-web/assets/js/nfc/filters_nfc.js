// filters_nfc.js

window.applyNfcFilters = function() {
    const searchTerm = (document.getElementById('nfcSearch')?.value || '').toLowerCase().trim();

    const activoChecked = Array.from(document.querySelectorAll('input[name="filter-nfc-activo"]:checked')).map(cb => cb.value);
    const vinculoChecked = Array.from(document.querySelectorAll('input[name="filter-nfc-vinculo"]:checked')).map(cb => cb.value);

    document.querySelectorAll('#tableBodyNfc .table-row').forEach(row => {
        const texto = row.textContent.toLowerCase();
        const activo = row.getAttribute('data-activo') || '';
        const vinculo = row.getAttribute('data-vinculo') || '';

        let cumple = true;

        if (searchTerm && !texto.includes(searchTerm)) cumple = false;
        if (cumple && activoChecked.length > 0 && !activoChecked.includes(activo)) cumple = false;
        if (cumple && vinculoChecked.length > 0 && !vinculoChecked.includes(vinculo)) cumple = false;

        row.style.setProperty('display', cumple ? '' : 'none', 'important');
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('btnFilterToggleNfc');
    const filterMenu = document.getElementById('filterMenuNfc');
    const btnApply = document.getElementById('btnApplyFiltersNfc');
    const btnClear = document.getElementById('btnClearFiltersNfc');
    const searchInput = document.getElementById('nfcSearch');

    if (btnToggle) {
        btnToggle.onclick = (e) => {
            e.stopPropagation();
            filterMenu.classList.toggle('show');
        };
        document.addEventListener('click', (e) => {
            if (!filterMenu.contains(e.target) && !btnToggle.contains(e.target)) {
                filterMenu.classList.remove('show');
            }
        });
    }

    if (btnApply) {
        btnApply.onclick = () => {
            window.applyNfcFilters();
            filterMenu.classList.remove('show');
        };
    }

    if (btnClear) {
        btnClear.onclick = () => {
            document.querySelectorAll('#filterMenuNfc input[type="checkbox"]').forEach(cb => cb.checked = false);
            if (searchInput) searchInput.value = '';
            window.applyNfcFilters();
            filterMenu.classList.remove('show');
        };
    }

    if (searchInput) {
        searchInput.oninput = () => window.applyNfcFilters();
    }
});
