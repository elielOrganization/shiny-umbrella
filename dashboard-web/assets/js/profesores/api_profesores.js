/**
 * @file api_profesores.js
 * @description Módulo completo para la comunicación con el servidor y Odoo 18.
 * @author Paragüillas Aceitado
 */

window.API_Profesores = {

    // --- LECTURA ---
    obtenerTodos: async function() {
        const response = await apiFetch(GLOBALS.URL_GET_PROFESORES);
        const data = await response.json();
        this._validarErrores(data);
        return data.result.profesores || [];
    },

    // --- ACTUALIZACIÓN ---
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

    // --- CREACIÓN ---
    añadirManual: async function(datos) {
        const response = await apiFetch(GLOBALS.URL_IMPORT_PROFESOR_MANUAL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await response.json();
        this._validarErrores(data);
        return data.result;
    },

    // --- ELIMINACIÓN ---
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

    // --- CSV ---
    // Acepta un File o directamente el texto (para evitar doble lectura)
    subirCSV: async function(archivoOTexto) {
        const csvContent = (typeof archivoOTexto === 'string')
            ? archivoOTexto
            : await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload  = e => resolve(e.target.result);
                reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
                reader.readAsText(archivoOTexto);
              });

        const response = await apiFetch(GLOBALS.URL_UPLOAD_CSV_PROFESOR, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csv_content: csvContent })
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        this._validarErrores(data);
        return data.result;
    },

    actualizarEstado: async function(dni, estado) {
        const response = await apiFetch(GLOBALS.URL_UPDATE_ESTADO, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni: dni, valor: estado })
        });
        const data = await response.json();
        this._validarErrores(data);
        return data.result;
    },

    // --- INTERNO ---
    _validarErrores: function(data) {
        if (data.error) throw new Error(data.error.data?.message || data.error.message || "Error interno en Odoo");
        const res = data.result || {};
        if (res.error) throw new Error(res.error);
    }
};