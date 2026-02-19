// filters.js
document.addEventListener('DOMContentLoaded', () => {
    const btnFilterToggle = document.getElementById('btnFilterToggle');
    const filterMenu = document.getElementById('filterMenu');
    const btnApplyFilters = document.getElementById('btnApplyFilters');
    const btnClearFilters = document.getElementById('btnClearFilters');

    if (btnFilterToggle && filterMenu) {
        btnFilterToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            filterMenu.classList.toggle('show');
        });

        btnApplyFilters.addEventListener('click', () => {
            applyFilters();
            filterMenu.classList.remove('show');
        });

        btnClearFilters.addEventListener('click', () => {
            document.querySelectorAll('.filter-menu input[type="checkbox"]').forEach(cb => cb.checked = false);
            applyFilters();
        });

        function applyFilters() {
            const checkedCursos = Array.from(document.querySelectorAll('input[name="filter-curso"]:checked')).map(cb => cb.value);
            const filterNoNfc = document.querySelector('input[name="filter-no-nfc"]')?.checked;
            const filterTrans = document.querySelector('input[name="filter-transporte"]')?.checked;
            const filterMayor = document.querySelector('input[name="filter-mayor"]')?.checked;
            const filterMenor = document.querySelector('input[name="filter-menor"]')?.checked;

            document.querySelectorAll('.table-row').forEach(row => {
                const rowCurso = row.getAttribute('data-curso');
                const rowNfc = row.getAttribute('data-nfc');
                const rowTrans = row.getAttribute('data-transporte');
                const esMayor = row.getAttribute('data-es-mayor');

                let show = true;

                if (checkedCursos.length > 0 && !checkedCursos.some(c => rowCurso.includes(c))) show = false;
                if (filterNoNfc && rowNfc !== 'no') show = false;
                if (filterTrans && rowTrans !== 'yes') show = false;
                if (filterMayor && esMayor !== 'yes') show = false;
                if (filterMenor && esMayor !== 'no') show = false;

                row.style.display = show ? 'grid' : 'none';
            });
        }
    }
});