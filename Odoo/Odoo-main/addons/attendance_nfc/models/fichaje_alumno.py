from odoo import models, fields, api
from odoo.exceptions import ValidationError
import re

class NfcFichajeAlumno(models.Model):
    _name = "nfc.fichaje.alumno"
    _description = "Registro Detallado de Asistencia Alumnos"
    _order = "fecha_hora desc"

    # Relación con el alumno [cite: 2026-01-03]
    alumno_id = fields.Many2one('nfc.alumno', string="Alumno", required=True, index=True, ondelete='cascade')
    
    # Datos del movimiento [cite: 2026-02-19]
    fecha_hora = fields.Datetime(string="Fecha y Hora", default=fields.Datetime.now, readonly=True)
    
    tipo_movimiento = fields.Selection([
        ('entrada', 'Entrada'),
        ('salida', 'Salida')
    ], string="Tipo", required=True)

    # Campos de control de permisos (Traídos del alumno mediante related) [cite: 2026-01-09]
    tiene_permiso_salida = fields.Boolean(related='alumno_id.permiso_salida', string="¿Tenía permiso de salida?", store=True)

    # Auditoría técnica [cite: 2025-12-29]
    uid_usado = fields.Char(string="UID Tarjeta", readonly=True)

    # Campo computado para la vista de Odoo [cite: 2025-12-29]
    display_name_sujeto = fields.Char(string="Persona", compute="_compute_display_name_sujeto", store=True)

    @api.depends('alumno_id')
    def _compute_display_name_sujeto(self):
        for r in self:
            if r.alumno_id:
                # Concatenamos nombre y apellido del alumno [cite: 2025-12-29]
                r.display_name_sujeto = f"{r.alumno_id.nombre} {r.alumno_id.apellido} (Alumno)"
            else:
                r.display_name_sujeto = "Desconocido"

    @api.constrains('tipo_movimiento', 'alumno_id')
    def _check_permisos_salida(self):
        """
        Valida que si un alumno intenta registrar una salida, 
        realmente tenga el permiso activo en su ficha [cite: 2026-01-09].
        """
        for r in self:
            if r.tipo_movimiento == 'salida' and not r.alumno_id.permiso_salida:
                # Si no tiene permiso de salida, lanzamos error para bloquear el registro [cite: 2026-02-19]
                raise ValidationError(f"El alumno {r.alumno_id.nombre} no tiene autorización para salir del centro.")