from odoo import models, fields, api
from odoo.exceptions import ValidationError
import re

class NfcProfesor(models.Model):
    _name = "nfc.profesor"
    _description = "Tarjeta NFC"

    nombre = fields.Char(string="Nombre del Profesor", required=True)
    apellido = fields.Char(string="Apellido del Profesor", required=True)
    dni = fields.Char(string="DNI del Profesor", required=True, index=True, unique=True)
    uid = fields.Char(string="UID NFC", index=True, unique=True)
    departamento = fields.Char(string="Departamento", required=True)
    estado = fields.Boolean(string="Activo", default=True, store=True)

    @api.constrains('dni')
    def _check_dni(self):
        for r in self:
             if not re.match(r'^\d{8}[A-Z]$', r.dni):
                raise ValidationError("DNI inválido (Ej: 12345678Z).")
             
            