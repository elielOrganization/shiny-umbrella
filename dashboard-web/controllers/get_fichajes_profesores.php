<?php
require_once __DIR__ . '/../includes/auth_api.php';
header('Content-Type: application/json');

$result = odoo_call('/nfc/get_fichajes_profesores');
odoo_require_auth($result);

echo $result['body'] ?? json_encode(['error' => 'No se pudo conectar con Odoo']);
