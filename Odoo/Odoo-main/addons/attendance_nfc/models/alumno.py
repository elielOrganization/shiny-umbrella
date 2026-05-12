from odoo import models, fields, api
from odoo.exceptions import ValidationError
import re
import datetime

class NfcAlumno(models.Model):
    _name = "nfc.alumno"
    _description = "Tarjeta NFC"

    nombre = fields.Char(string="Nombre del Alumno", required=True)
    apellido = fields.Char(string="Apellido del Alumno", required=True)
    fecha_nacimiento = fields.Date(string="Fecha de Nacimiento", required=True)
    grupo_clase = fields.Char(string="Grupo de Clase", required=True)
    dni = fields.Char(string="DNI del Alumno", required=True, index=True, unique=True)
    uid = fields.Char(string="UID NFC", index=True, unique=True)

    permiso_salida = fields.Boolean(string="Permiso de Salida", compute="_compute_permisos", store=True)
    permiso_recreo = fields.Boolean(string="Permiso de Recreo", compute="_compute_permisos", store=True)
    permiso_transporte = fields.Boolean(default=False, string="Permiso de Transporte", store=True)
    
    @api.depends('fecha_nacimiento') 
    def _compute_permisos(self):
        for r in self:
            # Esta línea es tu "escudo" contra el error de servidor
            if r.fecha_nacimiento: 
                fecha_actual = datetime.date.today()
                # Aquí r.fecha_nacimiento ya es un objeto tipo date, no un bool
                edad = fecha_actual.year - r.fecha_nacimiento.year - (
                    (fecha_actual.month, fecha_actual.day) < (r.fecha_nacimiento.month, r.fecha_nacimiento.day)
                )
                r.permiso_salida = edad >= 18
                r.permiso_recreo = edad >= 18
            else:
                # Si no hay fecha, no hay permisos. Así de simple.
                r.permiso_salida = False
                r.permiso_recreo = False

    @api.constrains('dni')
    def _check_dni(self):
        for r in self:
             if not re.match(r'^\d{8}[A-Z]$', r.dni):
                raise ValidationError("DNI inválido (Ej: 12345678Z).")
             




    

