// filters.js

window.applyFilters = function() {
    // 1. Capturar valores
    const searchInput = document.getElementById('tableSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const checkedCursos = Array.from(document.querySelectorAll('input[name="filter-curso"]:checked')).map(cb => cb.value);
    const filterNoNfc = document.querySelector('input[name="filter-no-nfc"]')?.checked;
    const filterTrans = document.querySelector('input[name="filter-transporte"]')?.checked;
    const filterMayor = document.querySelector('input[name="filter-mayor"]')?.checked;
    const filterMenor = document.querySelector('input[name="filter-menor"]')?.checked;

    // 2. Buscar filas (intentamos varios selectores por si acaso)
    const rows = document.querySelectorAll('.table-row');
    
    console.log(`[Filtros] Buscando: "${searchTerm}", Cursos: ${checkedCursos.length}, Filas encontradas: ${rows.length}`);

    rows.forEach((row, index) => {
        // Extraer datos asegurando que no sean null
        const rowCurso = (row.getAttribute('data-curso') || "").trim();
        const rowNfc = row.getAttribute('data-nfc') || "";
        const rowTrans = row.getAttribute('data-transporte') || "";
        const esMayor = row.getAttribute('data-es-mayor') || "";
        const textoFila = row.textContent.toLowerCase();

        let cumple = true;

        // Filtro de Texto
        if (searchTerm && !textoFila.includes(searchTerm)) cumple = false;

        // Filtro de Curso (Comparación exacta)
        if (cumple && checkedCursos.length > 0) {
            if (!checkedCursos.includes(rowCurso)) cumple = false;
        }

        // Filtros booleanos
        if (cumple && filterNoNfc && rowNfc !== 'no') cumple = false;
        if (cumple && filterTrans && rowTrans !== 'yes') cumple = false;
        if (cumple && filterMayor && esMayor !== 'yes') cumple = false;
        if (cumple && filterMenor && esMayor !== 'no') cumple = false;

        // Aplicar cambio
        row.style.setProperty('display', cumple ? '' : 'none', 'important');
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('btnFilterToggle');
    const filterMenu = document.getElementById('filterMenu');
    const btnApply = document.getElementById('btnApplyFilters');
    const btnClear = document.getElementById('btnClearFilters');
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