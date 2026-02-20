<?php
header('Content-Type: application/json');
error_reporting(0); 
ini_set('display_errors', 0);

try {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if (!$input) {
        throw new Exception("No se recibieron datos en el servidor local.");
    }

    $odoo_url = "http://10.102.7.196:8069/nfc/create_alumno";

    $payload = json_encode([
        "jsonrpc" => "2.0",
        "method" => "call",
        "params" => [
            "nombre"           => $input['nombre'] ?? '',
            "apellido"        => $input['apellidos'] ?? '',
            "dni"              => $input['dni'] ?? '',
            "fecha_nacimiento" => $input['fecha_nacimiento'] ?? '',
            "grupo_clase"      => $input['grupo_clase'] ?? ''
        ]
    ]);

    // 5. Petición POST
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
        throw new Exception("Error de conexión con Odoo.");
    }

    // Devolvemos la respuesta de Odoo (status, message, id)
    echo $response;

} catch (Exception $e) {
    echo json_encode([
        "jsonrpc" => "2.0",
        "error" => ["data" => ["message" => $e->getMessage()]]
    ]);
}