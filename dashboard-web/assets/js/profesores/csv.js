document.addEventListener('DOMContentLoaded', () => {
    // 1. REFERENCIAS (Usando tus IDs de Profesores)
    const csvProfModal = document.getElementById('csvProfModal');
    const manualProfModal = document.getElementById('manualProfModal');
    const btnAñadirManualProf = document.getElementById('btnAñadirManualProf');
    
    const dropZoneProf = document.getElementById('dropZoneProf');
    const fileInputProf = document.getElementById('fileInputProf');
    const processingAreaProf = document.getElementById('processingAreaProf');
    const statusLogoProf = document.getElementById('statusLogoProf');
    const statusTextProf = document.getElementById('statusTextProf');

    // --- ABRIR EXPLORADOR DE ARCHIVOS ---
    if (dropZoneProf && fileInputProf) {
        dropZoneProf.addEventListener('click', () => {
            fileInputProf.click(); // Esto abre la ventana de selección
        });

        fileInputProf.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleProfCsv(e.target.files[0]);
        });
    }

    // --- CAMBIO A MANUAL ---
    if (btnAñadirManualProf) {
        btnAñadirManualProf.addEventListener('click', (e) => {
            e.preventDefault();
            csvProfModal.classList.remove('show');
            if(manualProfModal) manualProfModal.classList.add('show');
        });
    }

    // --- PROCESAR CSV ---
    function handleProfCsv(file) {
        if(!dropZoneProf || !processingAreaProf) return;

        // UI: Ocultar zona de carga, mostrar spinner
        dropZoneProf.style.display = 'none';
        processingAreaProf.style.display = 'flex';
        statusLogoProf.classList.add('spinning');
        statusTextProf.textContent = "Procesando profesores...";
        
        // Limpiar resumen anterior si existe
        const oldSummary = processingAreaProf.querySelector('.import-summary');
        if(oldSummary) oldSummary.remove();

        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = function(e) {
            const content = e.target.result;
            const lines = content.split('\n');
            let summaryHTML = '<ul class="summary-list">';
            let count = 0;

            // Generar resumen (Nombre + Apellido y Departamento)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const cols = line.split(',');
                    if (cols.length >= 4) {
                        summaryHTML += `<li><span>${cols[0].trim()} ${cols[1].trim()}</span><strong>${cols[3].trim()}</strong></li>`;
                        count++;
                    }
                }
            }
            summaryHTML += '</ul>';

            // Enviar al PHP
            fetch('../controllers/import_prof_csv.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csv_content: content })
            })
            .then(res => res.json())
            .then(data => {
                statusLogoProf.classList.remove('spinning');
                if (data.result) {
                    // Mantengo tu logo Umbrella pero cambio el texto
                    statusTextProf.innerHTML = `¡Importado con éxito! (${count} profesores)`;
                    statusTextProf.classList.add('success');

                    const summaryDiv = document.createElement('div');
                    summaryDiv.className = 'import-summary';
                    summaryDiv.innerHTML = summaryHTML;
                    processingAreaProf.appendChild(summaryDiv);

                    setTimeout(() => {
                        csvProfModal.classList.remove('show');
                        resetProfCsvModal();
                        if (typeof fetchProfesores === 'function') fetchProfesores();
                    }, 4000);
                } else {
                    throw new Error(data.error?.data?.message || "Error en el servidor");
                }
            })
            .catch(err => {
                statusLogoProf.classList.remove('spinning');
                statusTextProf.textContent = "Error: " + err.message;
                statusTextProf.classList.add('error');
                setTimeout(() => resetProfCsvModal(), 4000);
            });
        };
    }

    function resetProfCsvModal() {
        if (!dropZoneProf) return;
        dropZoneProf.style.display = 'block';
        processingAreaProf.style.display = 'none';
        if(fileInputProf) fileInputProf.value = '';
        statusTextProf.className = 'status-text';
        statusLogoProf.classList.remove('spinning');
    }
});