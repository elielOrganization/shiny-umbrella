<?php
/**
 * Controlador update_profesor.php mejorado
 * * Intermediario entre frontend y Odoo 18. Incluye validaciÃ³n de respuesta
 * para evitar errores de parseo JSON en el frontend si Odoo devuelve HTML.
 */
require_once __DIR__ . '/../config/odoo.php';
header('Content-Type: application/json');

$inputData = json_decode(file_get_contents('php://input'), true);

if (!$inputData || !isset($inputData['id'])) {
    echo json_encode(['error' => 'Datos incompletos. Se requiere el ID del profesor.']);
    exit;
}

$odoo_url = $ODOO_BASE . "/nfc/update_persona";

$payload_array = [
    "jsonrpc" => "2.0",
    "method" => "call",
    "params" => [
        "dni" => $inputData['dni'] ?? '',
        "valores" => [
            "nombre" => $inputData['nombre'] ?? '',
            "apellido" => $inputData['apellidos'] ?? '',
            "departamento" => $inputData['departamento'] ?? ''
        ]
    ]
];

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($payload_array),
        'ignore_errors' => true // Permite leer la respuesta aunque el HTTP status sea 404 o 500
    ]
];

$context  = stream_context_create($options);
$response = file_get_contents($odoo_url, false, $context);

if ($response === FALSE) {
    echo json_encode(['error' => 'No se pudo conectar con el servidor PHP o la URL es inaccesible.']);
    exit;
}

/**
 * Valida si la respuesta obtenida de Odoo es un JSON vÃ¡lido.
 * Si es HTML (por ejemplo, un error 404 de Odoo), devuelve un JSON con el aviso.
 */
json_decode($response);
if (json_last_error() !== JSON_ERROR_NONE) {
    // Si llegamos aquÃ­, Odoo devolviÃ³ HTML (seguramente un 404 o un 500)
    echo json_encode([
        'error' => 'Odoo devolviÃ³ un formato no vÃ¡lido (HTML). Verifica que la ruta /nfc/update_profesor existe en el controlador Python de Odoo.',
        'odoo_raw_response' => substr($response, 0, 100) . '...' // Mostramos un fragmento para depurar
    ]);
    exit;
}

// Si es un JSON vÃ¡lido, lo devolvemos al frontend
echo $response;
