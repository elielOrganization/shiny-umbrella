// profesores/nfc.js

window.activeProfDni = null;

window.prepararAsignacionNFCProf = function(btn) {
    const dni    = btn.getAttribute('data-dni');
    const nombre = btn.getAttribute('data-nombre');

    if (!dni || dni === '' || dni === 'false') {
        alert('Este profesor no tiene DNI asignado en Odoo.');
        return;
    }

    window.activeProfDni = dni;

    Modales.abrirVincularNfc({
        nombre,
        tipoLabel: 'Profesor',
        onAssign: async (uid) => {
            const res = await apiFetch(GLOBALS.URL_ASSIGN_CARD, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ uid, dni, tipo: 'profesor' })
            }).then(r => r.json());
            if (res.status === 'error') throw new Error(res.message || 'Error al vincular');
            return res;
        },
        onSuccess: () => {
            if (typeof window.fetchProfesores === 'function') window.fetchProfesores();
        }
    });
};

window.confirmarDesvincularNFCProf = function(uid, nombre) {
    Modales.abrirDesvincular({
        cuerpo:   `Se desvinculará la tarjeta de <strong style="color:#d97706;">${nombre}</strong>. La tarjeta permanecerá en el sistema.`,
        onConfirm: async () => {
            const res = await apiFetch(GLOBALS.URL_UNLINK_CARD, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ uid })
            }).then(r => r.json());

            if (res.error) throw new Error(res.error.message || 'Error al desvincular');
            Modales.cerrarDesvincular();
            if (typeof window.fetchProfesores === 'function') window.fetchProfesores();
        }
    });
};
