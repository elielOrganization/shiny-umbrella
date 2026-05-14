<?php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth_api.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $dni   = $input['dni']   ?? null;
    $valor = $input['valor'] ?? false;

    if (!$dni) throw new Exception('DNI no recibido');

    $result = odoo_call('/nfc/update_estado_profesor', ['dni' => $dni, 'estado' => $valor]);
    odoo_require_auth($result);

    ob_end_clean();
    echo odoo_json_body($result);

} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(['jsonrpc' => '2.0', 'error' => ['data' => ['message' => $e->getMessage()]]]);
}
