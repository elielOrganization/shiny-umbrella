// nfc.js
document.addEventListener('DOMContentLoaded', () => {
    let currentStudentDni = "";    

    const nfcModal = document.getElementById('nfcModal');
    const nfcInput = document.getElementById('nfcInput');
    const nfcContent = document.getElementById('nfcContent');
    const nfcProcessing = document.getElementById('nfcProcessing');
    const nfcStatusLogo = document.getElementById('nfcStatusLogo');
    const nfcStatusText = document.getElementById('nfcStatusText');

    // 1. ABRIR MODAL AL CLICAR VINCULAR
    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn-vincular')) {
            currentStudentDni = e.target.getAttribute('data-dni'); 
            
            if (!currentStudentDni || currentStudentDni === "false") {
                return alert("Error: Este alumno no tiene un DNI/VAT válido en Odoo.");
            }

            resetNfcModal();
            if (nfcModal) {
                nfcModal.classList.add('show');
                // Pequeño delay para asegurar que el input reciba el foco
                setTimeout(() => nfcInput.focus(), 250);
            }
        }
    });

    // 2. PROCESAR LECTURA NFC (Evento 'input' para automatismo)
    if (nfcInput) {
        nfcInput.addEventListener('input', async (e) => {
            const uid = e.target.value.trim();

            // Los lectores suelen enviar el código de golpe (8-10 caracteres)
            if (uid.length >= 8) {
                console.log("UID Capturado:", uid, "para DNI:", currentStudentDni);

                // Cambiar a estado visual "Procesando"
                if (nfcContent) nfcContent.style.display = 'none';
                if (nfcProcessing) nfcProcessing.style.display = 'block';
                
                if (nfcStatusLogo) {
                    nfcStatusLogo.src = '../assets/img/logo_umbrella.png';
                    nfcStatusLogo.classList.add('spinning-umbrella');
                }
                if (nfcStatusText) {
                    nfcStatusText.textContent = "Sincronizando con Odoo...";
                    nfcStatusText.style.color = "#64748b";
                }

                try {
                    // Llamada a la API (debe devolver el JSON con status y message)
                    const res = await AlumnosAPI.assignCard(uid, currentStudentDni);

                    // Si Odoo devuelve un error de lógica de negocio
                    if (res.status === 'error') {
                        throw new Error(res.message || "Error al vincular");
                    }

                    // --- ÉXITO ---
                    if (nfcStatusLogo) {
                        nfcStatusLogo.src = '../assets/img/logo_umbrella_success.png';
                        nfcStatusLogo.classList.remove('spinning-umbrella');
                    }
                    if (nfcStatusText) {
                        nfcStatusText.textContent = res.message || "¡Tarjeta vinculada correctamente!";
                        nfcStatusText.style.color = "#10b981"; // Verde
                    }

                    // Cerrar modal y refrescar tras 2 segundos
                    setTimeout(() => {
                        nfcModal.classList.remove('show');
                        if (typeof window.fetchAlumnos === 'function') window.fetchAlumnos();
                    }, 2000);

                } catch (error) {
                    // --- ERROR ---
                    console.error("Error en vinculación:", error);

                    if (nfcStatusLogo) {
                        nfcStatusLogo.src = '../assets/img/logo_umbrella_error.png';
                        nfcStatusLogo.classList.remove('spinning-umbrella');
                    }
                    if (nfcStatusText) {
                        // Mostramos el mensaje exacto que mandó el servidor
                        nfcStatusText.textContent = error.message;
                        nfcStatusText.style.color = "#ef4444"; // Rojo
                    }

                    // Efecto visual de error
                    shakeModal(nfcModal.querySelector('.modal-card'));

                    // Permitir reintento tras 3 segundos
                    setTimeout(() => {
                        e.target.value = ""; 
                        if (nfcContent) nfcContent.style.display = 'block';
                        if (nfcProcessing) nfcProcessing.style.display = 'none';
                        nfcInput.focus();
                    }, 3500);
                }
            }
        });
    }

    // 3. FUNCIONES AUXILIARES
    function resetNfcModal() {
        if (!nfcInput) return;
        nfcInput.value = "";
        if (nfcContent) nfcContent.style.display = 'block';
        if (nfcProcessing) nfcProcessing.style.display = 'none';
        
        if (nfcStatusLogo) {
            nfcStatusLogo.src = '../assets/img/logo_umbrella.png';
            nfcStatusLogo.classList.remove('spinning-umbrella');
        }
        if (nfcStatusText) {
            nfcStatusText.textContent = "Acerque la tarjeta al lector";
            nfcStatusText.style.color = "#64748b";
        }
    }

    function shakeModal(element) {
        if (!element) return;
        element.classList.add('shake-error');
        setTimeout(() => element.classList.remove('shake-error'), 500);
    }
});