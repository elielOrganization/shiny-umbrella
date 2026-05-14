<?php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth_api.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['uid'])) {
    ob_end_clean();
    echo json_encode(['error' => 'No se recibió el UID']);
    exit;
}

$result = odoo_call('/nfc/registrar_tarjeta', ['uid' => $data['uid'], 'activo' => true]);
odoo_require_auth($result);

ob_end_clean();
echo odoo_json_body($result);
