<?php
require_once __DIR__ . '/../includes/auth_api.php';
header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $dni   = $input['dni']   ?? null;
    $valor = $input['valor'] ?? false;

    if (!$dni) throw new Exception('DNI no recibido');

    $result = odoo_call('/nfc/update_transporte', ['dni' => $dni, 'permiso_transporte' => $valor]);
    odoo_require_auth($result);

    if ($result['body'] === null) throw new Exception('Error de conexión con Odoo');
    echo $result['body'];

} catch (Exception $e) {
    echo json_encode(['jsonrpc' => '2.0', 'error' => ['data' => ['message' => $e->getMessage()]]]);
}
