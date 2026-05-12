<?php
// controllers/import_alumno.php
require_once __DIR__ . '/../config/odoo.php';

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

try {
    $odoo_url = $ODOO_BASE . "/nfc/import_alumnos";

    // ==========================================
    // PROCESAMIENTO
    // ==========================================
    
    // Leer el cuerpo de la peticiÃ³n (el JSON que envÃ­a el JS)
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if (!isset($input['csv_content'])) {
        throw new Exception('No se recibiÃ³ el campo csv_content');
    }

    $csv_content = $input['csv_content'];

    // Preparar los datos para Odoo
    $payload = json_encode([
        "jsonrpc" => "2.0",
        "method" => "call",
        "params" => [
            "csv_data" => $csv_content
        ]
    ]);

    // Configurar la peticiÃ³n HTTP (MÃ©todo nativo, sin cURL)
    $options = [
        'http' => [
            'header'  => "Content-Type: application/json\r\n" .
                         "Content-Length: " . strlen($payload) . "\r\n",
            'method'  => 'POST',
            'content' => $payload,
            'ignore_errors' => true // Para capturar errores del servidor Odoo
        ]
    ];

    $context  = stream_context_create($options);
    
    // Enviar peticiÃ³n
    $response = file_get_contents($odoo_url, false, $context);

    if ($response === FALSE) {
        throw new Exception("Error al conectar con la URL de Odoo. Revisa la IP y el puerto.");
    }

    // Devolver la respuesta de Odoo tal cual
    echo $response;

} catch (Exception $e) {
    // Si algo falla, devolvemos un JSON de error controlado
    http_response_code(500);
    echo json_encode([
        "jsonrpc" => "2.0",
        "error" => [
            "message" => $e->getMessage(),
            "code" => 500
        ]
    ]);
}
?>
