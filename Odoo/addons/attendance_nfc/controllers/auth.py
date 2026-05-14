# -*- coding: utf-8 -*-
import logging
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class NfcAuthController(http.Controller):

    @http.route('/nfc/login', type='json', auth='none', methods=['POST'], csrf=False)
    def nfc_login(self, **kwargs):
        params = request.params
        login = params.get('login')
        password = params.get('password')

        if not login or not password:
            return {"status": "error", "message": "Faltan parámetros: login o password"}

        db = request.db or request.httprequest.args.get('db')
        if not db:
            from odoo.service.db import list_dbs
            dbs = list_dbs(force=True)
            db = dbs[0] if dbs else None

        try:
            request.session.db = db
            auth_info = request.session.authenticate(db, {'type': 'password', 'login': login, 'password': password})
            uid = auth_info.get('uid') if isinstance(auth_info, dict) else auth_info
            if uid:
                name = request.env['res.users'].sudo().browse(uid).name
                return {"status": "ok", "uid": uid, "name": name}
            return {"status": "error", "message": "Credenciales incorrectas"}
        except Exception as e:
            _logger.error(f"Error en login NFC: {str(e)}")
            return {"status": "error", "message": "Error en la autenticación"}

    @http.route('/nfc/logout', type='json', auth='user', methods=['POST'], csrf=False)
    def nfc_logout(self, **kwargs):
        request.session.logout(keep_db=True)
        return {"status": "ok"}

    @http.route('/nfc/session/info', type='json', auth='none', methods=['POST', 'GET'], csrf=False)
    def nfc_session_info(self, **kwargs):
        uid = request.session.uid
        if uid:
            user = request.env['res.users'].sudo().browse(uid)
            return {"status": "ok", "uid": uid, "name": user.name}
        return {"status": "error", "message": "No hay sesión activa"}
