document.addEventListener('DOMContentLoaded', () => {
    const modal         = document.getElementById('modalNfc');
    const inputInvisible = document.getElementById('nfcInput');
    const statusMsg     = document.getElementById('nfc-status-msg');

    const closeModalNfc = () => {
        modal.classList.remove('show');
        inputInvisible.value = '';
        statusMsg.innerHTML  = '';
    };

    document.getElementById('btnOpenNfcModal').onclick = () => {
        modal.classList.add('show');
        statusMsg.innerHTML  = '<small><i class="fa-solid fa-spinner fa-spin"></i> Esperando tarjeta...</small>';
        inputInvisible.value = '';
        inputInvisible.focus();
    };

    document.getElementById('closeModalNfc').onclick = closeModalNfc;
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModalNfc(); });

    // Lectura NFC → añadir nueva tarjeta al sistema
    inputInvisible.addEventListener('keydown', async (e) => {
        if (e.key !== 'Enter') return;
        const uid = inputInvisible.value.trim();
        if (!uid) return;

        statusMsg.innerHTML = '<i class="fa-solid fa-sync fa-spin"></i> Procesando...';

        try {
            const respuesta = await API_NFC.añadir(uid);
            if (respuesta.status === 'ok') {
                UI_NFC.notificarModal(respuesta.message, 'ok');
                setTimeout(async () => {
                    modal.classList.remove('show');
                    await window.recargarTablaNfc();
                }, 2000);
            } else {
                UI_NFC.notificarModal(respuesta.message, 'error');
                inputInvisible.value = '';
                inputInvisible.focus();
            }
        } catch (error) {
            UI_NFC.notificarModal('Error técnico al conectar con el servidor', 'error');
        }
    });
});

window.eliminarCard = function(uid) {
    UI_NFC.abrirModalEliminar(uid);
};

window.desvincularCard = function(uid) {
    UI_NFC.abrirModalDesvincular(uid);
};
