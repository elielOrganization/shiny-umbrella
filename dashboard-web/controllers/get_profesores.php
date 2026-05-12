<?php
// controllers/get_profesores.php
require_once __DIR__ . '/../config/odoo.php';
header('Content-Type: application/json');

$odoo_url = $ODOO_BASE . "/nfc/get_profesores";

// 2. PREPARAR LA PETICIÃ"N JSON-RPC
$payload = json_encode([
    "jsonrpc" => "2.0",
    "method" => "call",
    "params" => new stdClass() // PeticiÃ³n vacÃ­a para traer todos
]);

// 3. EJECUTAR LA LLAMADA
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

if ($response === FALSE) {
    echo json_encode(['error' => 'No se pudo conectar con Odoo']);
} else {
    echo $response; // Devolvemos el JSON de Odoo
}
