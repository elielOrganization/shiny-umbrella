// nfc.js
document.addEventListener('DOMContentLoaded', () => {
    let currentStudentDni = "";

    const nfcModal      = document.getElementById('nfcModal');
    const nfcInput      = document.getElementById('nfcInput');
    const nfcContent    = document.getElementById('nfcContent');
    const nfcProcessing = document.getElementById('nfcProcessing');
    const nfcStatusLogo = document.getElementById('nfcStatusLogo');
    const nfcStatusText = document.getElementById('nfcStatusText');

    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn-vincular')) {
            currentStudentDni = e.target.getAttribute('data-dni');

            if (!currentStudentDni || currentStudentDni === "false") {
                return alert("Error: Este alumno no tiene un DNI/VAT válido en Odoo.");
            }

            resetNfcModal();
            if (nfcModal) {
                nfcModal.classList.add('show');
                setTimeout(() => nfcInput.focus(), 250);
            }
        }
    });

    if (nfcInput) {
        nfcInput.addEventListener('input', async (e) => {
            const uid = e.target.value.trim();

            if (uid.length >= 8) {
                console.log("UID Capturado:", uid, "para DNI:", currentStudentDni);

                if (nfcContent)    nfcContent.style.display    = 'none';
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
                    const res = await AlumnosAPI.assignCard(uid, currentStudentDni);

                    if (res.status === 'error') {
                        throw new Error(res.message || "Error al vincular");
                    }

                    if (nfcStatusLogo) {
                        nfcStatusLogo.src = '../assets/img/logo_umbrella_success.png';
                        nfcStatusLogo.classList.remove('spinning-umbrella');
                    }
                    if (nfcStatusText) {
                        nfcStatusText.textContent = res.message || "¡Tarjeta vinculada correctamente!";
                        nfcStatusText.style.color = "#10b981";
                    }

                    setTimeout(() => {
                        nfcModal.classList.remove('show');
                        if (typeof window.fetchAlumnos === 'function') window.fetchAlumnos();
                    }, 2000);

                } catch (error) {
                    console.error("Error en vinculación:", error);

                    if (nfcStatusLogo) {
                        nfcStatusLogo.src = '../assets/img/logo_umbrella_error.png';
                        nfcStatusLogo.classList.remove('spinning-umbrella');
                    }
                    if (nfcStatusText) {
                        nfcStatusText.textContent = error.message;
                        nfcStatusText.style.color = "#ef4444";
                    }

                    shakeModal(nfcModal.querySelector('.modal-card'));

                    setTimeout(() => {
                        e.target.value = "";
                        if (nfcContent)    nfcContent.style.display    = 'block';
                        if (nfcProcessing) nfcProcessing.style.display = 'none';
                        nfcInput.focus();
                    }, 3500);
                }
            }
        });
    }

    function resetNfcModal() {
        if (!nfcInput) return;
        nfcInput.value = "";
        if (nfcContent)    nfcContent.style.display    = 'block';
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
