import csv
import io
from odoo import http, fields
from odoo.http import request
from datetime import date 
import logging, re

_logger = logging.getLogger(__name__)

class NfcCrudAlumnoController(http.Controller):

    @http.route('/nfc/import_alumnos', type='json', auth='public', methods=['POST'], csrf=False)
    def import_alumnos_csv(self, **kwargs):
        # El CSV debe venir como una cadena de texto en la clave 'csv_data'
        csv_content = request.params.get('csv_data')
        
        if not csv_content:
            return {"status": "error", "message": "No se recibió el contenido del CSV"}

        try:
            f = io.StringIO(csv_content)
            # El lector asume que el orden de las columnas es: nombre, apellido, fecha_nacimiento, grupo_clase, dni
            reader = csv.DictReader(f)
            
            AlumnoModel = request.env['nfc.alumno'].sudo()
            count = 0

            for row in reader:
                dni = row.get('dni')

                if not dni:
                    continue
                
                if dni and not re.match(r'^\d{8}[A-Z]$', dni):
                    continue

                # El campo permiso_transporte no se incluye, Odoo usará el default=False
                vals = {
                    'nombre': row.get('nombre'),
                    'apellido': row.get('apellido'),
                    'fecha_nacimiento': row.get('fecha_nacimiento'),
                    'grupo_clase': row.get('grupo_clase'),
                    'dni': dni,
                    'uid': '',
                    'permiso_salida': False,
                    'permiso_recreo': False,
                    'permiso_transporte': False,
                }

                # Usamos el ORM para buscar por DNI
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
    
    @http.route('/nfc/get_alumnos', type='json', auth='public', methods=['POST'], csrf=False)
    def get_all_alumnos(self, **kwargs):
        try:
            # Buscamos todos los alumnos y seleccionamos los campos que necesita el frontend
            # search_read devuelve una lista de diccionarios directamente [cite: 2025-12-29]
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
    
    @http.route('/nfc/update_transporte', type='json', auth='public', methods=['POST'], csrf=False)
    def update_transporte(self, **kwargs):
        data = request.params
        dni = data.get("dni")
        # El valor booleano que envía el frontend
        nuevo_estado = data.get("permiso_transporte")

        # Validación básica de parámetros
        if dni is None or nuevo_estado is None:
            return {"status": "error", "message": "Faltan parámetros: dni o permiso_transporte"}

        try:
            # 1. Buscamos al alumno por DNI
            alumno = request.env['nfc.alumno'].sudo().search([('dni', '=', dni)], limit=1)

            if not alumno:
                return {"status": "error", "message": f"No se encontró el alumno con DNI: {dni}"}

            # 2. Actualizamos el campo en la base de datos usando el ORM
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
    
    @http.route('/nfc/create_alumno', type='json', auth='public', methods=['POST'], csrf=False)
    def create_alumno(self, **kwargs):
        data = request.params
        dni = data.get('dni')
        # ... resto de campos ...

        # 1. Validación manual PREVIA a la interacción con el ORM
        if dni and not re.match(r'^\d{8}[A-Z]$', dni):
            return {"status": "error", "message": "Formato de DNI inválido (Ej: 12345678Z)"}

        try:
            AlumnoModel = request.env['nfc.alumno'].sudo()

            # 2. Comprobar duplicados
            if AlumnoModel.search([('dni', '=', dni)], limit=1):
                return {"status": "error", "message": "El DNI ya existe"}

            # 3. Solo si todo está bien, creamos
            AlumnoModel.create({
                'nombre': data.get('nombre'),
                'apellido': data.get('apellido'),
                'dni': dni,
                'fecha_nacimiento': data.get('fecha_nacimiento'),
                'grupo_clase': data.get('grupo_clase'),
                'uid': False,
                'permiso_transporte': False,
            })

            return {"status": "ok", "message": "Creado correctamente"}

        except Exception as e:
            # Si algo falla aquí, Odoo hará rollback automáticamente
            _logger.error(f"Error: {str(e)}")
            return {"status": "error", "message": f"Error interno: {str(e)}"}