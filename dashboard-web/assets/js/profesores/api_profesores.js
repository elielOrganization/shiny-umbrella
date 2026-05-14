/**
 * @file api_profesores.js
 * @description Módulo completo para la comunicación con el servidor y Odoo 18.
 * @author Paragüillas Aceitado
 */

window.API_Profesores = {
    obtenerTodos: async function() {
        const response = await apiFetch(GLOBALS.URL_GET_PROFESORES);
        const data = await response.json();
        this._validarErrores(data);
        return data.result.profesores || [];
    },

    actualizar: async function(datos) {
        const response = await apiFetch(GLOBALS.URL_UPDATE_PROFESOR, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await response.json();
        this._validarErrores(data);
        return data.result;
    },

    /**
     * Añade un nuevo profesor manualmente.
     */
    añadirManual: async function(datos) {
        const response = await apiFetch(GLOBALS.URL_ADD_PROFESOR, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await response.json();
        this._validarErrores(data);
        return data.result;
    },

    /**
     * Elimina un profesor de la base de datos usando su DNI o ID.
     */
    eliminar: async function(dniOdoo) {
        const response = await apiFetch(GLOBALS.URL_DELETE_PERSONA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni: dniOdoo }) 
        });
        const data = await response.json();
        this._validarErrores(data);
        return data.result;
    },

    /**
     * Sube y procesa un archivo CSV con profesores.
     */
    subirCSV: async function(archivo) {
        const formData = new FormData();
        formData.append('csv_file', archivo);

        const response = await apiFetch(GLOBALS.URL_UPLOAD_CSV_PROFESOR, {
            method: 'POST',
            body: formData // No ponemos Content-Type, el navegador lo calcula al usar FormData
        });
        const data = await response.json();
        this._validarErrores(data);
        return data.result;
    },

    actualizarEstado: async function(dni, estado) {
        // Asegúrate de que el nombre de esta URL coincida con la que tienes en tu config.js
        const response = await apiFetch(GLOBALS.URL_UPDATE_ESTADO, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni: dni, valor: estado })
        });
        const data = await response.json();
        this._validarErrores(data);
        return data.result;
    },

    /**
     * Método interno privado para evitar repetir la validación de errores.
     */
    _validarErrores: function(data) {
        if (data.error) throw new Error(data.error.data?.message || data.error.message || "Error interno en Odoo");
        const res = data.result || {};
        if (res.error) throw new Error(res.error);
    }
};