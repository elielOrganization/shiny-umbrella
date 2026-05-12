# Configuración de IPs y URLs del proyecto

## Archivos con la IP del servidor Odoo

| Archivo | Línea | Endpoint |
|---|---|---|
| `controllers/assign_card.php` | 8 | `/nfc/assign_card` |
| `controllers/delete_persona.php` | 19 | `/nfc/delete_persona` |
| `controllers/delete_nfc.php` | 13 | `/nfc/delete_card` |
| `controllers/import_alumno.php` | 16 | `/nfc/import_alumnos` |
| `controllers/import_alumno_manual.php` | 14 | `/nfc/create_alumno` |
| `controllers/import_profesor.php` | 16 | `/nfc/import_profesores` |
| `controllers/import_profesor_manual.php` | 14 | `/nfc/create_profesor` |
| `controllers/get_alumnos.php` | 6 | `/nfc/get_alumnos` |
| `controllers/get_profesores.php` | 7 | `/nfc/get_profesores` |
| `controllers/get_nfc.php` | 5 | `/nfc/get_cards` |
| `controllers/import_nfc.php` | 14 | `/nfc/registrar_tarjeta` |
| `controllers/unlink_nfc.php` | 12 | `/nfc/unassign_card` |
| `controllers/update_estado.php` | 20 | `/nfc/update_estado_profesor` |
| `controllers/update_profesor.php` | 17 | `/nfc/update_persona` |
| `controllers/update_transporte.php` | 19 | `/nfc/update_transporte` |

---

## URLs externas (CDN/Google — no requieren cambio)

| Archivo | URL |
|---|---|
| `index.php` | `https://fonts.googleapis.com` |
| `index.php` | `https://cdnjs.cloudflare.com` (Font Awesome) |
| `assets/css/base.css` | `https://fonts.googleapis.com` |
| `includes/header.php` | `https://cdnjs.cloudflare.com` (Font Awesome) |
