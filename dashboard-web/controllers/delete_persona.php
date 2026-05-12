<?php
/**
 * Controlador para la eliminaciÃ³n de profesores usando el DNI como identificador.
 */
require_once __DIR__ . '/../config/odoo.php';
header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Recogemos el DNI enviado desde el JS
$dni = $data['dni'] ?? null;

if (!$dni) {
    echo json_encode(["status" => "error", "message" => "DNI no proporcionado"]);
    exit;
}

$odoo_url = $ODOO_BASE . "/nfc/delete_persona";

/**
 * Enviamos el DNI a Odoo. 
 * AsegÃºrate de que tu funciÃ³n en Odoo reciba 'dni' en los argumentos.
 */
$payload = json_encode([
    "jsonrpc" => "2.0",
    "method" => "call",
    "params" => [
        "dni" => $dni
    ]
]);

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => $payload,
        'ignore_errors' => true
    ]
];

$context  = stream_context_create($options);
$response = file_get_contents($odoo_url, false, $context);

echo $response;
