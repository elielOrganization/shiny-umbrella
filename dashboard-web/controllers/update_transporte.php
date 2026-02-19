<?php
// controllers/update_transporte.php
header('Content-Type: application/json');

error_reporting(0);
ini_set('display_errors', 0);

try {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    $dni   = $input['dni'] ?? null;
    $valor = $input['valor'] ?? false;

    if (!$dni) {
        throw new Exception('DNI no recibido');
    }

    $odoo_url = "http://10.102.7.244:8069/nfc/update_transporte"; 

    $payload = json_encode([
        "jsonrpc" => "2.0",
        "method" => "call",
        "params" => [
            "dni"   => $dni,
            "permiso_transporte" => $valor
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

    if ($response === FALSE) {
        throw new Exception('Error de conexión con Odoo');
    }

    echo $response;

} catch (Exception $e) {
    echo json_encode([
        "jsonrpc" => "2.0",
        "error" => [
            "data" => ["message" => $e->getMessage()]
        ]
    ]);
}