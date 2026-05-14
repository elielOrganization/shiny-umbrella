<?php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth_api.php';

$data = json_decode(file_get_contents('php://input'), true);
$dni  = $data['dni'] ?? null;

if (!$dni) {
    ob_end_clean();
    echo json_encode(['status' => 'error', 'message' => 'DNI no proporcionado']);
    exit;
}

$result = odoo_call('/nfc/delete_persona', ['dni' => $dni]);
odoo_require_auth($result);

ob_end_clean();
echo odoo_json_body($result);
