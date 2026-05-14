<?php
ob_start();
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth_api.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['id'])) {
    ob_end_clean();
    echo json_encode(['error' => 'Datos incompletos. Se requiere el ID del profesor.']);
    exit;
}

$result = odoo_call('/nfc/update_persona', [
    'dni'    => $input['dni'] ?? '',
    'valores' => [
        'nombre'       => $input['nombre']    ?? '',
        'apellido'     => $input['apellidos'] ?? '',
        'departamento' => $input['departamento'] ?? '',
    ],
]);
odoo_require_auth($result);

ob_end_clean();
echo odoo_json_body($result);
