<?php
// controllers/assign_card.php

// Evitar errores visuales en la respuesta JSON
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

try {
    // 1. CONFIGURACIÓN (Pon tu IP de Odoo)
    $odoo_url = "http://10.102.7.212:8069/nfc/assign_card";

    // 2. Recibir datos del JavaScript
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if (!isset($input['uid']) || !isset($input['dni'])) {
        throw new Exception('Faltan datos: UID o DNI requeridos.');
    }

    // 3. Preparar JSON para Odoo
    $payload = json_encode([
        "jsonrpc" => "2.0",
        "method" => "call",
        "params" => [
            "uid" => $input['uid'],
            "dni" => $input['dni']
        ]
    ]);

    // 4. Enviar petición a Odoo
    $options = [
        'http' => [
            'header'  => "Content-Type: application/json\r\n" .
                         "Content-Length: " . strlen($payload) . "\r\n",
            'method'  => 'POST',
            'content' => $payload,
            'ignore_errors' => true
        ]
    ];

    $context  = stream_context_create($options);
    $response = file_get_contents($odoo_url, false, $context);

    if ($response === FALSE) {
        throw new Exception("No se pudo conectar con Odoo.");
    }

    // 5. Devolver respuesta
    echo $response;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "jsonrpc" => "2.0",
        "error" => [
            "message" => $e->getMessage()
        ]
    ]);
}
?>