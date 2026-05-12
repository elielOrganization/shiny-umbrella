/**
 * Lógica para la gestión de la tabla de vinculación NFC
 */
window.API_NFC = {
    obtenerTodas: async function() {
        const response = await fetch(GLOBALS.URL_GET_CARDS);
        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "Error en Odoo");
        return (data.result && data.result.cards) ? data.result.cards : [];
    },

    añadir: async function(uid) {
        try {
            const response = await fetch(GLOBALS.URL_SAVE_CARD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: uid })
            });
            const data = await response.json();
            
            if (data.error) throw new Error(data.error.message || "Error de conexión");

            // Devolvemos data.result que contiene {status: "ok/error", message: "..."}
            return data.result; 
        } catch (error) {
            console.error("Error en API_NFC.añadir:", error);
            throw error;
        }
    },

    eliminar: async function(uid) {
        try {
            const response = await fetch(GLOBALS.URL_DELETE_CARD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: uid })
            });
            const data = await response.json();
            
            if (data.error) throw new Error(data.error.message || "Error al eliminar en Odoo");
            
            return data.result; // Esperamos { status: "ok", message: "..." }
        } catch (error) {
            console.error("Error en API_NFC.eliminar:", error);
            throw error;
        }
    },

    desvincular: async function(uid) {
        try {
            const response = await fetch(GLOBALS.URL_UNLINK_CARD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: uid })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "Error en Odoo");
            return data.result;
        } catch (error) {
            console.error("Error en desvincular:", error);
            throw error;
        }
    }
};

async function cargarTablaCompleta() {
    try {
        const [cards, dataAlumnos, dataProfesores] = await Promise.all([
            API_NFC.obtenerTodas(),
            fetch(GLOBALS.URL_GET_ALUMNOS).then(r => r.json()),
            fetch(GLOBALS.URL_GET_PROFESORES).then(r => r.json())
        ]);

        const alumnos = dataAlumnos.result?.alumnos || [];
        const profesores = dataProfesores.result?.profesores || [];

        const mapaUid = {};
        alumnos.forEach(a => { if (a.uid) mapaUid[a.uid] = `${a.nombre} ${a.apellido} (Alumno)`; });
        profesores.forEach(p => { if (p.uid) mapaUid[p.uid] = `${p.nombre} ${p.apellido} (Profesor)`; });

        UI_NFC.renderizarTabla(cards, mapaUid);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('tableBodyNfc').innerHTML = `<p style="color:red; padding:20px;">${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', cargarTablaCompleta);
window.recargarTablaNfc = cargarTablaCompleta;