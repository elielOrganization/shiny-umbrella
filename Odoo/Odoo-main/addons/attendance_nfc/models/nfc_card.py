from odoo import models, fields, api
from odoo.exceptions import ValidationError
import re

class NfcCard(models.Model):
    _name = "nfc.card"
    _description = "Tarjeta NFC"

    uid = fields.Char(string="UID NFC", required=True, index=True, unique=True)
    activo = fields.Boolean(default=False)


    @api.constrains('uid')
    def _check_uid(self):
        for r in self:
            if not re.match(r'^\d{10}$', r.uid):
                raise ValidationError("UID NFC inválido.")