<?php
require_once __DIR__ . '/../includes/auth_api.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$dni  = $data['dni'] ?? null;

if (!$dni) {
    echo json_encode(['status' => 'error', 'message' => 'DNI no proporcionado']);
    exit;
}

$result = odoo_call('/nfc/delete_persona', ['dni' => $dni]);
odoo_require_auth($result);

echo $result['body'] ?? json_encode(['error' => 'No se pudo conectar con Odoo']);
