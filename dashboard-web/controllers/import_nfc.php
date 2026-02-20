<?php
// controllers/save_vinculacion.php
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['uid'])) {
    echo json_encode(['error' => 'No se recibió el UID']);
    exit;
}

// URL de tu endpoint en Odoo para registrar/vincular
$odoo_url = "http://10.102.7.196:8069/nfc/registrar_tarjeta"; 

$payload = json_encode([
    "jsonrpc" => "2.0",
    "method" => "call",
    "params" => [
        "uid" => $data['uid'],
        "activo" => true
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

echo $response;