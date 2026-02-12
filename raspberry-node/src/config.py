    # raspberry-node/src/config.py

ODOO_URL = "http://odoo:8069"          # nombre del servicio en Docker o IP/host real
NFC_ENDPOINT = "/nfc/check"            # ruta que expondrá Odoo
API_TOKEN = "super-secret-token"       # si usáis auth por header (opcional)

DEVICE_ID = "SIMULATED_NODE_1"         # identifica la “raspberry”
REQUEST_TIMEOUT = 5                    # segundos

# contraseña = frjn-yzhm-px9f