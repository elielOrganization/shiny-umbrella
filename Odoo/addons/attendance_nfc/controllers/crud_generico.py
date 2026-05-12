import csv
import io
from odoo import http, fields
from odoo.http import request
from datetime import date 
import logging, re

_logger = logging.getLogger(__name__)

class NfcCrudGenericoController(http.Controller):

    @http.route('/nfc/assign_card', type='json', auth='public', methods=['POST'], csrf=False)
    def nfc_assign_card(self, **kwargs):
        data = request.params
        uid = data.get("uid")
        dni = data.get("dni")

        _logger.info(f"VERIFICANDO DATOS -> DNI RECIBIDO: '{dni}' | UID RECIBIDO: '{uid}'")

        if not uid or not dni:
            return {"status": "error", "message": "Faltan datos (uid o dni)"}

        try:
            # 1. Verificar la existencia de la tarjeta
            NfcCard = request.env['nfc.card'].sudo()
            tarjeta = NfcCard.search([('uid', '=', uid)], limit=1)

            if not tarjeta:
                return {"status": "error", "message": "La tarjeta no existe en el sistema"}

            if tarjeta.activo:
                return {
                    "status": "error", 
                    "message": "La tarjeta ya está activa."
                }

            # 2. Identificar al sujeto (Prioridad Profesores por eficiencia)
            # Buscamos en nfc.profesor
            sujeto = request.env['nfc.profesor'].sudo().search([('dni', '=', dni)], limit=1)
            tipo = "profesor"

            if not sujeto:
                # Si no es profesor, buscamos en nfc.alumno
                sujeto = request.env['nfc.alumno'].sudo().search([('dni', '=', dni)], limit=1)
                tipo = "alumno"

            if not sujeto:
                return {"status": "error", "message": "No se ha encontrado ese DNI"}

            # 3. Operaciones de vinculación mediante el ORM
            # Activamos la tarjeta física
            tarjeta.write({'activo': True})
            
            # Vinculamos el UID al registro del sujeto (alumno o profesor)
            sujeto.write({'uid': uid})

            _logger.info(f"ÉXITO: Tarjeta {uid} vinculada a {sujeto.nombre} ({tipo}) con DNI: {dni}")

            return {
                "status": "ok",
                "message": f"Tarjeta vinculada correctamente."
            }

        except Exception as e:
            _logger.error(f"Error en assign_card: {str(e)}")
            return {"status": "error", "message": f"Error interno: {str(e)}"}
        
    @http.route('/nfc/update_persona', type='json', auth='public', methods=['POST'], csrf=False)
    def update_persona(self, **kwargs):
        data = request.params
        dni = data.get("dni")
        vals = data.get("valores") # Ejemplo: {'nombre': 'Victor', 'grupo_clase': '2DAM'}

        sujeto = request.env['nfc.profesor'].sudo().search([('dni', '=', dni)], limit=1) or \
                 request.env['nfc.alumno'].sudo().search([('dni', '=', dni)], limit=1)
        
        if not sujeto:
            return {"status": "error", "message": "No encontrado"}

        # FILTRADO DINÁMICO:
        # Solo nos quedamos con las claves de 'vals' que existen en los campos del modelo
        campos_reales = sujeto._fields.keys()
        vals_limpios = {k: v for k, v in vals.items() if k in campos_reales}

        try:
            sujeto.write(vals_limpios)
            return {"status": "ok", "message": f"Actualizado {sujeto.nombre}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    @http.route('/nfc/delete_persona', type='json', auth='public', methods=['POST'], csrf=False)
    def delete_persona(self, **kwargs):
        data = request.params
        dni = data.get("dni")

        if not dni:
            return {"status": "error", "message": "DNI no proporcionado"}

        try:
            # 1. Buscar en Profesores
            sujeto = request.env['nfc.profesor'].sudo().search([('dni', '=', dni)], limit=1)
            
            if not sujeto:
                # 2. Buscar en Alumnos
                sujeto = request.env['nfc.alumno'].sudo().search([('dni', '=', dni)], limit=1)

            if not sujeto:
                return {"status": "error", "message": "No se encontró el registro para eliminar"}

            # 3. Eliminar registro [cite: 2025-12-29]
            nombre_borrado = sujeto.nombre
            sujeto.unlink() 

            _logger.info(f"REGISTRO ELIMINADO: {nombre_borrado} (DNI: {dni})")
            return {"status": "ok", "message": f"El registro de {nombre_borrado} ha sido eliminado"}

        except Exception as e:
            _logger.error(f"Error en delete_persona: {str(e)}")
            return {"status": "error", "message": "No se pudo eliminar el registro"}