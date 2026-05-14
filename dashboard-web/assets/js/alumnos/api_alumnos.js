const AlumnosAPI = {
    async getAlumnos() {
        const response = await apiFetch(GLOBALS.URL_GET_ALUMNOS);
        return response.json();
    },

    async assignCard(uid, dni) {
        try {
            const response = await apiFetch(GLOBALS.URL_ASSIGN_CARD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, dni })
            });
            
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || "Error en el servidor Odoo");
            }

            if (data.status === 'error') {
                throw new Error(data.message || "Error desconocido en el proceso");
            }

            return data; 
        } catch (error) {
            throw error;
        }
    },

    async updateTransporte(dni, valor) {
        const response = await apiFetch(GLOBALS.URL_UPDATE_TRANSPORTE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni, valor })
        });
        return response.json();
    },

    async updateEstado(dni, valor) {
        const response = await apiFetch(GLOBALS.URL_UPDATE_ESTADO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni, valor })
        });
        return response.json();
    },

    async updateAlumno(datos) {
        const response = await apiFetch(GLOBALS.URL_UPDATE_PROFESOR, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        return response.json();
    },

    async deleteAlumno(dni) {
        const response = await apiFetch(GLOBALS.URL_DELETE_PERSONA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni })
        });
        return response.json();
    }
};