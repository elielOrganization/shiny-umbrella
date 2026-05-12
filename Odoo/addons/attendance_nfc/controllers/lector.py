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
            cards_data = request.env['nfc.card'].sudo().search_read(
                [],
                ['uid', 'activo']
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
            NfcCard = request.env['nfc.card'].sudo()
            tarjeta = NfcCard.search([('uid', '=', uid)], limit=1)

            if tarjeta:
                return {"status": "error", "message": "La tarjeta ya existe en el sistema"}

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
            alumno = request.env['nfc.alumno'].sudo().search([('uid', '=', uid)], limit=1)

            if not alumno:
                return {"permiso_recreo": False}

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
            alumno = request.env['nfc.alumno'].sudo().search([('uid', '=', uid)], limit=1)

            if not alumno:
                return {"permiso_transporte": False}

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

        profesor = request.env['nfc.profesor'].sudo().search([('uid', '=', uid)], limit=1)

        if not profesor:
            return {"status": "error", "message": "Tarjeta no vinculada a ningún profesor"}

        ultimo_registro = request.env['nfc.fichaje.profesor'].sudo().search([
            ('profesor_id', '=', profesor.id)
        ], limit=1, order='fecha_hora desc')

        fecha_hoy = date.today()
        if not ultimo_registro or ultimo_registro.fecha_hora.date() < fecha_hoy:
            nuevo_tipo = 'entrada'
        else:
            nuevo_tipo = 'salida' if ultimo_registro.tipo_movimiento == 'entrada' else 'entrada'

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
        tipo_movimiento = request.params.get('tipo')

        if not uid or not tipo_movimiento:
            return {"status": "error", "message": "Faltan parámetros"}

        alumno = request.env['nfc.alumno'].sudo().search([('uid', '=', uid)], limit=1)

        if not alumno:
            _logger.error(f"DENEGADO: UID {uid} no existe")
            return {"status": "error", "message": "Tarjeta no vinculada"}

        if tipo_movimiento == 'salida':
            _logger.info(f"VERIFICANDO SALIDA PARA: {alumno.nombre}")
            if not alumno.permiso_salida:
                _logger.warning(f"SALIDA DENEGADA: {alumno.nombre} no tiene permiso")
                return {
                    "status": "denegado",
                    "message": "No tienes permiso para salir del centro"
                }
            _logger.info(f"SALIDA AUTORIZADA: {alumno.nombre}")

        elif tipo_movimiento == 'entrada':
            _logger.info(f"ENTRADA PERMITIDA AUTOMÁTICAMENTE PARA: {alumno.nombre}")

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
            tarjeta = request.env['nfc.card'].sudo().search([('uid', '=', uid)], limit=1)

            if not tarjeta:
                return {"status": "error", "message": "La tarjeta no existe en la base de datos"}

            if tarjeta.activo:
                sujeto = request.env['nfc.profesor'].sudo().search([('uid', '=', uid)], limit=1) or \
                         request.env['nfc.alumno'].sudo().search([('uid', '=', uid)], limit=1)

                if sujeto:
                    sujeto.write({'uid': False})
                    _logger.info(f"DESVINCULACIÓN: UID {uid} retirado de {sujeto.name}")

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
            tarjeta = request.env['nfc.card'].sudo().search([('uid', '=', uid)], limit=1)

            if not tarjeta:
                return {"status": "error", "message": "La tarjeta no existe"}

            sujeto = request.env['nfc.profesor'].sudo().search([('uid', '=', uid)], limit=1) or \
                     request.env['nfc.alumno'].sudo().search([('uid', '=', uid)], limit=1)

            if sujeto:
                sujeto.write({'uid': False})
                _logger.info(f"DESVINCULACIÓN: El UID {uid} ha sido retirado de {sujeto.nombre}")

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
