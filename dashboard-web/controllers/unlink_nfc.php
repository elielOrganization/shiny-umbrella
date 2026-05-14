<?php
require_once __DIR__ . '/../includes/auth_api.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['uid'])) {
    echo json_encode(['error' => ['message' => 'UID no proporcionado']]);
    exit;
}

$result = odoo_call('/nfc/unassign_card', ['uid' => $data['uid']]);
odoo_require_auth($result);

echo $result['body'] ?? json_encode(['error' => 'No se pudo conectar con Odoo']);
