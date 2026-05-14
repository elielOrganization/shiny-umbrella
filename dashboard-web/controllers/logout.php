<?php
require_once __DIR__ . '/../config/odoo.php'; // también arranca la sesión

// Notificar a Odoo para invalidar el token de sesión en su lado
if (!empty($_SESSION['odoo_session_id'])) {
    odoo_request('/nfc/logout', json_encode(new stdClass()));
}

session_unset();
session_destroy();
header('Location: ../index.php');
exit;
