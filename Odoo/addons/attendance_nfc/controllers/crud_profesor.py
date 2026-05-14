import csv
import io
from odoo import http, fields
from odoo.http import request
from datetime import date 
import logging, re

_logger = logging.getLogger(__name__)

class NfcCrudProfesorController(http.Controller):
    
    @http.route('/nfc/import_profesores', type='json', auth='user', methods=['POST'], csrf=False)
    def import_profesores_csv(self, **kwargs):
        # El CSV debe venir como una cadena de texto en la clave 'csv_data'
        csv_content = request.params.get('csv_data')
        
        if not csv_content:
            return {"status": "error", "message": "No se recibió el contenido del CSV"}

        try:
            f = io.StringIO(csv_content)
            # El lector asume que el CSV tiene las cabeceras: nombre, apellido, dni, departamento
            reader = csv.DictReader(f)
            
            ProfesorModel = request.env['nfc.profesor'].sudo()
            count = 0

            for row in reader:
                dni = row.get('dni')

                if not dni:
                    continue

                if not re.match(r'^\d{8}[A-Z]$', dni):
                    continue

                vals = {
                    'nombre': row.get('nombre'),
                    'apellido': row.get('apellido'),
                    'dni': dni,
                    'departamento': row.get('departamento'),
                    'uid': '', 
                    'estado': True
                }

                # Usamos el ORM para buscar por DNI [cite: 2025-12-29]
                profesor_instancia = ProfesorModel.search([('dni', '=', dni)], limit=1)

                if profesor_instancia:
                    # Si existe, actualizamos los datos [cite: 2025-12-29]
                    profesor_instancia.write(vals)
                else:
                    # Si no existe, creamos el nuevo registro [cite: 2025-12-29]
                    ProfesorModel.create(vals)
                
                count += 1

            return {"status": "ok", "message": f"Se han procesado {count} profesores correctamente."}

        except Exception as e:
            _logger.error(f"Error en la importación de profesores: {str(e)}")
            return {"status": "error", "message": f"Error procesando CSV: {str(e)}"} 

    @http.route('/nfc/get_profesores', type='json', auth='user', methods=['POST'], csrf=False)
    def get_all_profesores(self, **kwargs):
        try:
            # Buscamos todos los profesores y seleccionamos los campos que necesita el frontend
            # search_read devuelve una lista de diccionarios directamente [cite: 2025-12-29]
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
            # 1. Buscamos al profesor por DNI usando sudo para permisos
            profesor = request.env['nfc.profesor'].sudo().search([('dni', '=', dni)], limit=1)

            if not profesor:
                return {"status": "error", "message": f"No se encontró el profesor con DNI: {dni}"}

            # 2. Actualizamos el campo 'estado' definido en tu modelo NfcProfesor
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
        data = request.params
        
        # Extraemos los campos del JSON
        nombre = data.get('nombre')
        apellido = data.get('apellido')
        dni = data.get('dni')
        departamento = data.get('departamento')

        # Validación de campos obligatorios
        if not all([nombre, apellido, dni, departamento]):
            return {
                "status": "error", 
                "message": "Faltan campos obligatorios (nombre, apellido, dni o departamento)"
            }
        
        if dni and not re.match(r'^\d{8}[A-Z]$', dni):
            return {"status": "error", "message": "Formato de DNI inválido (Ej: 12345678Z)"}

        try:
            ProfesorModel = request.env['nfc.profesor'].sudo()

            # Verificamos si el DNI ya existe
            if ProfesorModel.search([('dni', '=', dni)], limit=1):
                return {"status": "error", "message": f"Ya existe un profesor con el DNI {dni}"}

            # Creación del registro
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