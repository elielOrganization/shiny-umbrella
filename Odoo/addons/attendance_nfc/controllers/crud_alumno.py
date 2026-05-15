import csv
import io
from odoo import http, fields
from odoo.http import request
from datetime import date 
import logging, re

_logger = logging.getLogger(__name__)

GRUPOS_VALIDOS = {
    f'{curso} {seccion}'
    for curso in ['1º ESO', '2º ESO', '3º ESO', '4º ESO', '1º BACH', '2º BACH']
    for seccion in ['A', 'B', 'C', 'D']
}

class NfcCrudAlumnoController(http.Controller):

    @http.route('/nfc/import_alumnos', type='json', auth='user', methods=['POST'], csrf=False)
    def import_alumnos_csv(self, **kwargs):
        csv_content = request.params.get('csv_data')

        if not csv_content:
            return {"status": "error", "message": "No se recibió el contenido del CSV"}

        try:
            f = io.StringIO(csv_content)
            reader = csv.DictReader(f)

            AlumnoModel   = request.env['nfc.alumno'].sudo()
            ProfesorModel = request.env['nfc.profesor'].sudo()
            count = 0

            for row in reader:
                dni      = (row.get('dni') or '').strip()
                nombre   = (row.get('nombre') or '').strip()
                apellido = (row.get('apellido') or '').strip()
                grupo    = (row.get('grupo_clase') or '').strip()

                if not dni or not nombre or not apellido:
                    continue
                if not re.match(r'^\d{8}[A-Z]$', dni):
                    continue
                if grupo not in GRUPOS_VALIDOS:
                    continue
                if ProfesorModel.search([('dni', '=', dni)], limit=1):
                    continue

                vals = {
                    'nombre': nombre,
                    'apellido': apellido,
                    'fecha_nacimiento': (row.get('fecha_nacimiento') or '').strip() or False,
                    'grupo_clase': grupo,
                    'dni': dni,
                    'uid': '',
                    'permiso_salida': False,
                    'permiso_recreo': False,
                    'permiso_transporte': False,
                }

                alumno_instancia = AlumnoModel.search([('dni', '=', dni)], limit=1)
                if alumno_instancia:
                    alumno_instancia.write(vals)
                else:
                    AlumnoModel.create(vals)
                count += 1

            return {"status": "ok", "message": f"Se han procesado {count} alumnos correctamente."}

        except Exception as e:
            _logger.error(f"Error en la importación: {str(e)}")
            return {"status": "error", "message": f"Error procesando CSV: {str(e)}"}
    
    @http.route('/nfc/get_alumnos', type='json', auth='user', methods=['POST'], csrf=False)
    def get_all_alumnos(self, **kwargs):
        try:
            # Buscamos todos los alumnos y seleccionamos los campos que necesita el frontend
            # search_read devuelve una lista de diccionarios directamente
            alumnos_data = request.env['nfc.alumno'].sudo().search_read(
                [], # Filtro vacío para traer todos
                ['nombre', 'apellido', 'dni', 'uid', 'fecha_nacimiento', 'permiso_salida', 'permiso_recreo', 'permiso_transporte', 'grupo_clase'] # Campos específicos
            )

            _logger.info(f"### [GET_ALUMNOS] Enviando {len(alumnos_data)} registros al frontend")

            return {
                "status": "ok",
                "alumnos": alumnos_data
            }

        except Exception as e:
            _logger.error(f"Error al obtener alumnos: {str(e)}")
            return {"status": "error", "message": "No se pudo recuperar la lista de alumnos"}
    
    @http.route('/nfc/update_transporte', type='json', auth='user', methods=['POST'], csrf=False)
    def update_transporte(self, **kwargs):
        data = request.params
        dni = data.get("dni")
        # El valor booleano que envía el frontend
        nuevo_estado = data.get("permiso_transporte")

        # Validación básica de parámetros
        if dni is None or nuevo_estado is None:
            return {"status": "error", "message": "Faltan parámetros: dni o permiso_transporte"}

        try:
            alumno = request.env['nfc.alumno'].sudo().search([('dni', '=', dni)], limit=1)

            if not alumno:
                return {"status": "error", "message": f"No se encontró el alumno con DNI: {dni}"}

            alumno.write({
                'permiso_transporte': bool(nuevo_estado)
            })

            _logger.info(f"Transporte actualizado: Alumno {alumno.nombre} ahora tiene permiso={nuevo_estado}")

            return {
                "status": "ok",
                "message": f"Permiso de transporte actualizado para {alumno.nombre}",
                "nuevo_estado": alumno.permiso_transporte
            }

        except Exception as e:
            _logger.error(f"Error al actualizar transporte: {str(e)}")
            return {"status": "error", "message": "Error interno al actualizar el registro"}
    
    @http.route('/nfc/create_alumno', type='json', auth='user', methods=['POST'], csrf=False)
    def create_alumno(self, **kwargs):
        data     = request.params
        nombre   = (data.get('nombre') or '').strip()
        apellido = (data.get('apellido') or '').strip()
        dni      = (data.get('dni') or '').strip()
        fecha    = (data.get('fecha_nacimiento') or '').strip()
        grupo    = (data.get('grupo_clase') or '').strip()

        if not all([nombre, apellido, dni, fecha, grupo]):
            return {"status": "error", "message": "Faltan campos obligatorios (nombre, apellido, dni, fecha de nacimiento o grupo)"}

        if not re.match(r'^\d{8}[A-Z]$', dni):
            return {"status": "error", "message": "Formato de DNI inválido (Ej: 12345678Z)"}

        if grupo not in GRUPOS_VALIDOS:
            return {"status": "error", "message": f"Grupo '{grupo}' no válido. Usa el formato '1º ESO A', '2º BACH C', etc."}

        try:
            AlumnoModel   = request.env['nfc.alumno'].sudo()
            ProfesorModel = request.env['nfc.profesor'].sudo()

            if AlumnoModel.search([('dni', '=', dni)], limit=1):
                return {"status": "error", "message": f"Ya existe un alumno con el DNI {dni}"}

            if ProfesorModel.search([('dni', '=', dni)], limit=1):
                return {"status": "error", "message": f"El DNI {dni} ya está registrado como profesor"}

            AlumnoModel.create({
                'nombre': nombre,
                'apellido': apellido,
                'dni': dni,
                'fecha_nacimiento': fecha,
                'grupo_clase': grupo,
                'uid': False,
                'permiso_transporte': False,
            })

            return {"status": "ok", "message": "Creado correctamente"}

        except Exception as e:
            _logger.error(f"Error: {str(e)}")
            return {"status": "error", "message": f"Error interno: {str(e)}"}