<?php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth_api.php';

$data = json_decode(file_get_contents('php://input'), true);

$result = odoo_call('/nfc/assign_card', [
    'uid'  => $data['uid']  ?? '',
    'dni'  => $data['dni']  ?? '',
    'tipo' => $data['tipo'] ?? 'alumno',   // 'alumno' | 'profesor'
]);
odoo_require_auth($result);

$odoo = $result['data'];
if (isset($odoo['error'])) {
    ob_end_clean();
    echo json_encode([
        'status'  => 'error',
        'message' => $odoo['error']['data']['message'] ?? 'Error interno en Odoo',
    ]);
} else {
    ob_end_clean();
    echo json_encode($odoo['result'] ?? $odoo);
}
