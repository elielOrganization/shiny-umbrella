<?php
// controllers/assign_card.php
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$odoo_url = "http://10.102.7.196:8069/nfc/assign_card"; 

$payload = json_encode([
    "jsonrpc" => "2.0",
    "method" => "call",
    "params" => [
        "uid" => $data['uid'],
        "dni" => $data['dni']
    ]
]);

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => $payload
    ]
];

$context  = stream_context_create($options);
$response = file_get_contents($odoo_url, false, $context);

$odoo_data = json_decode($response, true);

// IMPORTANTE: Extraemos el resultado real de Odoo
if (isset($odoo_data['error'])) {
    // Error de servidor/protocolo
    echo json_encode([
        "status" => "error", 
        "message" => $odoo_data['error']['data']['message'] ?? "Error interno en Odoo"
    ]);
} else {
    // Respuesta lógica de Odoo (nuestro status y message de Python)
    echo json_encode($odoo_data['result']);
}