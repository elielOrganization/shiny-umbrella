from odoo import models, fields, api

class NfcFichajeProfesor(models.Model):
    _name = "nfc.fichaje.profesor"
    _description = "Registro de Asistencias NFC"
    _order = "fecha_hora desc"

    # Relaciones: Un registro puede ser de un alumno O de un profesor
    # Usamos index=True para que las búsquedas por DNI/UID sean rápidas 
    profesor_id = fields.Many2one('nfc.profesor', string="Profesor", index=True, ondelete='cascade')
    
    # Datos del movimiento
    fecha_hora = fields.Datetime(
        string="Fecha y Hora", 
        default=fields.Datetime.now, 
        required=True,
        readonly=True
    )
    
    tipo_movimiento = fields.Selection([
        ('entrada', 'Entrada'),
        ('salida', 'Salida')
    ], string="Operación", required=True, readonly=True)

    # Guardamos el UID por si la tarjeta se desvincula en el futuro, tener el rastro técnico
    uid_usado = fields.Char(string="UID Tarjeta Usada", readonly=True)

    # Campo para identificar visualmente quién ha fichado en las vistas de Odoo
    display_name_sujeto = fields.Char(string="Persona", compute="_compute_display_name_sujeto", store=True)

    @api.depends('profesor_id')
    def _compute_display_name_sujeto(self):
        for r in self:
            if r.profesor_id:
                r.display_name_sujeto = f"{r.profesor_id.nombre} {r.profesor_id.apellido} (Profesor)"
            else:
                r.display_name_sujeto = "Desconocido"