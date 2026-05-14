import csv
import io
from odoo import http, fields
from odoo.http import request
from datetime import date 
import logging, re

_logger = logging.getLogger(__name__)

class NfcLectorController(http.Controller):

    @http.route('/nfc/get_cards', type='json', auth='public', methods=['POST'], csrf=False)
    def get_all_cards(self, **kwargs):
        try:
            # Buscamos todas las tarjetas registradas en el sistema
            # search_read es ideal aquí porque ya nos da el JSON listo para el frontend [cite: 2025-12-29]
            cards_data = request.env['nfc.card'].sudo().search_read(
                [], # Filtro vacío para obtener todas
                ['uid', 'activo'] # Los campos definidos en tu modelo nfc_card.py
            )

            _logger.info(f"### [GET_ALL_CARDS] Enviando {len(cards_data)} registros de tarjetas al frontend")

            return {
                "status": "ok",
                "cards": cards_data
            }

        except Exception as e:
            _logger.error(f"Error al obtener las tarjetas NFC: {str(e)}")
            return {
                "status": "error", 
                "message": "No se pudo recuperar la lista de tarjetas NFC"
            }

    @http.route('/nfc/registrar_tarjeta', type='json', auth='public', methods=['POST'], csrf=False)
    def nfc_registrar_tarjeta(self, **kwargs):
        data = request.params
        uid = data.get("uid")

        if not uid:
            return {"status": "error", "message": "UID no proporcionado"}

        try:
            # 1. Verificar la existencia de la tarjeta
            NfcCard = request.env['nfc.card'].sudo()
            tarjeta = NfcCard.search([('uid', '=', uid)], limit=1)

            if tarjeta:
                return {"status": "error", "message": "La tarjeta ya existe en el sistema"}

            # 2. CREACIÓN: El ORM se encarga de que esto aparezca en la BD y en ir.model
            nueva_tarjeta = NfcCard.create({
                'uid': uid,
                'activo': False
            })
            _logger.info(f"Instancia creada en ir.model: {nueva_tarjeta}")
            
            return {
                "status": "ok",
                "message": f"Tarjeta con UID {uid} registrada correctamente."
            }

        except Exception as e:
            _logger.error(f"Error en el ORM: {str(e)}")
            return {"status": "error", "message": "Error interno del servidor"}

    @http.route('/nfc/check_recreo', type='json', auth='public', methods=['POST'], csrf=False)
    def nfc_check_recreo(self, **kwargs):
        data = request.params
        uid = data.get("uid")

        if not uid:
            return {"status": "error", "message": "UID no proporcionado"}

        try:
            # 1. Buscamos al alumno que tenga asignado ese UID
            # El ORM buscará en la tabla nfc_alumno
            alumno = request.env['nfc.alumno'].sudo().search([('uid', '=', uid)], limit=1)

            # 2. Si no encontramos al alumno, no hay permiso que valga
            if not alumno:
                return {
                    "permiso_recreo": False,
                }

            # 3. Devolvemos el valor del campo permiso_recreo de la instancia encontrada
            # Como definiste el campo como Boolean, devolverá True o False
            return {
                "nombre": alumno.nombre,
                "apellido": alumno.apellido,
                "permiso_recreo": alumno.permiso_recreo
            }

        except Exception as e:
            _logger.error(f"Error en check_recreo: {str(e)}")
            return {"status": "error", "message": "Error al consultar el permiso"}
        
    @http.route('/nfc/check_transporte', type='json', auth='public', methods=['POST'], csrf=False)
    def nfc_check_transporte(self, **kwargs):
        data = request.params
        uid = data.get("uid")

        if not uid:
            return {"status": "error", "message": "UID no proporcionado"}

        try:
            # 1. Buscamos al alumno que tenga asignado ese UID
            # El ORM buscará en la tabla nfc_alumno
            alumno = request.env['nfc.alumno'].sudo().search([('uid', '=', uid)], limit=1)

            # 2. Si no encontramos al alumno, no hay permiso que valga
            if not alumno:
                return {
                    "permiso_transporte": False,
                }

            # 3. Devolvemos el valor del campo permiso_transporte de la instancia encontrada
            # Como definiste el campo como Boolean, devolverá True o False
            return {
                "nombre": alumno.nombre,
                "apellido": alumno.apellido,
                "permiso_transporte": alumno.permiso_transporte
            }

        except Exception as e:
            _logger.error(f"Error en check_transporte: {str(e)}")
            return {"status": "error", "message": "Error al consultar el permiso"}

    @http.route('/nfc/registrar_fichaje_profesor', type='json', auth='public', methods=['POST'], csrf=False)
    def registrar_fichaje_profesor(self, **kwargs):
        uid = request.params.get('uid')
        if not uid:
            return {"status": "error", "message": "UID no recibido"}

        # 1. Identificar exclusivamente al profesor
        profesor = request.env['nfc.profesor'].sudo().search([('uid', '=', uid)], limit=1)
        
        if not profesor:
            return {"status": "error", "message": "Tarjeta no vinculada a ningún profesor"}

        # 2. Buscar el último movimiento de este profesor específico
        ultimo_registro = request.env['nfc.fichaje.profesor'].sudo().search([
            ('profesor_id', '=', profesor.id)
        ], limit=1, order='fecha_hora desc')

        # 3. Lógica de Reset Diario y Alternancia
        # Si no hay registros previos o el último es de ayer, siempre es 'entrada' [cite: 2026-02-19]
        fecha_hoy = date.today()
        if not ultimo_registro or ultimo_registro.fecha_hora.date() < fecha_hoy:
            nuevo_tipo = 'entrada'
        else:
            # Si ya fichó hoy, alternamos el estado [cite: 2026-02-19]
            nuevo_tipo = 'salida' if ultimo_registro.tipo_movimiento == 'entrada' else 'entrada'

        # 4. Crear el registro en la tabla de fichajes profesores
        request.env['nfc.fichaje.profesor'].sudo().create({
            'profesor_id': profesor.id,
            'tipo_movimiento': nuevo_tipo,
            'uid_usado': uid,
            'fecha_hora': fields.Datetime.now(),
        })

        _logger.info(f"FICHAJE PROFESOR: {profesor.nombre} - {nuevo_tipo}")

        return {
            "status": "ok",
            "persona": f"{profesor.nombre} {profesor.apellido}",
            "movimiento": nuevo_tipo
        }
    
    @http.route('/nfc/registrar_fichaje_alumno', type='json', auth='public', methods=['POST'], csrf=False)
    def registrar_fichaje_alumno(self, **kwargs):
        _logger.info("=== PROCESANDO PETICIÓN DE ACCESO ===")
        
        uid = request.params.get('uid')
        tipo_movimiento = request.params.get('tipo') # 'entrada' o 'salida'

        if not uid or not tipo_movimiento:
            return {"status": "error", "message": "Faltan parámetros"}

        # 1. Buscar al alumno por su tarjeta
        alumno = request.env['nfc.alumno'].sudo().search([('uid', '=', uid)], limit=1)
        
        if not alumno:
            _logger.error(f"DENEGADO: UID {uid} no existe")
            return {"status": "error", "message": "Tarjeta no vinculada"}

        # 2. LÓGICA DE VALIDACIÓN SEGÚN EL TIPO
        if tipo_movimiento == 'salida':
            _logger.info(f"VERIFICANDO SALIDA PARA: {alumno.nombre}")
            # Solo restringimos la salida
            if not alumno.permiso_salida:
                _logger.warning(f"SALIDA DENEGADA: {alumno.nombre} no tiene permiso")
                return {
                    "status": "denegado", 
                    "message": "No tienes permiso para salir del centro"
                }
            _logger.info(f"SALIDA AUTORIZADA: {alumno.nombre}")

        elif tipo_movimiento == 'entrada':
            # La entrada se permite siempre que el alumno exista
            _logger.info(f"ENTRADA PERMITIDA AUTOMÁTICAMENTE PARA: {alumno.nombre}")

        # 3. Registro del movimiento en la base de datos
        try:
            request.env['nfc.fichaje.alumno'].sudo().create({
                'alumno_id': alumno.id,
                'tipo_movimiento': tipo_movimiento,
                'uid_usado': uid,
                'fecha_hora': fields.Datetime.now(),
            })
            
            _logger.info(f"REGISTRO COMPLETADO: {alumno.nombre} ha registrado su {tipo_movimiento}")

            return {
                "status": "ok",
                "persona": f"{alumno.nombre} {alumno.apellido}",
                "movimiento": tipo_movimiento
            }

        except Exception as e:
            _logger.error(f"ERROR EN DB: {str(e)}")
            return {"status": "error", "message": "Error al guardar en base de datos"}
    
    @http.route('/nfc/delete_card', type='json', auth='public', methods=['POST'], csrf=False)
    def delete_card(self, **kwargs):
        uid = request.params.get('uid')
        
        if not uid:
            return {"status": "error", "message": "UID no proporcionado"}

        try:
            # 1. Buscar la tarjeta en el sistema
            tarjeta = request.env['nfc.card'].sudo().search([('uid', '=', uid)], limit=1)
            
            if not tarjeta:
                return {"status": "error", "message": "La tarjeta no existe en la base de datos"}

            # 2. Si la tarjeta está activa, desvincular al sujeto asociado [cite: 2026-02-19]
            if tarjeta.activo:
                # Buscamos en ambas tablas quién tiene este UID asignado
                sujeto = request.env['nfc.profesor'].sudo().search([('uid', '=', uid)], limit=1) or \
                         request.env['nfc.alumno'].sudo().search([('uid', '=', uid)], limit=1)
                
                if sujeto:
                    # Limpiamos el campo UID del alumno o profesor [cite: 2025-12-29]
                    sujeto.write({'uid': False})
                    _logger.info(f"DESVINCULACIÓN: UID {uid} retirado de {sujeto.name}")

            # 3. Eliminar la tarjeta físicamente [cite: 2025-12-29]
            tarjeta.unlink()

            _logger.info(f"TARJETA ELIMINADA: UID {uid} borrado del sistema")

            return {
                "status": "ok",
                "message": f"Tarjeta {uid} eliminada y desvinculada correctamente"
            }

        except Exception as e:
            _logger.error(f"Error al eliminar tarjeta {uid}: {str(e)}")
            return {"status": "error", "message": "No se pudo eliminar la tarjeta"}
    
    @http.route('/nfc/unassign_card', type='json', auth='public', methods=['POST'], csrf=False)
    def unassign_card(self, **kwargs):
        uid = request.params.get('uid')
        
        if not uid:
            return {"status": "error", "message": "UID no recibido"}

        try:
            # 1. Buscar la tarjeta en el modelo nfc.card
            tarjeta = request.env['nfc.card'].sudo().search([('uid', '=', uid)], limit=1)
            
            if not tarjeta:
                return {"status": "error", "message": "La tarjeta no existe"}

            # 2. Desvincular de la persona (Alumno o Profesor) [cite: 2026-02-19]
            # Buscamos quién tiene este UID asignado actualmente
            sujeto = request.env['nfc.profesor'].sudo().search([('uid', '=', uid)], limit=1) or \
                     request.env['nfc.alumno'].sudo().search([('uid', '=', uid)], limit=1)
            
            if sujeto:
                # Quitamos el UID de su ficha para que otro pueda usarlo [cite: 2025-12-29]
                sujeto.write({'uid': False})
                _logger.info(f"DESVINCULACIÓN: El UID {uid} ha sido retirado de {sujeto.nombre}")

            # 3. Marcar la tarjeta como inactiva (disponible) en nfc.card [cite: 2026-01-03]
            tarjeta.write({'activo': False})

            return {
                "status": "ok",
                "message": f"Tarjeta {uid} desvinculada y marcada como disponible"
            }

        except Exception as e:
            _logger.error(f"Error al desvincular tarjeta: {str(e)}")
            return {"status": "error", "message": "No se pudo procesar la desvinculación"}

    @http.route('/nfc/get_fichajes_profesores', type='json', auth='public', methods=['POST'], csrf=False)
    def get_fichajes_profesores(self, **kwargs):
        try:
            fichajes = request.env['nfc.fichaje.profesor'].sudo().search_read(
                [],
                ['display_name_sujeto', 'fecha_hora', 'tipo_movimiento', 'uid_usado']
            )

            _logger.info(f"### [GET_FICHAJES_PROFESORES] Enviando {len(fichajes)} registros al frontend")

            return {
                "status": "ok",
                "fichajes": fichajes
            }

        except Exception as e:
            _logger.error(f"Error al obtener fichajes de profesores: {str(e)}")
            return {"status": "error", "message": "No se pudo recuperar el registro de fichajes"}

    @http.route('/nfc/get_fichajes_alumnos', type='json', auth='public', methods=['POST'], csrf=False)
    def get_fichajes_alumnos(self, **kwargs):
        try:
            fichajes = request.env['nfc.fichaje.alumno'].sudo().search_read(
                [],
                ['display_name_sujeto', 'fecha_hora', 'tipo_movimiento', 'uid_usado',
                 'tiene_permiso_salida', 'alumno_id']
            )

            for f in fichajes:
                alumno_id = f.get('alumno_id')
                if alumno_id:
                    alumno = request.env['nfc.alumno'].sudo().browse(alumno_id[0])
                    f['permiso_transporte'] = alumno.permiso_transporte
                    f['permiso_recreo'] = alumno.permiso_recreo
                else:
                    f['permiso_transporte'] = False
                    f['permiso_recreo'] = False

            _logger.info(f"### [GET_FICHAJES_ALUMNOS] Enviando {len(fichajes)} registros al frontend")

            return {
                "status": "ok",
                "fichajes": fichajes
            }

        except Exception as e:
            _logger.error(f"Error al obtener fichajes de alumnos: {str(e)}")
            return {"status": "error", "message": "No se pudo recuperar el registro de fichajes"}