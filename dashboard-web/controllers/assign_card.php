<?php
require_once __DIR__ . '/../includes/auth_api.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$result = odoo_call('/nfc/assign_card', [
    'uid' => $data['uid'] ?? '',
    'dni' => $data['dni'] ?? '',
]);
odoo_require_auth($result);

$odoo = $result['data'];
if (isset($odoo['error'])) {
    echo json_encode([
        'status'  => 'error',
        'message' => $odoo['error']['data']['message'] ?? 'Error interno en Odoo',
    ]);
} else {
    echo json_encode($odoo['result'] ?? $odoo);
}
