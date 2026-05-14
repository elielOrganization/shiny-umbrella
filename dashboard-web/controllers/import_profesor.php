<?php
require_once __DIR__ . '/../includes/auth_api.php';
header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['csv_content'])) throw new Exception('No se recibió el campo csv_content');

    $result = odoo_call('/nfc/import_profesores', ['csv_data' => $input['csv_content']]);
    odoo_require_auth($result);

    if ($result['body'] === null) throw new Exception('Error al conectar con Odoo.');
    echo $result['body'];

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['jsonrpc' => '2.0', 'error' => ['message' => $e->getMessage(), 'code' => 500]]);
}
