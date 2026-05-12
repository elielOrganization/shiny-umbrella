# Partimos de la imagen oficial de Odoo 18
FROM odoo:18.0

# Cambiamos a root para poder copiar archivos y ajustar permisos
USER root

# Creamos la carpeta de addons extras dentro del contenedor si no existe
RUN mkdir -p /mnt/extra-addons

# Copiamos tu módulo NFC al directorio de addons de Odoo
# OJO: Asegúrate de que tu carpeta se llama 'nfc_gestion' o cámbialo aquí
COPY ./addons/nfc_gestion /mnt/extra-addons/nfc_gestion

# Copiamos el archivo de configuración personalizado
COPY ./config/odoo.conf /etc/odoo/odoo.conf

# Ajustamos permisos para que el usuario 'odoo' pueda ejecutar todo
RUN chown -R odoo:odoo /mnt/extra-addons /etc/odoo/odoo.conf

# Volvemos al usuario odoo por seguridad
USER odoo