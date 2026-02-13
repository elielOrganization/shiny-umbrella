<?php
// controllers/update_generic.php
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$dni = $input['dni'] ?? null;
$campo = $input['campo'] ?? null; // permiso_transporte, permiso_salida, etc.
$valor = $input['valor'] ?? false;

if (!$dni || !$campo) {
    echo json_encode(['error' => 'Datos insuficientes']);
    exit;
}

$odoo_url = "http://TU-IP-ODOO:8069/nfc/update_alumno_fields"; 

$payload = json_encode([
    "jsonrpc" => "2.0",
    "method" => "call",
    "params" => [
        "dni" => $dni,
        "field" => $campo,
        "value" => $valor
    ]
]);

$ch = curl_init($odoo_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
curl_close($ch);

echo $response;