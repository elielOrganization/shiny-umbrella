<?php
require_once __DIR__ . '/../includes/auth_api.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['id'])) {
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

if ($result['body'] === null) {
    echo json_encode(['error' => 'No se pudo conectar con el servidor Odoo.']);
    exit;
}

// Validar que la respuesta sea JSON (Odoo a veces devuelve HTML en errores 404/500)
json_decode($result['body']);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Odoo devolvió un formato no válido. Verifica que /nfc/update_persona existe.']);
    exit;
}

echo $result['body'];
