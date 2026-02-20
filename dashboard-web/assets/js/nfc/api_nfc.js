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

// Carga inicial al estilo de eventos_profesores.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const vinculaciones = await API_NFC.obtenerTodas();
        UI_NFC.renderizarTabla(vinculaciones);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('tableBodyNfc').innerHTML = `<p style="color:red; padding:20px;">${error.message}</p>`;
    }
});