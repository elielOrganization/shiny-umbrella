import csv
import io
from odoo import http, fields
from odoo.http import request
from datetime import date 
import logging, re

_logger = logging.getLogger(__name__)

DEPARTAMENTOS_VALIDOS = {'Matemáticas', 'Lengua', 'Inglés', 'Ciencias', 'Historia', 'Tecnología'}

class NfcCrudProfesorController(http.Controller):

    @http.route('/nfc/import_profesores', type='json', auth='user', methods=['POST'], csrf=False)
    def import_profesores_csv(self, **kwargs):
        csv_content = request.params.get('csv_data')

        if not csv_content:
            return {"status": "error", "message": "No se recibió el contenido del CSV"}

        try:
            f = io.StringIO(csv_content)
            reader = csv.DictReader(f)

            ProfesorModel = request.env['nfc.profesor'].sudo()
            AlumnoModel   = request.env['nfc.alumno'].sudo()

            dnis_alumnos = set(AlumnoModel.search([]).mapped('dni'))
            count = 0
            rechazados = []

            for row in reader:
                dni          = (row.get('dni') or '').strip()
                nombre       = (row.get('nombre') or '').strip()
                apellido     = (row.get('apellido') or '').strip()
                departamento = (row.get('departamento') or '').strip()

                if not dni or not nombre or not apellido:
                    rechazados.append({'nombre': nombre or '?', 'apellido': apellido or '?', 'razon': 'Datos incompletos'})
                    continue
                if not re.match(r'^\d{8}[A-Z]$', dni):
                    rechazados.append({'nombre': nombre, 'apellido': apellido, 'razon': f'DNI inválido: {dni}'})
                    continue
                if departamento not in DEPARTAMENTOS_VALIDOS:
                    rechazados.append({'nombre': nombre, 'apellido': apellido, 'razon': f'Departamento inválido: {departamento or "(vacío)"}'})
                    continue
                if dni in dnis_alumnos:
                    rechazados.append({'nombre': nombre, 'apellido': apellido, 'razon': 'DNI ya registrado como alumno'})
                    continue

                vals = {
                    'nombre': nombre,
                    'apellido': apellido,
                    'dni': dni,
                    'departamento': departamento,
                    'uid': '',
                    'estado': True
                }

                profesor_instancia = ProfesorModel.search([('dni', '=', dni)], limit=1)
                if profesor_instancia:
                    profesor_instancia.write(vals)
                else:
                    ProfesorModel.create(vals)
                count += 1

            if count == 0:
                return {"status": "error", "message": f"No se importó ningún profesor ({len(rechazados)} filas rechazadas).", "rechazados": rechazados}
            return {"status": "ok", "message": f"Se han procesado {count} profesores correctamente.", "rechazados": rechazados}

        except Exception as e:
            _logger.error(f"Error en la importación de profesores: {str(e)}")
            return {"status": "error", "message": f"Error procesando CSV: {str(e)}"}

    @http.route('/nfc/get_profesores', type='json', auth='user', methods=['POST'], csrf=False)
    def get_all_profesores(self, **kwargs):
        try:
            # Buscamos todos los profesores y seleccionamos los campos que necesita el frontend
            # search_read devuelve una lista de diccionarios directamente
            profesores_data = request.env['nfc.profesor'].sudo().search_read(
                [], # Filtro vacío para traer todos
                ['nombre', 'apellido', 'dni', 'uid', 'departamento', 'estado',] # Campos específicos
            )

            _logger.info(f"### [GET_PROFESORES] Enviando {len(profesores_data)} registros al frontend")

            return {
                "status": "ok",
                "profesores": profesores_data
            }

        except Exception as e:
            _logger.error(f"Error al obtener profesores: {str(e)}")
            return {"status": "error", "message": "No se pudo recuperar la lista de profesores"}
    
    @http.route('/nfc/update_estado_profesor', type='json', auth='user', methods=['POST'], csrf=False)
    def update_estado_profesor(self, **kwargs):
        data = request.params
        dni = data.get("dni")
        # El valor booleano para el campo 'estado'
        nuevo_estado = data.get("estado")

        if dni is None or nuevo_estado is None:
            return {"status": "error", "message": "Faltan parámetros: dni o estado"}

        try:
            profesor = request.env['nfc.profesor'].sudo().search([('dni', '=', dni)], limit=1)

            if not profesor:
                return {"status": "error", "message": f"No se encontró el profesor con DNI: {dni}"}

            profesor.write({
                'estado': bool(nuevo_estado)
            })

            _logger.info(f"Estado actualizado: Profesor {profesor.nombre} ahora está activo={nuevo_estado}")

            return {
                "status": "ok",
                "message": f"Estado del profesor {profesor.nombre} actualizado correctamente",
                "nuevo_estado": profesor.estado
            }

        except Exception as e:
            _logger.error(f"Error al actualizar estado del profesor: {str(e)}")
            return {"status": "error", "message": "Error interno al actualizar el profesor"}
    
    @http.route('/nfc/create_profesor', type='json', auth='user', methods=['POST'], csrf=False)
    def create_profesor(self, **kwargs):
        data         = request.params
        nombre       = (data.get('nombre') or '').strip()
        apellido     = (data.get('apellido') or '').strip()
        dni          = (data.get('dni') or '').strip()
        departamento = (data.get('departamento') or '').strip()

        if not all([nombre, apellido, dni, departamento]):
            return {"status": "error", "message": "Faltan campos obligatorios (nombre, apellido, dni o departamento)"}

        if not re.match(r'^\d{8}[A-Z]$', dni):
            return {"status": "error", "message": "Formato de DNI inválido (Ej: 12345678Z)"}

        if departamento not in DEPARTAMENTOS_VALIDOS:
            return {"status": "error", "message": f"Departamento '{departamento}' no válido"}

        try:
            ProfesorModel = request.env['nfc.profesor'].sudo()
            AlumnoModel   = request.env['nfc.alumno'].sudo()

            if ProfesorModel.search([('dni', '=', dni)], limit=1):
                return {"status": "error", "message": f"Ya existe un profesor con el DNI {dni}"}

            if AlumnoModel.search([('dni', '=', dni)], limit=1):
                return {"status": "error", "message": f"El DNI {dni} ya está registrado como alumno"}

            ProfesorModel.create({
                'nombre': nombre,
                'apellido': apellido,
                'dni': dni,
                'departamento': departamento,
                'uid': False,
                'estado': True
            })

            return {"status": "ok", "message": "Creado correctamente"}

        except Exception as e:
            _logger.error(f"Error al crear profesor: {str(e)}")
            return {"status": "error", "message": f"Error interno: {str(e)}"}