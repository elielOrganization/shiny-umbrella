<?php
require_once __DIR__ . '/../config/odoo.php';
header('Content-Type: application/json');

$tipo = $_GET['tipo'] ?? 'profesor';

$endpoint = match($tipo) {
    'profesor' => '/nfc/get_fichajes_profesores',
    'alumno'   => '/nfc/get_fichajes_alumnos',
    default    => '/nfc/get_fichajes_profesores',
};

$payload = json_encode([
    "jsonrpc" => "2.0",
    "method"  => "call",
    "params"  => new stdClass()
]);

$context  = stream_context_create(['http' => [
    'header'        => "Content-Type: application/json\r\n",
    'method'        => 'POST',
    'content'       => $payload,
    'ignore_errors' => true,
    'timeout'       => 8
]]);

$response = @file_get_contents($ODOO_BASE . $endpoint, false, $context);

if ($response === false) {
    echo json_encode(['error' => 'No se pudo conectar con Odoo']);
} else {
    echo $response;
}
