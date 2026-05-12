<?php
require_once __DIR__ . '/../config/odoo.php';
header('Content-Type: application/json');

$json  = file_get_contents('php://input');
$data  = json_decode($json, true);
$uid   = $data['uid'] ?? '';

if (!$uid) {
    echo json_encode(['error' => 'UID no proporcionado']);
    exit;
}

$payload = json_encode([
    "jsonrpc" => "2.0",
    "method"  => "call",
    "params"  => ["uid" => $uid]
]);

$context = stream_context_create(['http' => [
    'header'        => "Content-Type: application/json\r\n",
    'method'        => 'POST',
    'content'       => $payload,
    'ignore_errors' => true,
    'timeout'       => 6
]]);

$response = @file_get_contents($ODOO_BASE . "/nfc/lookup_uid", false, $context);

if ($response === false) {
    echo json_encode(['error' => 'No se pudo conectar con Odoo']);
} else {
    echo $response;
}
