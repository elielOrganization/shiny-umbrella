<?php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth_api.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) throw new Exception('No se recibieron datos.');

    $result = odoo_call('/nfc/create_alumno', [
        'nombre'           => $input['nombre']           ?? '',
        'apellido'         => $input['apellidos']        ?? '',
        'dni'              => $input['dni']              ?? '',
        'fecha_nacimiento' => $input['fecha_nacimiento'] ?? '',
        'grupo_clase'      => $input['grupo_clase']      ?? '',
    ]);
    odoo_require_auth($result);

    ob_end_clean();
    echo odoo_json_body($result);

} catch (Exception $e) {
    ob_end_clean();
    echo json_encode(['jsonrpc' => '2.0', 'error' => ['data' => ['message' => $e->getMessage()]]]);
}
