<?php
require_once __DIR__ . '/../config/odoo.php';
header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['uid'])) {
    echo json_encode(['error' => ['message' => 'UID no proporcionado']]);
    exit;
}

$odoo_url = $ODOO_BASE . "/nfc/delete_card";

$payload = json_encode([
    "jsonrpc" => "2.0",
    "method" => "call",
    "params" => [
        "uid" => $data['uid']
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
