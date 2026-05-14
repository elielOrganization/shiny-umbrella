<?php
require_once __DIR__ . '/../includes/auth_api.php';
header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) throw new Exception('No se recibieron datos.');

    $result = odoo_call('/nfc/create_profesor', [
        'nombre'           => $input['nombre']           ?? '',
        'apellido'         => $input['apellidos']        ?? '',
        'dni'              => $input['dni']              ?? '',
        'fecha_nacimiento' => $input['fecha_nacimiento'] ?? '',
        'departamento'     => $input['departamento']     ?? '',
    ]);
    odoo_require_auth($result);

    if ($result['body'] === null) throw new Exception('Error de conexión con Odoo.');
    echo $result['body'];

} catch (Exception $e) {
    echo json_encode(['jsonrpc' => '2.0', 'error' => ['data' => ['message' => $e->getMessage()]]]);
}
