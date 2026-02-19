<?php
/**
 * Controlador para la eliminación de profesores usando el DNI como identificador.
 */

header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Recogemos el DNI enviado desde el JS
$dni = $data['dni'] ?? null;

if (!$dni) {
    echo json_encode(["status" => "error", "message" => "DNI no proporcionado"]);
    exit;
}

$odoo_url = "http://10.102.7.244:8069/nfc/delete_persona"; 

/**
 * Enviamos el DNI a Odoo. 
 * Asegúrate de que tu función en Odoo reciba 'dni' en los argumentos.
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