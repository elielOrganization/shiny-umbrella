<?php
header('Content-Type: application/json');

// 1. CONFIGURACIÓN (Ajusta la URL a tu endpoint de Odoo)
$odoo_url = "http://10.102.7.196:8069/nfc/get_cards"; 

// 2. PREPARAR LA PETICIÓN JSON-RPC
$payload = json_encode([
    "jsonrpc" => "2.0",
    "method" => "call",
    "params" => new stdClass() 
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

if ($response === FALSE) {
    echo json_encode(['error' => 'No se pudo conectar con Odoo']);
} else {
    echo $response;
}