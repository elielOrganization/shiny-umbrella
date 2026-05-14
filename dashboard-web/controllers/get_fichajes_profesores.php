<?php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth_api.php';

$result = odoo_call('/nfc/get_fichajes_profesores');
odoo_require_auth($result);

ob_end_clean();
echo odoo_json_body($result);
